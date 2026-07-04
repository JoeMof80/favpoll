"use client";

import { useState, useTransition } from "react";
import { updateItemDisplayOrder } from "@/lib/actions/placeholders";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Item = {
  id: string;
  label: string;
  display_order: number | null;
};

function ItemRow({ topicId, item }: { topicId: string; item: Item }) {
  const [order, setOrder] = useState<string>(
    item.display_order !== null ? String(item.display_order) : "",
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    const parsed = order.trim() === "" ? null : parseInt(order, 10);
    if (order.trim() !== "" && isNaN(parsed!)) {
      setStatus("error");
      setErrorMsg("Must be a number or empty");
      return;
    }
    startTransition(async () => {
      const result = await updateItemDisplayOrder(item.id, parsed, topicId);
      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="text-foreground">{item.label}</TableCell>
      <TableCell className="w-24">
        <Input
          type="number"
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setStatus("idle");
          }}
          onBlur={handleSave}
          placeholder="—"
          className="w-16 text-center"
        />
      </TableCell>
      <TableCell className="w-28 text-xs">
        {status === "saving" || isPending ? (
          <span className="text-muted-foreground">Saving…</span>
        ) : status === "saved" ? (
          <span className="text-success">Saved</span>
        ) : status === "error" ? (
          <span className="truncate text-destructive" title={errorMsg}>
            {errorMsg}
          </span>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

export function DisplayOrderEditor({
  topicId,
  items,
}: {
  topicId: string;
  items: Item[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No canonical items found.</p>
    );
  }

  const sorted = [...items].sort((a, b) => {
    const da = a.display_order ?? null;
    const db = b.display_order ?? null;
    if (da !== null && db !== null) return da - db;
    if (da !== null) return -1;
    if (db !== null) return 1;
    return a.label.localeCompare(b.label);
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Item</TableHead>
              <TableHead>Order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
              <ItemRow key={item.id} topicId={topicId} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Leave blank to sort alphabetically. Lower numbers appear first. Changes
        save on blur.
      </p>
    </div>
  );
}
