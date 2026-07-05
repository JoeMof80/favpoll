"use client";

import { useMemo, useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import type { OversightFavpoll } from "@/lib/actions/favpolls";
import { setListed, closeFavpollNow } from "@/lib/actions/favpolls";
import { setExemplar } from "@/lib/actions/exemplars";
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

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type StatusFilter = "all" | "open" | "closed";

function FavpollRow({
  favpoll,
  webBaseUrl,
}: {
  favpoll: OversightFavpoll;
  webBaseUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmClose(false);
      }
    });
  }

  const isClosed = !!favpoll.closed_at;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          <span className="flex items-center gap-1.5">
            {favpoll.display_name}
            {webBaseUrl && (
              <a
                href={`${webBaseUrl}/favpolls/${favpoll.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${favpoll.display_name} on favpoll`}
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {favpoll.category ?? "—"}
        </TableCell>
        <TableCell className="tabular-nums">
          {GBP.format(favpoll.total_raised)}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(favpoll.created_at).toLocaleDateString("en-GB")}
        </TableCell>
        <TableCell>
          {isClosed ? (
            <StatusBadge tone="neutral">Closed</StatusBadge>
          ) : (
            <StatusBadge tone="success">Open</StatusBadge>
          )}
        </TableCell>
        <TableCell>
          {favpoll.is_listed ? (
            <StatusBadge tone="info">Listed</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Unlisted</StatusBadge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <span className="flex justify-end gap-2">
            {isClosed ? (
              <Button
                type="button"
                size="xs"
                variant={favpoll.is_exemplar ? "secondary" : "ghost"}
                disabled={isPending}
                onClick={() =>
                  run(() => setExemplar(favpoll.id, !favpoll.is_exemplar))
                }
              >
                {favpoll.is_exemplar ? "Exemplar ✓" : "Set exemplar"}
              </Button>
            ) : confirmClose ? (
              <>
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => run(() => closeFavpollNow(favpoll.id))}
                >
                  {isPending ? "…" : "Confirm close"}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setConfirmClose(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={isPending}
                onClick={() => setConfirmClose(true)}
              >
                Close now
              </Button>
            )}
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={isPending}
              onClick={() =>
                run(() => setListed(favpoll.id, !favpoll.is_listed))
              }
            >
              {favpoll.is_listed ? "Unlist" : "List"}
            </Button>
          </span>
        </TableCell>
      </TableRow>
      {error && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="bg-muted/30 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function FavpollsTable({
  favpolls,
  webBaseUrl,
}: {
  favpolls: OversightFavpoll[];
  webBaseUrl: string | null;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return favpolls.filter((f) => {
      if (status === "open" && f.closed_at) return false;
      if (status === "closed" && !f.closed_at) return false;
      if (q && !f.display_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [favpolls, search, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="max-w-xs"
          aria-label="Search favpolls by name"
        />
        <div className="flex gap-1">
          {(["all", "open", "closed"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={status === value ? "secondary" : "ghost"}
              onClick={() => setStatus(value)}
            >
              {value === "all" ? "All" : value === "open" ? "Open" : "Closed"}
            </Button>
          ))}
        </div>
        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {favpolls.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No favpolls match.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((favpoll) => (
                <FavpollRow
                  key={favpoll.id}
                  favpoll={favpoll}
                  webBaseUrl={webBaseUrl}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
