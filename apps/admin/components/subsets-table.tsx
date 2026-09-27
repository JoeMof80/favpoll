"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { SubsetRow } from "@/lib/actions/subsets";
import {
  approveSubset,
  rejectSubset,
  removeSubsetItem,
  renameSubset,
  setSubsetActive,
} from "@/lib/actions/subsets";
import { SUBSET_MAX_ITEMS, SUBSET_MIN_ITEMS } from "@/lib/subsets";
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

function SourceBadge({ source }: { source: SubsetRow["source"] }) {
  const label =
    source === "scan"
      ? "scan"
      : source === "suggester"
        ? "charity"
        : source === "homemade"
          ? "homemade"
          : "by hand";
  return <StatusBadge tone="neutral">{label}</StatusBadge>;
}

function SubsetRowView({ row }: { row: SubsetRow }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(row.title);
  const [error, setError] = useState<string | null>(null);
  const renamed = title.trim() !== row.title;
  const tooFew = row.items.length < SUBSET_MIN_ITEMS;

  const run = (fn: () => Promise<{ error: string | null }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
    });
  };

  return (
    <TableRow>
      <TableCell className="align-top text-muted-foreground">
        {row.topic_title}
      </TableCell>
      <TableCell className="align-top">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="h-8 w-48"
            aria-label="Subset name"
          />
          {renamed && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={isPending}
              onClick={() => run(() => renameSubset(row.id, title))}
            >
              Rename
            </Button>
          )}
          <SourceBadge source={row.source} />
        </div>
        {row.reason && (
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            {row.reason}
          </p>
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </TableCell>
      <TableCell className="align-top">
        <div className="flex max-w-lg flex-wrap gap-1">
          {row.items.map((i) => (
            <span
              key={i.favourite_id}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
            >
              {i.label}
              {row.status !== "rejected" && (
                <button
                  type="button"
                  aria-label={`Remove ${i.label}`}
                  disabled={isPending}
                  onClick={() =>
                    run(() => removeSubsetItem(row.id, i.favourite_id))
                  }
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </span>
          ))}
        </div>
        <p
          className={
            tooFew
              ? "mt-1 text-xs text-destructive"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {row.items.length} of {SUBSET_MIN_ITEMS} to {SUBSET_MAX_ITEMS}
        </p>
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="flex justify-end gap-2">
          {row.status === "proposed" && (
            <>
              <Button
                type="button"
                size="xs"
                disabled={isPending || tooFew}
                onClick={() => run(() => approveSubset(row.id))}
              >
                {isPending ? "…" : "Approve"}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={isPending}
                onClick={() => run(() => rejectSubset(row.id))}
              >
                Reject
              </Button>
            </>
          )}
          {row.status === "approved" && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={isPending}
              onClick={() => run(() => setSubsetActive(row.id, !row.is_active))}
            >
              {row.is_active ? "Delist" : "Relist"}
            </Button>
          )}
          {row.status === "rejected" && (
            <StatusBadge tone="destructive">Rejected</StatusBadge>
          )}
          {row.status === "approved" && !row.is_active && (
            <StatusBadge tone="warning">Delisted</StatusBadge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SubsetsTable({ rows }: { rows: SubsetRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parent</TableHead>
            <TableHead>Subset</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <SubsetRowView key={r.id} row={r} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
