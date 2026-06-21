"use client";

import { useTransition } from "react";
import { setExemplar } from "@/lib/actions/exemplars";
import type { ExemplarFavpoll } from "@/lib/actions/exemplars";

type Props = {
  events: ExemplarFavpoll[];
};

export function ExemplarTable({ events }: Props) {
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, current: boolean) {
    startTransition(async () => {
      await setExemplar(id, !current);
    });
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No closed favpolls found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="pb-2 pr-4 font-medium">Protagonist</th>
            <th className="pb-2 pr-4 font-medium">Occasion</th>
            <th className="pb-2 pr-4 font-medium">Register</th>
            <th className="pb-2 pr-4 font-medium">Closed</th>
            <th className="pb-2 font-medium">Exemplar</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr
              key={ev.id}
              className="border-b border-neutral-100 last:border-0"
            >
              <td className="py-2 pr-4 font-medium text-neutral-900">
                {ev.protagonist_name ?? "—"}
              </td>
              <td className="py-2 pr-4 text-neutral-600">
                {ev.occasion_type ?? ev.opening_line ?? "—"}
              </td>
              <td className="py-2 pr-4 text-neutral-500">{ev.register}</td>
              <td className="py-2 pr-4 text-neutral-400">
                {ev.closed_at
                  ? new Date(ev.closed_at).toLocaleDateString("en-GB")
                  : "—"}
              </td>
              <td className="py-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggle(ev.id, ev.is_exemplar)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    ev.is_exemplar
                      ? "bg-[#EEEDFE] text-[#534AB7] hover:bg-[#dddcfd]"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {ev.is_exemplar ? "Exemplar ✓" : "Set exemplar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
