/**
 * e2e/global-setup.ts
 *
 * Runs once before all Playwright tests. Creates a stable, open e2e test
 * favpoll in Supabase that the reveal-after-pledge test pledges against.
 *
 * The test favpoll:
 *   - protagonist: "E2E Playwright Test" (memorial, individual)
 *   - topic: Colour (finite — all canonical colour items linked)
 *   - charity: Marie Curie
 *   - personal_reveal: the known reveal text asserted in the spec
 *   - closes_at: 90 days from now (always open when tests run)
 *   - is_listed: false (not shown on /favpolls; reachable by ID)
 *   - created_by: "user_e2e_playwright" (identifies e2e-owned rows)
 *
 * Idempotent: checks for an existing row before inserting.
 * Does NOT clean up after tests; the row is harmless on staging.
 *
 * Writes fixture IDs to e2e/.state/fixtures.json for use in specs.
 *
 * Requirements:
 *   NEXT_PUBLIC_SUPABASE_URL   — staging Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — staging service role key (bypasses RLS)
 *   Reference data must be seeded (pnpm seed / seed-exemplars) so that the
 *   Colour topic and Marie Curie charity exist.
 */

import { createClient } from "@supabase/supabase-js"
import { mkdirSync, writeFileSync } from "fs"
import { resolve } from "path"

const E2E_USER_ID = "user_e2e_playwright"
const PROTAGONIST_NAME = "E2E Playwright Test"

// This exact reveal text is asserted in reveal-after-pledge.spec.ts.
// Change it here AND in the spec if you ever need to update it.
export const E2E_REVEAL_TEXT =
  "Cornflower blue. She kept a pot of cornflowers on the windowsill every summer."

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "\n[e2e/global-setup] ⚠  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY " +
        "not set.\n" +
        "  The reveal-after-pledge test will fail without a valid test favpoll.\n" +
        "  Set these env vars (from .env.local locally, from GitHub secrets in CI).\n"
    )
    return
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Idempotency check ───────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("favpolls")
    .select("id, favpoll_polls(id)")
    .eq("created_by", E2E_USER_ID)
    .limit(1)
    .maybeSingle()

  if (existing) {
    const polls = existing.favpoll_polls as { id: string }[] | null
    const pollId = polls && polls.length > 0 ? polls[0].id : null

    // Always extend closes_at so the favpoll is never stale-closed when the
    // test suite runs against a long-lived staging row.
    const closesAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from("favpolls")
      .update({ closes_at: closesAt })
      .eq("id", existing.id)

    writeState({
      openFavpollId: existing.id,
      openPollId: pollId,
      revealText: E2E_REVEAL_TEXT,
    })
    console.log(
      `[e2e/global-setup] ✓ Reusing existing test favpoll: ${existing.id} (closes_at extended)`
    )
    return
  }

  // ── Ensure seed user exists (FK requirement on protagonists.created_by) ────
  await supabase.from("users").upsert({
    id: E2E_USER_ID,
    email: "e2e-playwright@example.test",
    display_name: "E2E Playwright",
  })

  // ── Resolve reference data ──────────────────────────────────────────────────
  const { data: topic, error: topicErr } = await supabase
    .from("topics")
    .select("id, favourites(id, label)")
    .eq("title", "Colour")
    .eq("is_active", true)
    .single()

  if (topicErr || !topic) {
    throw new Error(
      `[e2e/global-setup] Colour topic not found — run pnpm seed first. ` +
        `Supabase error: ${topicErr?.message}`
    )
  }

  const { data: charity, error: charityErr } = await supabase
    .from("charities")
    .select("id")
    .eq("name", "Marie Curie")
    .eq("is_active", true)
    .single()

  if (charityErr || !charity) {
    throw new Error(
      `[e2e/global-setup] Marie Curie charity not found — run pnpm seed first. ` +
        `Supabase error: ${charityErr?.message}`
    )
  }

  // ── Protagonist ─────────────────────────────────────────────────────────────
  const { data: protagonist, error: protErr } = await supabase
    .from("protagonists")
    .insert({
      name: PROTAGONIST_NAME,
      context: "1940 – 2024",
      about: "A beloved person honoured by the e2e test suite.",
      created_by: E2E_USER_ID,
    })
    .select("id")
    .single()

  if (protErr || !protagonist) {
    throw new Error(
      `[e2e/global-setup] Protagonist insert failed: ${protErr?.message}`
    )
  }

  // ── Favpoll (open — closes 90 days from now) ────────────────────────────────
  const closesAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: favpoll, error: favpollErr } = await supabase
    .from("favpolls")
    .insert({
      protagonist_id: protagonist.id,
      category: "memorial",
      grouping: "individual",
      subject: "someone",
      is_listed: false,
      market: "en-GB",
      created_by: E2E_USER_ID,
      closes_at: closesAt,
      is_private: false,
    })
    .select("id")
    .single()

  if (favpollErr || !favpoll) {
    throw new Error(
      `[e2e/global-setup] Favpoll insert failed: ${favpollErr?.message}`
    )
  }

  // ── Favpoll charity ─────────────────────────────────────────────────────────
  await supabase.from("favpoll_charities").insert({
    favpoll_id: favpoll.id,
    charity_id: charity.id,
  })

  // ── Pot (mandatory per project decision — always created) ───────────────────
  await supabase.from("favpoll_pots").insert({
    favpoll_id: favpoll.id,
    created_by: E2E_USER_ID,
    total_deposited: 0,
  })

  // ── Poll with known reveal text ─────────────────────────────────────────────
  const { data: poll, error: pollErr } = await supabase
    .from("favpoll_polls")
    .insert({
      favpoll_id: favpoll.id,
      topic_id: topic.id,
      personal_reveal: E2E_REVEAL_TEXT,
    })
    .select("id")
    .single()

  if (pollErr || !poll) {
    throw new Error(
      `[e2e/global-setup] Poll insert failed: ${pollErr?.message}`
    )
  }

  // ── Link all Colour favourites (finite topic — all items always present) ────
  const favourites =
    (topic as { favourites: { id: string }[] }).favourites ?? []
  if (favourites.length > 0) {
    const { error: itemsErr } = await supabase
      .from("favpoll_poll_favourites")
      .insert(
        favourites.map((f) => ({
          favpoll_poll_id: poll.id,
          favourite_id: f.id,
        }))
      )
    if (itemsErr) {
      console.warn(
        `[e2e/global-setup] Warning: favpoll_poll_favourites insert partial failure: ${itemsErr.message}`
      )
    }
  }

  writeState({
    openFavpollId: favpoll.id,
    openPollId: poll.id,
    revealText: E2E_REVEAL_TEXT,
  })
  console.log(`[e2e/global-setup] ✓ Created test favpoll: ${favpoll.id}`)
}

type State = {
  openFavpollId: string
  openPollId: string | null
  revealText: string
}

function writeState(state: State) {
  const dir = resolve(process.cwd(), "e2e/.state")
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, "fixtures.json"), JSON.stringify(state, null, 2))
}
