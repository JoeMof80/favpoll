"use client"

import { GBP } from "./utils"

export type BreakdownLine = { label: string; amount: number; hidden?: boolean }

export function PledgeBreakdown({
  lines,
  total,
}: {
  lines: BreakdownLine[]
  total: { label: string; amount: number }
}) {
  return (
    <div className="space-y-1.5 border-t border-border pt-3 text-xs">
      {lines
        .filter((l) => !l.hidden)
        .map((line, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="font-medium tabular-nums">
              {GBP.format(line.amount)}
            </span>
          </div>
        ))}
      <div className="flex justify-between border-t border-border pt-1.5 text-sm">
        <span className="font-medium">{total.label}</span>
        <span className="font-semibold tabular-nums">
          {GBP.format(total.amount)}
        </span>
      </div>
    </div>
  )
}
