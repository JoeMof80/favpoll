import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { sendFavpollClosed } from "@/lib/email"
import { disbursementProvider, splitEqually } from "@/lib/disbursement"

// Vercel cron (see vercel.json) — cron invocations are GET requests, so this
// must be a GET handler or the schedule silently never fires.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Find all favpolls that have passed closes_at but haven't been closed yet
  const { data: favpolls, error } = await supabase
    .from("favpolls")
    .select("id, created_by, protagonists!favpolls_protagonist_id_fkey(name)")
    .lte("closes_at", now)
    .is("closed_at", null)

  if (error) {
    console.error("[close-favpolls] fetch error:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!favpolls || favpolls.length === 0) {
    return Response.json({ closed: 0 })
  }

  const favpollIds = favpolls.map((e) => e.id)

  // Sum non-withdrawn pledges per favpoll — PAGINATED: this is the
  // settlement figure (total_raised); PostgREST's silent 1,000-row cap
  // would under-count a popular favpoll's close.
  const pledgeTotals = await fetchAllRows<{
    favpoll_polls: unknown
    total_amount: number | null
  }>((from, to) =>
    supabase
      .from("pledges")
      .select("favpoll_polls!inner(favpoll_id), total_amount")
      .in("favpoll_polls.favpoll_id", favpollIds)
      .is("withdrawn_at", null)
      .range(from, to)
  )

  const raisedByFavpoll: Record<string, number> = {}
  for (const row of pledgeTotals) {
    const favpollId = (row.favpoll_polls as unknown as { favpoll_id: string })
      .favpoll_id
    raisedByFavpoll[favpollId] =
      (raisedByFavpoll[favpollId] ?? 0) + (row.total_amount ?? 0)
  }

  // Charities per favpoll — proceeds are split equally across them on close.
  const { data: charityRows } = await supabase
    .from("favpoll_charities")
    .select("favpoll_id, charities(id, registered_number)")
    .in("favpoll_id", favpollIds)

  const charitiesByFavpoll: Record<
    string,
    { id: string; registered_number: string | null }[]
  > = {}
  for (const row of charityRows ?? []) {
    const favpollId = (row as unknown as { favpoll_id: string }).favpoll_id
    const charity = (
      row as unknown as {
        charities: { id: string; registered_number: string | null } | null
      }
    ).charities
    if (!charity) continue
    ;(charitiesByFavpoll[favpollId] ??= []).push(charity)
  }

  // Get organiser emails
  const userIds = [...new Set(favpolls.map((e) => e.created_by))]
  const { data: users } = await supabase
    .from("users")
    .select("id, email, display_name")
    .in("id", userIds)

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]))

  let closed = 0
  const errors: string[] = []

  for (const favpoll of favpolls) {
    const totalRaised = raisedByFavpoll[favpoll.id] ?? 0
    const protagonistName =
      (favpoll.protagonists as unknown as { name: string } | null)?.name ??
      "someone special"

    // ORDER MATTERS (2026-07-21): disbursements are written FIRST and the
    // close marker LAST, with every step idempotent — so any failure leaves
    // closed_at null, the favpoll is re-selected next run, and the re-run is
    // duplicate-safe. Previously the close was written first: a ledger
    // failure left the favpoll closed and never re-selected — the payout
    // silently dropped.
    //
    // Idempotency: the ledger upsert ignores duplicates on
    // (favpoll_id, charity_id); the provider is keyed by a deterministic
    // reference (a real provider must treat it as an idempotency key — the
    // no-op provider trivially does).
    const charities = charitiesByFavpoll[favpoll.id] ?? []
    if (totalRaised > 0 && charities.length > 0) {
      const registeredById = Object.fromEntries(
        charities.map((c) => [c.id, c.registered_number])
      )
      const ledgerRows = []
      for (const split of splitEqually(
        totalRaised,
        charities.map((c) => c.id)
      )) {
        const reference = `${favpoll.id}:${split.charityId}`
        const result = await disbursementProvider.disburse({
          favpollId: favpoll.id,
          charityId: split.charityId,
          registeredNumber: registeredById[split.charityId] ?? null,
          amount: split.amount,
          reference,
        })
        ledgerRows.push({
          favpoll_id: favpoll.id,
          charity_id: split.charityId,
          amount: split.amount,
          provider: disbursementProvider.name,
          provider_ref: result.providerRef,
          status: result.status,
          reason: result.reason ?? null,
        })
      }

      const { error: disburseErr } = await supabase
        .from("disbursements")
        .upsert(ledgerRows, {
          onConflict: "favpoll_id,charity_id",
          ignoreDuplicates: true,
        })

      if (disburseErr) {
        // Leave the favpoll OPEN so the next run retries the whole flow.
        console.error(
          `[close-favpolls] disbursement ledger failed for ${favpoll.id}:`,
          disburseErr.message
        )
        errors.push(`${favpoll.id} disbursement: ${disburseErr.message}`)
        continue
      }
    }

    const { error: updateErr } = await supabase
      .from("favpolls")
      .update({ closed_at: now, total_raised: totalRaised })
      .eq("id", favpoll.id)

    if (updateErr) {
      // Disbursements exist but the favpoll stays open — next run re-splits
      // identically, the upsert ignores the duplicates, and the close is
      // retried.
      errors.push(`${favpoll.id}: ${updateErr.message}`)
      continue
    }

    const organiser = userMap[favpoll.created_by]
    if (organiser?.email) {
      try {
        await sendFavpollClosed({
          to: organiser.email,
          protagonistName,
          totalRaised,
          favpollId: favpoll.id,
        })
      } catch (emailErr) {
        // Don't fail the whole batch for an email error
        console.error(
          `[close-favpolls] email failed for ${favpoll.id}:`,
          emailErr
        )
      }
    }

    closed++
  }

  return Response.json({ closed, errors: errors.length ? errors : undefined })
}
