const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
function env(file) {
  return Object.fromEntries(fs.readFileSync(file, "utf8").split("\n").filter(l => l.includes("=") && !l.startsWith("#")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
}
// [migration, kind, table/fn, column?, expectAbsent?]
const PROBES = [
  ["20260806100000_favpoll_short_code", "col", "favpolls", "short_code"],
  ["20260813100000_favpoll_allow_guest_items", "col", "favpolls", "allow_guest_items"],
  ["20260906170000_appeal_goal", "col", "appeals", "goal_amount"],
  ["20260907190000_charity_consent", "col", "charities", "consent_status"],
  ["20260908090000_charity_register_contact", "col", "charities", "registered_email"],
  ["20260915120000_gift_aid_declarations", "table", "gift_aid_declarations"],
  ["20260918100000_generated_drafts_display_name", "col", "generated_drafts", "display_name"],
  ["20260918120000_personal_note_rename (favpoll_polls)", "col", "favpoll_polls", "personal_note"],
  ["20260918120000_personal_note_rename (generated_drafts)", "col", "generated_drafts", "note"],
  ["20260921120000_guest_book_display (favpolls)", "col", "favpolls", "show_guest_amounts"],
  ["20260921120000_guest_book_display (pledges)", "col", "pledges", "guest_book_display"],
  ["20260921140000_pledge_message", "col", "pledges", "message"],
  ["20260923060000_exclude_exemplars_from_totals (fn exists only)", "rpc", "all_charity_stats", {}],
  ["20260923120000_charity_purpose", "col", "charities", "classification"],
  ["20260924000000_charity_cause_family", "col", "charities", "cause_family"],
  ["20260925090000_charity_register_enrichment", "col", "charities", "grant_making"],
  ["20260926120000_charity_perfect_topic", "col", "charities", "perfect_topic_id"],
  ["20260927120000_charity_signature_events", "col", "charities", "signature_events"],
  ["20260927150000_register_charities", "table", "register_charities"],
  ["20260927160000_register_search (name_key)", "col", "register_charities", "name_key"],
  ["20260927170000_register_search_index (mat view)", "table", "register_search_rows"],
  ["20260927170000_register_search_index (count_register)", "rpc", "count_register", { q: "zzqx" }],
  ["20260928090000_topic_subsets", "table", "topic_subsets"],
  ["20260928090000_topic_subsets (items)", "table", "topic_subset_items"],
  ["20260928120000_topic_subset_status", "col", "topic_subsets", "status"],
  ["20260928150000_subset_totals", "table", "topic_subset_totals"],
  ["20260928180000_charity_perfect_subset_suggested", "col", "charities", "perfect_subset_suggested_id"],
  ["20260928200000_drop_perfect_topic_items (should be ABSENT)", "col", "charities", "perfect_topic_items", true],
  ["20260928210000_topics_is_listed", "col", "topics", "is_listed"],
  ["(closed #985) favpoll_polls.outcome (should be ABSENT)", "col", "favpoll_polls", "outcome", true],
  ["(open #987) favpolls.picks_suspended_at (not yet)", "col", "favpolls", "picks_suspended_at", true],
];
async function probe(s, p) {
  const [, kind, name, col, expectAbsent] = p;
  let present;
  if (kind === "col") { const r = await s.from(name).select(col).limit(1); present = !r.error; if (r.error && !/column|does not exist|schema cache/i.test(r.error.message)) return `?? ${r.error.message}`; }
  else if (kind === "table") { const r = await s.from(name).select("*").limit(1); present = !r.error; if (r.error && !/relation|does not exist|schema cache|Could not find/i.test(r.error.message)) return `?? ${r.error.message}`; }
  else { const r = await s.rpc(name, col); present = !(r.error && /Could not find|does not exist|schema cache/i.test(r.error.message)); if (r.error && present) return `present (fn errored: ${r.error.message.slice(0,60)})`; }
  if (expectAbsent) return present ? "PRESENT (unexpected)" : "absent (ok)";
  return present ? "ok" : "MISSING";
}
(async () => {
  for (const [label, file] of [["PROD", ".env.production-web"], ["STAGING", ".env.staging-web"]]) {
    const e = env(file);
    const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
    console.log(`=== ${label} (${e.NEXT_PUBLIC_SUPABASE_URL})`);
    for (const p of PROBES) console.log((await probe(s, p)).padEnd(24), p[0]);
  }
})();
