"use client";

import { useState, useTransition } from "react";
import type { PerfectTopicQueueRow } from "@/lib/actions/charities";
import { dismissPerfectTopicSuggestion } from "@/lib/actions/charities";
import type { AdminTopic } from "@/lib/actions/topics";
import { CAUSE_FAMILY_LABELS } from "@favpoll/types";
import { Button } from "@/components/ui/button";
import { PerfectTopicSelect } from "@/components/perfect-topic-select";

// ─── Perfect topic queue ─────────────────────────────────────────────────────
//
// The suggester (scripts/backfill-perfect-topic.ts) writes a suggestion;
// only an admin's confirmation reaches the wizard and the generator. The
// consent queue carried that confirmation, but it lists a charity only
// while consent is PENDING and a favpoll already uses it — so a charity
// approved for consent left the queue with its suggestion unconfirmed,
// and one nobody has picked yet never entered (founder, 2026-10-02:
// "where are the perfect topics to be reviewed?"). This queue is every
// unconfirmed suggestion, and it empties as they are decided: Confirm
// writes the topic, "No topic of its own" clears the suggestion.

function Row({
  row,
  topics,
}: {
  row: PerfectTopicQueueRow;
  topics: AdminTopic[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function dismiss() {
    setError(null);
    startTransition(async () => {
      const r = await dismissPerfectTopicSuggestion(row.id);
      if (r.error) setError(r.error);
    });
  }

  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {row.name}
          {row.cause_family && (
            <span className="ml-2 font-normal text-muted-foreground">
              {CAUSE_FAMILY_LABELS[row.cause_family]}
            </span>
          )}
        </p>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <div className="min-w-0 flex-[2]">
        <PerfectTopicSelect row={row} topics={topics} />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={dismiss}
      >
        {isPending ? "…" : "No topic of its own"}
      </Button>
    </div>
  );
}

export function PerfectTopicQueue({
  rows,
  topics,
}: {
  rows: PerfectTopicQueueRow[];
  topics: AdminTopic[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Perfect topics to confirm ({rows.length})
        </h2>
        <p className="text-xs text-muted-foreground">
          The model suggested a topic; only a confirmation reaches the
          wizard&rsquo;s charity-first suggestions and the generator. Confirm
          the topic, pick a subset beside it where the narrower list is still
          the whole of what they do, or say the charity has no topic of its own.
        </p>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {rows.map((r) => (
          <Row key={r.id} row={r} topics={topics} />
        ))}
      </div>
    </section>
  );
}
