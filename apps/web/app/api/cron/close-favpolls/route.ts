import { createAdminClient } from "@/lib/supabase/admin"
import { sendFavpollClosed } from "@/lib/email"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Find all events that have passed closes_at but haven't been closed yet
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

  // Sum non-withdrawn pledges per favpoll
  const { data: pledgeTotals } = await supabase
    .from("pledges")
    .select("favpoll_polls!inner(favpoll_id), total_amount")
    .in("favpoll_polls.favpoll_id", favpollIds)
    .is("withdrawn_at", null)

  const raisedByFavpoll: Record<string, number> = {}
  for (const row of pledgeTotals ?? []) {
    const favpollId = (row.favpoll_polls as unknown as { favpoll_id: string })
      .favpoll_id
    raisedByFavpoll[favpollId] =
      (raisedByFavpoll[favpollId] ?? 0) + (row.total_amount ?? 0)
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

    const { error: updateErr } = await supabase
      .from("favpolls")
      .update({ closed_at: now, total_raised: totalRaised })
      .eq("id", favpoll.id)

    if (updateErr) {
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
