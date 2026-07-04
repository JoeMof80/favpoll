"use client";

import { useState, useTransition } from "react";
import type { Contribution } from "@/lib/actions/contributions";
import {
  acceptContribution,
  rejectContribution,
} from "@/lib/actions/contributions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ReviewBadge({ status }: { status: Contribution["review_status"] }) {
  if (status === "accepted")
    return <StatusBadge tone="success">Accepted</StatusBadge>;
  if (status === "rejected")
    return <StatusBadge tone="destructive">Rejected</StatusBadge>;
  return <StatusBadge tone="warning">Pending</StatusBadge>;
}

function PendingRow({ item }: { item: Contribution }) {
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

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          &ldquo;{item.label}&rdquo;
        </TableCell>
        <TableCell className="text-muted-foreground">
          {item.topic_title}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {item.protagonist_name || item.favpoll_title || item.favpoll_id}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="xs"
              disabled={isPending}
              onClick={handleAccept}
            >
              {isPending ? "…" : "Accept"}
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={isPending}
              onClick={() => setShowRejectForm((v) => !v)}
            >
              Reject
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {(showRejectForm || error) && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="bg-muted/30 py-3">
            {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
            {showRejectForm && (
              <div className="flex items-center gap-2">
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="max-w-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending || !reason.trim()}
                  onClick={handleReject}
                >
                  {isPending ? "…" : "Confirm reject"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => {
                    setShowRejectForm(false);
                    setReason("");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function PendingContributionsTable({
  items,
}: {
  items: Contribution[];
}) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Label</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Favpoll</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <PendingRow key={item.id} item={item} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ReviewedContributionsTable({
  items,
}: {
  items: Contribution[];
}) {
  const showReason = items.some((i) => i.rejection_reason);
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Label</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Favpoll</TableHead>
            {showReason && <TableHead>Reason</TableHead>}
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-foreground">
                &ldquo;{item.label}&rdquo;
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.topic_title}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.protagonist_name || item.favpoll_title || item.favpoll_id}
              </TableCell>
              {showReason && (
                <TableCell className="text-muted-foreground italic">
                  {item.rejection_reason ?? "—"}
                </TableCell>
              )}
              <TableCell className="text-right">
                <ReviewBadge status={item.review_status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
