"use client";

import { useState, useTransition } from "react";
import type { Contribution } from "@/lib/actions/contributions";
import {
  acceptContribution,
  rejectContribution,
} from "@/lib/actions/contributions";

function StatusBadge({ status }: { status: Contribution["review_status"] }) {
  if (status === "accepted") {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Accepted
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      Pending
    </span>
  );
}

export function ContributionRow({ item }: { item: Contribution }) {
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptContribution(item.id);
      if (result.error) setError(result.error);
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectContribution(item.id, reason);
      if (result.error) {
        setError(result.error);
      } else {
        setShowRejectForm(false);
        setReason("");
      }
    });
  }

  const isPending_ = item.review_status === "pending";

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">"{item.label}"</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {item.topic_title} ·{" "}
            {item.protagonist_name || item.event_title || item.event_id}
          </p>
          {item.rejection_reason && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Reason: {item.rejection_reason}
            </p>
          )}
        </div>
        <StatusBadge status={item.review_status} />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isPending_ && !showRejectForm && (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isPending}
            className="rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? "…" : "Accept"}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={isPending}
            className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {isPending_ && showRejectForm && (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
              className="rounded px-3 py-1 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? "…" : "Confirm reject"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setReason("");
                setError(null);
              }}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
