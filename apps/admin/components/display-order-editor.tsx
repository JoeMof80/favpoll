"use client";

import { useState, useTransition } from "react";
import { updateItemDisplayOrder } from "@/lib/actions/placeholders";

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
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 py-2.5">
      <span className="flex-1 text-sm text-neutral-900">{item.label}</span>
      <input
        type="number"
        value={order}
        onChange={(e) => {
          setOrder(e.target.value);
          setStatus("idle");
        }}
        onBlur={handleSave}
        placeholder="—"
        className="w-16 rounded border border-neutral-200 px-2 py-1 text-center text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
      {status === "saving" || isPending ? (
        <span className="text-xs text-neutral-400 w-12">Saving…</span>
      ) : status === "saved" ? (
        <span className="text-xs text-green-600 w-12">Saved</span>
      ) : status === "error" ? (
        <span className="text-xs text-red-600 w-24 truncate" title={errorMsg}>
          {errorMsg}
        </span>
      ) : (
        <span className="w-12" />
      )}
    </div>
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
      <p className="text-sm text-neutral-500">No canonical items found.</p>
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
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-1">
        <span>Item</span>
        <span>Order</span>
      </div>
      {sorted.map((item) => (
        <ItemRow key={item.id} topicId={topicId} item={item} />
      ))}
      <p className="mt-1 text-xs text-neutral-400">
        Leave blank to sort alphabetically. Lower numbers appear first. Changes
        save on blur.
      </p>
    </div>
  );
}
