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
 * Requirements: same env as global-setup (NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY) — skips gracefully without them.
 */

import { createClient } from "@supabase/supabase-js"

export default async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "[e2e/global-teardown] ⚠ Supabase env not set — skipping E2E favpoll unlisting."
    )
    return
  }

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

  const unlisted = (causeRows?.length ?? 0) + protagonistRows.length
  console.log(
    `[e2e/global-teardown] ✓ Unlisted ${unlisted} E2E favpoll${unlisted === 1 ? "" : "s"}`
  )
}
