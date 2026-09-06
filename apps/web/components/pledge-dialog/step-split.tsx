"use client"

import { RankingBar } from "@/components/ui/ranking-bar"
import { Button } from "@/components/ui/button"
import { formatPoundsExact } from "@/lib/i18n"
import { Minus, Plus } from "lucide-react"

type FavouriteBreakdownLine = { label: string; amount: number }

type Props = {
  favouriteBreakdown: FavouriteBreakdownLine[]
  /** Pounds of the total moved to the shared fund. */
  fundPart: number
  /** Step the fund by ±£1 (dialog split mapping). */
  onFundStep: (delta: number) => void
  /** The guest's whole total — the bars are proportions of it. */
  numericTotal: number
}

/**
 * The split as its own step (founder, 2026-09-06): the favourite(s) and
 * the shared fund in the app's ranking-bar grammar, whole pounds stepping
 * between them while the total holds still. Defaults all-to-favourite and
 * Next is never gated — most guests read it and move straight on.
 */
export function StepSplit({
  favouriteBreakdown,
  fundPart,
  onFundStep,
  numericTotal,
}: Props) {
  const total = numericTotal > 0 ? numericTotal : 1
  // The favourite keeps at least £1 of worth (the dialog clamps too)
  const canStepUp = fundPart + 1 <= Math.floor(numericTotal - 1)
  return (
    <div className="flex flex-col gap-5 px-5 py-4">
      <p className="text-sm text-muted-foreground">
        Move whole pounds to the shared fund — it backs guests without a
        favourite, and reaches the charity too. Your total stays the same.
      </p>
      <ol className="space-y-3" aria-label="How your pledge splits">
        {favouriteBreakdown.map((line, i) => (
          <li key={i}>
            <RankingBar
              label={line.label}
              amount={formatPoundsExact(line.amount)}
              widthPercent={(line.amount / total) * 100}
            />
          </li>
        ))}
        <li>
          <RankingBar
            label="Shared fund"
            amount={formatPoundsExact(fundPart)}
            widthPercent={(fundPart / total) * 100}
            barClassName="bg-chart-3"
          />
        </li>
      </ol>
      <div className="flex items-center justify-between">
        <span className="text-sm">To the shared fund</span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Move £1 back to your favourite"
            disabled={fundPart <= 0}
            onClick={() => onFundStep(-1)}
          >
            <Minus />
          </Button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums">
            {formatPoundsExact(fundPart)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Move £1 to the shared fund"
            disabled={!canStepUp}
            onClick={() => onFundStep(1)}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  )
}
