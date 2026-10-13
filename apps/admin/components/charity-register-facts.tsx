// WHAT THE REGISTER SAYS, beside what the account claims.
//
// register_charities holds the Commission's whole picture of every charity
// — status, income, address, when it registered — and admin rendered none
// of it. The row showed the account's own name and number with nothing to
// check them against, so a number pointing at the wrong charity looked
// exactly like one pointing at the right one.
//
// THAT IS NOT HYPOTHETICAL. Dogs Trust pointed at 227523, "DOGS TRUST
// LEGACY" — the old National Canine Defence League number that most sources
// still quote — instead of 1167663, "DOGS TRUST", the operating CIO. It had
// been wrong since the account was created and took a cron-secret
// investigation on 2026-10-05 to find.
//
// #1020 already shows the register's NAME when it differs from ours, which
// would have caught that one. This adds the rest of the picture:
//   - income (£67m against £143m) sizes the charity, and a wrong number
//     usually points at a much smaller husk of the real thing;
//   - the registration year (1963 against 2016) exposes a CIO that
//     re-registered and left its old shell behind;
//   - the place is the only thing that tells four St Luke's Hospices apart,
//     because their names and objects will not.
//
// IT IS NOT AN ALARM. RegisterRemovals already raises removals above the
// table with the stake attached, and its UnknownLine is quiet by design —
// a charity registered since the extract has no mirror row and verifies
// against the live API perfectly well. So a missing row says nothing here
// rather than contradicting it; the only badge is the removal, repeated
// because the expanded row is where Deactivate actually is.

import { StatusBadge } from "@/components/ui/status-badge";

/** The register publishes whole pounds — up to nine digits, which cannot
 *  sit in a row. The magnitude is what the eye checks, never the pennies. */
function money(pounds: number): string {
  if (pounds < 1_000) return `£${pounds}`;
  const k = Math.round(pounds / 1_000);
  if (k < 1_000) return `£${k}k`;
  const m = pounds / 1_000_000;
  // Above £100m a decimal is noise; below it, it is the difference between
  // two charities ("£2.4m", not "£2m").
  return `£${m >= 100 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}m`;
}

export function CharityRegisterFacts({
  status,
  income,
  place,
  registeredOn,
}: {
  status: string | null | undefined;
  income: number | null | undefined;
  place: string | null | undefined;
  registeredOn: string | null | undefined;
}) {
  const removed = Boolean(status) && status !== "Registered";
  const facts = [
    income == null ? null : money(income),
    place,
    // An ISO date sliced, not parsed: new Date() on a date-only string is
    // UTC midnight, which in a western timezone reads as the year before.
    registeredOn ? `registered ${registeredOn.slice(0, 4)}` : null,
  ].filter(Boolean);

  // Nothing to compare against — no mirror row, or no number on the
  // account. Both are reported once, elsewhere, properly.
  if (!removed && facts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Register:</span>
      {removed && <StatusBadge tone="destructive">{status}</StatusBadge>}
      {facts.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {facts.join(" · ")}
        </span>
      )}
    </div>
  );
}
