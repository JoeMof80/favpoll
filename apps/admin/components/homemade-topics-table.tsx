"use client";

import { useState, useTransition } from "react";
import type { HomemadeTopic } from "@/lib/actions/subsets";
import { promoteHomemadeTopic } from "@/lib/actions/subsets";
import type { AdminTopic } from "@/lib/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// PROMOTION (favpoll-topic-rules §1, ruling 8): pick the parent, keep or
// correct the name, press Promote. The action refuses when fewer than six
// of the items are on the parent's list and says which are missing.
function HomemadeRow({
  row,
  parents,
}: {
  row: HomemadeTopic;
  parents: AdminTopic[];
}) {
  const [isPending, startTransition] = useTransition();
  const [parent, setParent] = useState("");
  const [title, setTitle] = useState(row.title);
  const [error, setError] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);

  function promote() {
    setError(null);
    setUnmatched([]);
    startTransition(async () => {
      const r = await promoteHomemadeTopic(row.id, parent, title);
      if (r.error) {
        setError(r.error);
        setUnmatched(r.unmatched ?? []);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="align-top">
        <div className="font-medium text-foreground">{row.title}</div>
        <div className="text-xs text-muted-foreground">
          {row.favpoll_count} favpoll{row.favpoll_count === 1 ? "" : "s"}
        </div>
      </TableCell>
      <TableCell className="align-top">
        <div className="flex max-w-lg flex-wrap gap-1">
          {row.items.map((label) => (
            <span
              key={label}
              className={
                unmatched.includes(label)
                  ? "rounded-full border border-destructive px-2 py-0.5 text-xs text-destructive"
                  : "rounded-full border border-border px-2 py-0.5 text-xs"
              }
            >
              {label}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="align-top">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={parent}
            disabled={isPending}
            onChange={(e) => setParent(e.target.value)}
            aria-label="Parent topic"
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Subset of…</option>
            {parents.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className="h-8 w-44"
            aria-label="Subset name"
          />
          <Button
            type="button"
            size="xs"
            disabled={isPending || !parent || !title.trim()}
            onClick={promote}
          >
            {isPending ? "…" : "Promote"}
          </Button>
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </TableCell>
    </TableRow>
  );
}

export function HomemadeTopicsTable({
  rows,
  parents,
}: {
  rows: HomemadeTopic[];
  parents: AdminTopic[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Homemade topic</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Promote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <HomemadeRow key={r.id} row={r} parents={parents} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
