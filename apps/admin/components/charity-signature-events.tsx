import type { SignatureEvent } from "@favpoll/types";
import { StatusBadge } from "@/components/ui/status-badge";

// WHAT THE WEBSITE READER FOUND.
//
// scripts/backfill-signature-events.ts reads a charity's own site for the
// fundraising events it already runs, because an event that maps to an
// occasion is the strongest evidence for a perfect topic — Save the
// Children's bake sale is why Cake is defensible for them.
//
// IT WAS INVISIBLE UNTIL NOW. The events only rendered inside
// PerfectTopicSelect, which the perfect-topic queue filters to rows that
// HAVE a suggestion, and which the consent queue reaches only for pending
// charities already used on a favpoll — and there it shows one event, and
// only one carrying a topic. So the cases where the reader FAILED were
// precisely the ones nobody could see. Diabetes UK sat on the founder's
// list for a fortnight as "worth a look in the queue" when there was no
// queue that would show it: the reader had scraped their regional
// SUPPORT-GROUP calendar, and all eight events carried no topic at all.
//
// So this renders on every charity row, whatever its queue state.
//
// "READ, FOUND NOTHING" AND "NEVER READ" ARE DIFFERENT and must look
// different. website_read_at is the only thing that separates them, which
// is why the absence of events is reported against it rather than alone.

export function CharitySignatureEvents({
  events,
  readAt,
}: {
  events: SignatureEvent[] | null | undefined;
  readAt: string | null | undefined;
}) {
  const read = readAt ? new Date(readAt).toLocaleDateString("en-GB") : null;
  const list = events ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Their events:</span>
        {!read ? (
          <StatusBadge tone="info">Website never read</StatusBadge>
        ) : list.length === 0 ? (
          <StatusBadge tone="warning">Read {read} — nothing found</StatusBadge>
        ) : (
          <span className="text-sm text-muted-foreground">
            {list.length} found, read {read}
          </span>
        )}
      </div>

      {list.length > 0 && (
        <ul className="space-y-1">
          {list.map((e, i) => (
            <li key={`${e.name}-${i}`} className="text-xs leading-relaxed">
              <span className="text-foreground">{e.name}</span>
              {e.when && (
                <span className="text-muted-foreground"> · {e.when}</span>
              )}
              {e.kind && (
                <span className="text-muted-foreground"> · {e.kind}</span>
              )}
              {/* The mapping is the whole value of an event. An event that
                  maps to nothing told us nothing, and saying so is how a
                  bad read becomes visible. */}
              {e.topic || e.occasionType ? (
                <span className="text-primary">
                  {" → "}
                  {[e.topic, e.occasionType].filter(Boolean).join(" · ")}
                </span>
              ) : (
                <span className="text-muted-foreground"> → no topic</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
