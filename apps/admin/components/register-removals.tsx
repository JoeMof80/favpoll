import type { RegisterRemoval } from "@/lib/actions/charities";
import { StatusBadge } from "@/components/ui/status-badge";

// ─── The removal check ───────────────────────────────────────────────────────
//
// references/charity-profiles-2026-09-27.md §3: REMOVAL IS NOT STALENESS.
// Staleness is compared on the derived fields and regenerated lazily; a
// charity that has LEFT the register is wrong, not old, and it is read at
// load time — because favpolls, pledges, payouts and Gift Aid
// declarations point at the account, and money moving to a deregistered
// charity is the one failure here with real consequences.
//
// So this sits above the queues, and only when it has something to say.
// It is an alarm, not a workbench: the account is deactivated in the
// table below, and approval is refused server-side in setCharityConsent.

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB");

/** What is at stake on this account — the reason a removal is urgent
 *  rather than tidy. "Nothing points at it yet" is the good case. */
function Stake({ row }: { row: RegisterRemoval }) {
  const parts: string[] = [];
  if (row.favpoll_count > 0)
    parts.push(
      `${row.favpoll_count} favpoll${row.favpoll_count === 1 ? "" : "s"}` +
        (row.open_count > 0 ? ` (${row.open_count} still open)` : ""),
    );
  if (row.raised > 0) parts.push(`${GBP.format(row.raised)} raised`);
  if (row.pending_disbursements > 0)
    parts.push(
      `${row.pending_disbursements} payout${
        row.pending_disbursements === 1 ? "" : "s"
      } pending, ${GBP.format(row.pending_amount)}`,
    );
  if (row.gift_aid_declarations > 0)
    parts.push(`${row.gift_aid_declarations} Gift Aid declarations`);
  if (!row.is_active) parts.push("already inactive");

  return (
    <p className="text-xs text-muted-foreground">
      {parts.length === 0 ? "Nothing points at it yet" : parts.join(" · ")}
    </p>
  );
}

function Row({ row }: { row: RegisterRemoval }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {row.name}
          {row.registered_number && (
            <span className="ml-2 font-normal text-muted-foreground">
              {row.registered_number}
            </span>
          )}
        </p>
        <Stake row={row} />
        <p className="text-xs text-muted-foreground">
          {row.verdict === "removed"
            ? `Register: ${row.register_name ?? "—"}`
            : `Last seen in the ${row.extract_date ? date(row.extract_date) : "—"} extract; the latest is ${
                row.latest_extract ? date(row.latest_extract) : "—"
              }`}
        </p>
      </div>
      {row.verdict === "removed" ? (
        <StatusBadge tone="destructive">
          {row.register_status ?? "Not registered"}
          {row.removed_on ? ` ${date(row.removed_on)}` : ""}
        </StatusBadge>
      ) : (
        <StatusBadge tone="warning">Not in the latest extract</StatusBadge>
      )}
    </div>
  );
}

export function RegisterRemovals({ rows }: { rows: RegisterRemoval[] }) {
  const removed = rows.filter((r) => r.verdict === "removed");
  const gone = rows.filter((r) => r.verdict === "gone");
  const unknown = rows.filter((r) => r.verdict === "unknown");

  // No section at all when every account is cleanly Registered.
  if (rows.length === 0) return null;

  // Nothing is wrong, something is merely unknown: one quiet line, and
  // none of the alarm.
  if (removed.length === 0 && gone.length === 0) {
    return <UnknownLine rows={unknown} />;
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">
        {removed.length > 0
          ? "The register has removed these"
          : "These are not in the latest extract"}{" "}
        <span className="font-normal text-muted-foreground">
          — money must not move to a deregistered charity
        </span>
      </h2>

      <div className="divide-y divide-destructive/20 rounded-lg border border-destructive/40 bg-destructive-muted/30">
        {[...removed, ...gone].map((row) => (
          <Row key={row.charity_id} row={row} />
        ))}
      </div>

      {removed.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Deactivate the account below, then settle anything owed by hand.
          Approval is refused while the register says removed.
        </p>
      )}

      {gone.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Gone from the latest extract: either a deregistration with no removal
          date, or a load that stopped half way. Re-run the mirror load before
          acting on these.
        </p>
      )}

      <UnknownLine rows={unknown} />
    </section>
  );
}

/** Quiet by design: a charity registered since the extract has no mirror
 *  row and verifies against the live API perfectly well. A typo lives
 *  here too, which is why it is named rather than hidden. */
function UnknownLine({ rows }: { rows: RegisterRemoval[] }) {
  if (rows.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground">
      No mirror row (registered since the extract, a linked number, or a typo):{" "}
      {rows
        .map(
          (r) =>
            `${r.name}${r.registered_number ? ` (${r.registered_number})` : ""}`,
        )
        .join(", ")}
    </p>
  );
}
