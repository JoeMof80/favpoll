"use client";

import { useState, useTransition } from "react";
import type { SignatureEvent } from "@favpoll/types";
import type { AdminTopic } from "@/lib/actions/topics";
import { setPerfectTopic } from "@/lib/actions/charities";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

/** Everything the picker needs, so the consent queue's row and the
 *  perfect-topic queue's row both satisfy it. */
export type PerfectTopicRow = {
  id: string;
  perfect_topic_id: string | null;
  perfect_topic_suggested_id: string | null;
  perfect_topic_reason: string | null;
  perfect_subset_id: string | null;
  perfect_subset_suggested_id: string | null;
  signature_events?: SignatureEvent[] | null;
};

// The PERFECT TOPIC is confirmed here too, beside the family: the model's
// suggestion pre-selects and its one-sentence reason sits beneath, so the
// admin judges it with the register text in view. "No topic of its own"
// is a real answer (a hospice, a grant-maker).
export function PerfectTopicSelect({
  row,
  topics,
}: {
  row: PerfectTopicRow;
  topics: AdminTopic[];
}) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<string>(
    row.perfect_topic_id ?? row.perfect_topic_suggested_id ?? "",
  );
  // The SUBSET beside the topic (favpoll-topic-rules §1): the suggester's
  // pre-selects; "Whole list" is a real answer.
  const [subsetValue, setSubsetValue] = useState<string>(
    row.perfect_subset_id ?? row.perfect_subset_suggested_id ?? "",
  );
  const confirmed = row.perfect_topic_id != null;
  const suggested =
    (!confirmed && row.perfect_topic_suggested_id != null) ||
    (confirmed &&
      row.perfect_subset_id == null &&
      row.perfect_subset_suggested_id != null);
  const subsetsOf = topics.find((t) => t.id === value)?.subsets ?? [];

  function write(topicId: string, subsetId: string) {
    startTransition(async () => {
      await setPerfectTopic(
        row.id,
        topicId === "" ? null : topicId,
        subsetId === "" ? null : subsetId,
      );
    });
  }
  function handleChange(next: string) {
    setValue(next);
    // A new topic means a new list: the subset resets to the whole list.
    setSubsetValue("");
    write(next, "");
  }
  function handleSubsetChange(next: string) {
    setSubsetValue(next);
    write(value, next);
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Their topic</label>
        <select
          value={value}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">No topic of its own</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        {subsetsOf.length > 0 && (
          <select
            value={subsetValue}
            disabled={isPending}
            onChange={(e) => handleSubsetChange(e.target.value)}
            aria-label="Subset"
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Whole list</option>
            {subsetsOf.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        )}
        {suggested && (
          <>
            <StatusBadge tone="info">suggested</StatusBadge>
            {/* Leaving the select as it stands wrote nothing (founder,
                2026-09-27: seven suggestions "confirmed" that never
                landed) — confirming is an explicit press. */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending || value === ""}
              onClick={() => write(value, subsetValue)}
            >
              Confirm
            </Button>
          </>
        )}
      </div>
      {row.perfect_topic_reason && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {row.perfect_topic_reason}
        </p>
      )}
      {row.signature_events && row.signature_events.length > 0 && (
        <p className="line-clamp-3 text-xs text-muted-foreground">
          Their events:{" "}
          {row.signature_events
            .map(
              (e) =>
                `${e.name}${e.when ? ` (${e.when})` : ""}${e.topic ? ` → ${e.topic}` : ""}`,
            )
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
