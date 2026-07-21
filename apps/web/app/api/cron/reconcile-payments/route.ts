import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"

// Hourly reconciliation (see vercel.json) — marks each webhook-recorded
// succeeded PaymentIntent (stripe_payment_events) off against the row that
// recorded it (a pledge or a pot top-up), and REPORTS any still unmatched
// after the grace period: those are charged-but-unrecorded payments (the
// client died between confirmPayment and savePledge) needing a manual
// refund or recovery. Visible, never silent.
//
// Vercel cron invocations are GET requests — this must stay a GET handler.

const GRACE_MS = 30 * 60 * 1000 // savePledge follows confirmPayment within seconds

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Paginated — the unreconciled backlog must never silently truncate
  let events: {
    payment_intent_id: string
    amount_pence: number
    received_at: string
  }[]
  try {
    events = await fetchAllRows((from, to) =>
      supabase
        .from("stripe_payment_events")
        .select("payment_intent_id, amount_pence, received_at")
        .is("reconciled_at", null)
        .range(from, to)
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed"
    console.error("[reconcile-payments] fetch error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (events.length === 0) {
    return NextResponse.json({ reconciled: 0, unmatched: 0 })
  }

  const piIds = events.map((e) => e.payment_intent_id)

  const { data: pledgeRows } = await supabase
    .from("pledges")
    .select("payment_intent_id")
    .in("payment_intent_id", piIds)
  const pledged = new Set(
    (pledgeRows ?? []).map((r) => r.payment_intent_id as string)
  )

  const { data: topUpRows } = await supabase
    .from("pot_topups")
    .select("payment_intent_id")
    .in("payment_intent_id", piIds)
  const toppedUp = new Set(
    (topUpRows ?? []).map((r) => r.payment_intent_id as string)
  )

  const now = new Date().toISOString()

  const pledgeMatched = piIds.filter((id) => pledged.has(id))
  if (pledgeMatched.length > 0) {
    await supabase
      .from("stripe_payment_events")
      .update({ reconciled_at: now, reconciled_kind: "pledge" })
      .in("payment_intent_id", pledgeMatched)
  }

  const topUpMatched = piIds.filter(
    (id) => !pledged.has(id) && toppedUp.has(id)
  )
  if (topUpMatched.length > 0) {
    await supabase
      .from("stripe_payment_events")
      .update({ reconciled_at: now, reconciled_kind: "pot_topup" })
      .in("payment_intent_id", topUpMatched)
  }

  // Still unmatched AND older than the grace period → charged with nothing
  // recorded. Surfaced in the response and the logs for manual follow-up.
  const cutoff = Date.now() - GRACE_MS
  const unmatched = events
    .filter(
      (e) =>
        !pledged.has(e.payment_intent_id) &&
        !toppedUp.has(e.payment_intent_id) &&
        new Date(e.received_at).getTime() < cutoff
    )
    .map((e) => ({
      payment_intent_id: e.payment_intent_id,
      amount_pence: e.amount_pence,
      received_at: e.received_at,
    }))

  if (unmatched.length > 0) {
    console.error(
      `[reconcile-payments] ${unmatched.length} charged-but-unrecorded payment(s):`,
      unmatched.map((u) => u.payment_intent_id).join(", ")
    )
  }

  return NextResponse.json({
    reconciled: pledgeMatched.length + topUpMatched.length,
    unmatched: unmatched.length,
    unmatchedDetails: unmatched.length ? unmatched : undefined,
  })
}
