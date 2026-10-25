/**
 * e2e/global-teardown.ts
 *
 * Runs once after all Playwright tests. Unlists every favpoll the run
 * created (cause_label or protagonist name beginning "E2E") so test débris
 * never surfaces on the public /favpolls page or the landing carousel.
 *
 * Unlist, not delete: the wizard specs assert listing behaviour DURING the
 * run (cause → appears on /favpolls; memorial → doesn't), so rows must stay
 * intact while tests execute — and keeping them afterwards preserves the
 * evidence trail of a run. The global-setup fixture is created unlisted
 * already; this also sweeps up rows left behind by previously failed runs.
 *
 * AND THEN IT PRUNES (2026-10-25). Keeping the evidence trail was right;
 * never deciding when to stop keeping it was not. By October staging held
 * 199 E2E favpolls against one real one (founder: "all of the favpolls in
 * the admin are E2E tests except Michael Mensah"). Anything E2E older than
 * PRUNE_AFTER_DAYS is deleted here, so the last week of runs stays
 * inspectable and the archaeology goes. The delete cascades to the row's
 * polls, pledges and guest-book entries, which is what we want for débris —
 * and it is why this never runs without the E2E name pattern.
 *
 * Requirements: same env as global-setup (NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY) — skips gracefully without them.
 */

import { createClient } from "@supabase/supabase-js"

/** How much evidence trail is worth keeping. A week covers "what did
 *  yesterday's failing run leave behind" without becoming an archive. */
const PRUNE_AFTER_DAYS = 7

export default async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "[e2e/global-teardown] ⚠ Supabase env not set — skipping E2E favpoll unlisting."
    )
    return
  }

  // NAME THE DATABASE BEING SWEPT (2026-08-26). This teardown's credentials
  // are pinned to staging by the CI job, and for months the browser was
  // hitting PRODUCTION on every push to main — so it swept a database the
  // tests had never touched and reported "Unlisted 0" as though clean.
  // Silence and success looked identical. The job is pull-request-only now,
  // but the log should always say WHICH project it cleaned.
  const projectRef = supabaseUrl.replace(/^https:\/\//, "").split(".")[0]
  console.log(`[e2e/global-teardown] Sweeping Supabase project: ${projectRef}`)

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Cause favpolls: the E2E name lives on cause_label
  const { data: causeRows } = await supabase
    .from("favpolls")
    .update({ is_listed: false })
    .like("cause_label", "E2E%")
    .eq("is_listed", true)
    .select("id")

  // Protagonist favpolls: the E2E name lives on the protagonist
  const { data: e2eProtagonists } = await supabase
    .from("protagonists")
    .select("id")
    .like("name", "E2E%")

  let protagonistRows: { id: string }[] = []
  const protagonistIds = (e2eProtagonists ?? []).map((p) => p.id)
  if (protagonistIds.length > 0) {
    const { data } = await supabase
      .from("favpolls")
      .update({ is_listed: false })
      .in("protagonist_id", protagonistIds)
      .eq("is_listed", true)
      .select("id")
    protagonistRows = data ?? []
  }

  // ── Prune the old ones ────────────────────────────────────────────────
  const cutoff = new Date(
    Date.now() - PRUNE_AFTER_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  const staleIds = new Set<string>()
  const { data: staleCause } = await supabase
    .from("favpolls")
    .select("id")
    .like("cause_label", "E2E%")
    .lt("created_at", cutoff)
  for (const r of staleCause ?? []) staleIds.add(r.id)

  if (protagonistIds.length > 0) {
    const { data: staleProtagonist } = await supabase
      .from("favpolls")
      .select("id")
      .in("protagonist_id", protagonistIds)
      .lt("created_at", cutoff)
    for (const r of staleProtagonist ?? []) staleIds.add(r.id)
  }

  if (staleIds.size > 0) {
    const ids = [...staleIds]
    let deleted = 0
    for (let i = 0; i < ids.length; i += 100) {
      const { error } = await supabase
        .from("favpolls")
        .delete()
        .in("id", ids.slice(i, i + 100))
      if (error) {
        console.warn(`[e2e/global-teardown] ⚠ prune failed: ${error.message}`)
        break
      }
      deleted += ids.slice(i, i + 100).length
    }
    console.log(
      `[e2e/global-teardown] ✓ Pruned ${deleted} E2E favpoll${deleted === 1 ? "" : "s"} older than ${PRUNE_AFTER_DAYS} days`
    )
  }

  const unlisted = (causeRows?.length ?? 0) + protagonistRows.length
  console.log(
    `[e2e/global-teardown] ✓ Unlisted ${unlisted} E2E favpoll${unlisted === 1 ? "" : "s"} in ${projectRef}`
  )
  // The warning used to fire whenever nothing was unlisted — which is the
  // NORMAL state, because global-setup creates its fixture unlisted and a
  // clean previous run leaves nothing behind. It cried wolf on most runs.
  // The signal that actually means "wrong database" is finding no E2E rows
  // AT ALL, listed or not.
  if (unlisted === 0 && staleIds.size === 0) {
    const { count } = await supabase
      .from("favpolls")
      .select("id", { count: "exact", head: true })
      .like("cause_label", "E2E%")
    if ((count ?? 0) === 0 && protagonistIds.length === 0) {
      console.warn(
        "[e2e/global-teardown] ⚠ No E2E favpolls here at all. If the suite " +
          "published any this run, they are in a DIFFERENT database from " +
          "the one swept above — check PLAYWRIGHT_BASE_URL against these " +
          "credentials."
      )
    }
  }
}
