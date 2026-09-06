"use client"

import { formatPoundsExact } from "@/lib/i18n"

export type BreakdownLine = { label: string; amount: number; hidden?: boolean }

export function PledgeBreakdown({
  lines,
  total,
  extraRow,
}: {
  lines: BreakdownLine[]
  total: { label: string; amount: number }
  /** Optional custom row (e.g. the inline tip control) before the total */
  extraRow?: React.ReactNode
}) {
  return (
    <div className="space-y-2 border-t border-border pt-3 text-sm">
      {lines
        .filter((l) => !l.hidden)
        .map((line, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="font-medium tabular-nums">
              {formatPoundsExact(line.amount)}
            </span>
          </div>
        ))}
      {extraRow}
      <div className="flex justify-between border-t border-border pt-2 text-base">
        <span className="font-medium">{total.label}</span>
        <span className="font-semibold tabular-nums">
          {formatPoundsExact(total.amount)}
        </span>
      </div>
    </div>
  )
}
