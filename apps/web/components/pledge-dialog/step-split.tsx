"use client"

import { Slider } from "@/components/ui/slider"
import { formatPoundsExact } from "@/lib/i18n"

type FavouriteBreakdownLine = { label: string; amount: number }

type Props = {
  favouriteBreakdown: FavouriteBreakdownLine[]
  /** Pounds of the total moved to the shared fund. */
  fundPart: number
  /** Set the fund to an absolute pound value (the slider's grammar). */
  onFundChange: (pounds: number) => void
  /** The guest's whole total — the slider divides it. */
  numericTotal: number
}

/**
 * The split as its own step, slider grammar (founder, 2026-09-06 v2 —
 * superseding the ranking-bar audition): the thumb is the divider,
 * shared fund's share to its left and the favourite's to its right,
 * with the list below re-pricing live as it moves. Defaults
 * all-to-favourite; Next is never gated.
 */
export function StepSplit({
  favouriteBreakdown,
  fundPart,
  onFundChange,
  numericTotal,
}: Props) {
  // Whole pounds only, and the favourite keeps at least £1 of worth
  const maxFund = Math.max(0, Math.floor(numericTotal - 1))
  const favouriteShare = Math.round((numericTotal - fundPart) * 100) / 100
  const plural = favouriteBreakdown.length !== 1
  return (
    <div className="flex flex-col gap-5 px-5 py-4">
      <p className="text-sm text-muted-foreground">
        Move whole pounds to the shared fund — it backs guests without a
        favourite, and reaches the charity too. Your total stays the same.
      </p>

      <div className="flex flex-col gap-2">
        <Slider
          value={[fundPart]}
          min={0}
          // A £1 total leaves nothing to split; min === max degenerates
          // Radix's thumb maths, so the range stays real and disabled
          // carries the meaning.
          max={Math.max(1, maxFund)}
          step={1}
          disabled={maxFund === 0}
          onValueChange={([v]) => onFundChange(v)}
          aria-label="Pounds to the shared fund"
          trackClassName="bg-primary/20"
          rangeClassName="bg-chart-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Shared fund{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatPoundsExact(fundPart)}
            </span>
          </span>
          <span>
            {plural ? "Favourites" : "Favourite"}{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatPoundsExact(favouriteShare)}
            </span>
          </span>
        </div>
      </div>

      {/* The list, re-pricing live under the thumb */}
      <div className="space-y-2 border-t border-border pt-3">
        {favouriteBreakdown.map((line, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-sm">{line.label}</span>
            <span className="text-sm font-semibold tabular-nums">
              {formatPoundsExact(line.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between">
          <span className="text-sm">Shared fund</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatPoundsExact(fundPart)}
          </span>
        </div>
      </div>
    </div>
  )
}
