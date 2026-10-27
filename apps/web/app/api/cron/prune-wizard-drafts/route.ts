import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"

// Vercel cron (see vercel.json) — cron invocations are GET requests, so this
// must be a GET handler or the schedule silently never fires.
//
// WHAT THIS SWEEPS, and the one rule it must not break.
//
// An abandoned wizard draft is a row plus whatever photo its visitor picked,
// both written before anyone had an account. Most are abandoned: someone
// opened the wizard, got as far as a name, and closed the tab. Nothing ever
// collects those, so without this they accumulate for ever, photos included.
//
// A CLAIMED DRAFT IS NEVER TOUCHED. claimWizardDraft moves the photo under
// the organiser, and when that move fails it publishes with the drafts/ URL
// rather than refusing someone the favpoll they just signed up for. So a
// claimed row's file may still be the live photo of a published favpoll, and
// deleting it would blank the hero of something real. Claimed rows are kept
// for that reason, and because they are the double-submit guard.
//
// The row count is therefore bounded by favpolls actually created, which is
// a number the product wants to be large and the database will not notice.

/** Old enough that nobody is coming back: the draft cookie's own lifetime. */
const DRAFT_TTL_DAYS = 7

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(
    Date.now() - DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  // PAGINATED: PostgREST caps a select at 1,000 rows and says nothing about
  // it, so an unpaged sweep would quietly prune the first thousand and leave
  // the rest for ever, looking like it worked.
  const stale = await fetchAllRows<{ id: string; photo_path: string | null }>(
    (from, to) =>
      supabase
        .from("wizard_drafts")
        .select("id, photo_path")
        .is("claimed_at", null)
        .lt("updated_at", cutoff)
        .range(from, to)
  )

  if (stale.length === 0) return Response.json({ pruned: 0, photos: 0 })

  // Files first. A row deleted before its photo leaves the photo with
  // nothing pointing at it and no way to find it again; a photo deleted
  // before its row leaves a row whose photo_path is dead, which the next
  // pass tidies. Fail the cheaper way round.
  const paths = stale.map((d) => d.photo_path).filter((p): p is string => !!p)

  let photos = 0
  if (paths.length > 0) {
    const { data, error } = await supabase.storage
      .from("protagonists")
      .remove(paths)
    if (error) {
      console.error("[prune-wizard-drafts] storage error:", error.message)
    } else {
      photos = data?.length ?? 0
    }
  }

  const { error } = await supabase
    .from("wizard_drafts")
    .delete()
    .in(
      "id",
      stale.map((d) => d.id)
    )
    .is("claimed_at", null)

  if (error) {
    console.error("[prune-wizard-drafts] delete error:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ pruned: stale.length, photos })
}
