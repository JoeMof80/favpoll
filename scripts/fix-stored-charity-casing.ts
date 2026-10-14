/**
 * scripts/fix-stored-charity-casing.ts
 * ---------------------------------------------------------------------------
 * Fixing titleCaseCharityName never rewrites the rows it was fixed for — the
 * stored `charities.name` is what an admin typed and stays authoritative. So
 * when the function improves, stored names quietly fall out of step with it,
 * and nobody notices because nothing compares them.
 *
 * The /outreach preview compares them, because the stored name goes into the
 * email subject verbatim. On production it found exactly two, and the
 * register's own prose settles both:
 *
 *   1196070  "Foodbank At Saint Matthew's, Redhill"
 *         →  "Foodbank at Saint Matthew's, Redhill"
 *            "at" is a connecting word inside the name (MINOR_WORDS).
 *
 *   1163123  "MAC Bevan Charitable Trust"
 *         →  "Mac Bevan Charitable Trust"
 *            I had this down as initials and was wrong: the register's
 *            activities text, written by the charity, reads "Mac Bevan offers
 *            grants and financial support...". Their acronym is MBCT, which
 *            is their other registered name.
 *
 * Founder's call, 2026-10-15, on being shown both.
 *
 * Run on each database, from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/fix-stored-charity-casing.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/fix-stored-charity-casing.ts
 *
 * Idempotent and NARROW BY DESIGN: it matches on the exact wrong string, so
 * it cannot touch a name an admin has since edited, and re-running does
 * nothing. It deliberately does NOT title-case every row — that would be the
 * function rewriting the catalogue, which is the thing we do not do.
 * --dry-run says what it would change.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");

const FIXES = [
  {
    registered_number: "1196070",
    from: "Foodbank At Saint Matthew's, Redhill",
    to: "Foodbank at Saint Matthew's, Redhill",
  },
  {
    registered_number: "1163123",
    from: "MAC Bevan Charitable Trust",
    to: "Mac Bevan Charitable Trust",
  },
];

async function main() {
  let changed = 0;
  for (const fix of FIXES) {
    const { data: rows, error } = await supabase
      .from("charities")
      .select("id, name")
      .eq("registered_number", fix.registered_number);
    if (error) throw new Error(error.message);

    const row = (rows ?? [])[0];
    if (!row) {
      console.log(`  – ${fix.registered_number}: not in this database.`);
      continue;
    }
    if (row.name === fix.to) {
      console.log(`  – ${fix.registered_number}: already "${fix.to}".`);
      continue;
    }
    if (row.name !== fix.from) {
      // Someone has edited it since. Their wording wins over this script's.
      console.log(
        `  ! ${fix.registered_number}: holds "${row.name}", not the string ` +
          `this script was written for. LEFT ALONE.`,
      );
      continue;
    }
    if (DRY) {
      console.log(`  → would set "${fix.from}" to "${fix.to}"`);
      changed++;
      continue;
    }
    const { error: upErr } = await supabase
      .from("charities")
      .update({ name: fix.to })
      .eq("id", row.id);
    if (upErr) throw new Error(upErr.message);
    console.log(`  ✓ "${fix.from}" → "${fix.to}"`);
    changed++;
  }
  console.log(DRY ? `${changed} would change.` : `${changed} changed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
