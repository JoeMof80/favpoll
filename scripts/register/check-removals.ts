/**
 * scripts/register/check-removals.ts
 * ---------------------------------------------------------------------------
 * THE REMOVAL CHECK (references/charity-profiles-2026-09-27.md §3). Removal
 * is not staleness: a charity that has left the register is WRONG, not old.
 * Staleness is compared on the derived fields and regenerated lazily; a
 * removal is read at LOAD TIME, because the one failure here with real
 * consequences is money moving to a deregistered charity.
 *
 * Reads register_account_removals() (migration 20261004140000): every
 * ACCOUNT charity whose standing in the mirror is not a clean Registered,
 * with the money pointing at it. load-register.ts runs this at the end of
 * every load; it also runs on its own, against the mirror already in the
 * database — no extract needed.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/register/check-removals.ts
 *
 * Exits 1 when an account charity has been removed or has gone from the
 * extract, so a cron can scream; the loader prints the same report but
 * never fails a good load over it.
 * ---------------------------------------------------------------------------
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";

export type RemovalVerdict = "removed" | "gone" | "unknown";

export type RemovalRow = {
  charity_id: string;
  name: string;
  registered_number: string | null;
  verdict: RemovalVerdict;
  is_active: boolean;
  consent_status: string | null;
  register_name: string | null;
  register_status: string | null;
  removed_on: string | null;
  extract_date: string | null;
  latest_extract: string | null;
  favpoll_count: number;
  open_count: number;
  raised: number;
  pending_disbursements: number;
  pending_amount: number;
  gift_aid_declarations: number;
};

export async function checkRemovals(
  supabase: SupabaseClient,
): Promise<RemovalRow[]> {
  const { data, error } = await supabase.rpc("register_account_removals");
  if (error) throw new Error(`register_account_removals: ${error.message}`);
  return (data ?? []) as RemovalRow[];
}

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** What is at stake on one account, in one line — the reason a removal is
 *  urgent rather than tidy. Silent when nothing points at it. */
function stake(row: RemovalRow): string {
  const parts: string[] = [];
  if (row.favpoll_count > 0)
    parts.push(
      `${row.favpoll_count} favpoll${row.favpoll_count === 1 ? "" : "s"}` +
        (row.open_count > 0 ? ` (${row.open_count} still open)` : ""),
    );
  if (row.raised > 0) parts.push(`${money(row.raised)} raised`);
  if (row.pending_disbursements > 0)
    parts.push(
      `${row.pending_disbursements} payout${row.pending_disbursements === 1 ? "" : "s"} pending, ${money(row.pending_amount)}`,
    );
  if (row.gift_aid_declarations > 0)
    parts.push(`${row.gift_aid_declarations} Gift Aid declarations`);
  return parts.length === 0 ? "nothing points at it yet" : parts.join(" · ");
}

const named = (row: RemovalRow) =>
  `${row.name}${row.registered_number ? ` (${row.registered_number})` : ""}`;

/** Prints the report. Returns true when something needs a human: an
 *  account removed from the register, or gone from the latest extract. */
export function reportRemovals(rows: RemovalRow[]): boolean {
  const removed = rows.filter((r) => r.verdict === "removed");
  const gone = rows.filter((r) => r.verdict === "gone");
  const unknown = rows.filter((r) => r.verdict === "unknown");

  if (removed.length > 0) {
    console.log("");
    console.log(
      "!! REMOVED FROM THE REGISTER — accounts pointing at a charity the Commission has deregistered:",
    );
    for (const r of removed) {
      console.log(
        `   ${named(r)} — ${r.register_status ?? "not Registered"}${r.removed_on ? ` on ${r.removed_on}` : ""}`,
      );
      console.log(`     register name: ${r.register_name ?? "—"}`);
      console.log(
        `     ${stake(r)}${r.is_active ? "" : " · already inactive"}${
          r.consent_status ? ` · consent ${r.consent_status}` : ""
        }`,
      );
    }
    console.log(
      "   Money must not move to these. Deactivate the account, then settle by hand.",
    );
  }

  if (gone.length > 0) {
    console.log("");
    console.log(
      `!  GONE FROM THE LATEST EXTRACT (${gone[0].latest_extract ?? "—"}) — a deregistration with no Removed row, or a load that stopped half way:`,
    );
    for (const r of gone) {
      console.log(
        `   ${named(r)} — last seen in the ${r.extract_date ?? "—"} extract · ${stake(r)}`,
      );
    }
    console.log(
      "   Re-run the load; if it persists, check the number by hand.",
    );
  }

  if (unknown.length > 0) {
    // Quiet by design: a charity registered since the extract has no
    // mirror row and verifies against the live API perfectly well.
    console.log("");
    console.log(
      `   no mirror row (registered since the extract, a linked number, or a typo): ${unknown
        .map(named)
        .join(", ")}`,
    );
  }

  if (rows.length === 0) {
    console.log("every account charity is Registered on the mirror");
  }

  return removed.length > 0 || gone.length > 0;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const rows = await checkRemovals(supabase);
  if (reportRemovals(rows)) process.exit(1);
}

// Run as a script; silent when imported by the loader.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
