"use client";

import { useTransition } from "react";
import { setExemplar } from "@/lib/actions/exemplars";
import type { ExemplarFavpoll } from "@/lib/actions/exemplars";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  favpolls: ExemplarFavpoll[];
};

export function ExemplarTable({ favpolls }: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, current: boolean) {
    startTransition(async () => {
      await setExemplar(id, !current);
    });
  }

  if (favpolls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No closed favpolls found.</p>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Occasion</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Closed</TableHead>
            <TableHead className="text-right">Exemplar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {favpolls.map((ev) => (
            <TableRow key={ev.id}>
              <TableCell className="font-medium text-foreground">
                {ev.display_name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ev.occasion_type ?? ev.opening_line ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ev.category ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ev.closed_at
                  ? new Date(ev.closed_at).toLocaleDateString("en-GB")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="xs"
                  variant={ev.is_exemplar ? "secondary" : "ghost"}
                  disabled={isPending}
                  onClick={() => toggle(ev.id, ev.is_exemplar)}
                >
                  {ev.is_exemplar ? "Exemplar ✓" : "Set exemplar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
