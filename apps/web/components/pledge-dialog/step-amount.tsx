"use client"

import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import type { BreakdownLine } from "@/components/pledge-card/pledge-breakdown"
import { GBP } from "@/components/pledge-card/utils"

type FavouriteBreakdownLine = { label: string; amount: number }

const PRESETS = [5, 10, 20, 50]

// Header slot: just the large amount input (presets live in the body left column)
export function StepAmountHeader({
  pledgeAmount,
  updatePledgeAmount,
}: {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-1.5">
        <label
          htmlFor="dialog-pledge-amount"
          className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
        >
          Your pledge
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="About pledging"
              className="h-4 w-4 rounded-full"
            >
              <InfoIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 text-xs leading-relaxed">
            Pledge the amount that reflects how strongly you feel about your
            favourites. All pledges are anonymous.
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-2xl text-muted-foreground select-none"
          aria-hidden="true"
        >
          £
        </span>
        <input
          id="dialog-pledge-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={pledgeAmount}
          onChange={(e) => updatePledgeAmount(e.target.value)}
          placeholder="0"
          aria-label="Pledge amount in pounds"
          className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  )
}

type Props = {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
  topUpAmount: string
  useSharedFund: boolean
  error: string | null
  available: number
  hasFund: boolean
  numericPledge: number
  isPledgeValid: boolean
  fundOverAvailable: boolean
  fundBarPct: number
  fundBarColor: string
  ownBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null
  fundBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null
  favouriteBreakdown: FavouriteBreakdownLine[]
  setTopUpAmount: (v: string) => void
  toggleFund: () => void
  isListed?: boolean
}

export function StepAmount({
  pledgeAmount,
  updatePledgeAmount,
  topUpAmount,
  useSharedFund,
  error,
  available,
  hasFund,
  numericPledge,
  isPledgeValid,
  fundOverAvailable,
  fundBarPct,
  fundBarColor,
  ownBreakdown,
  fundBreakdown,
  favouriteBreakdown,
  setTopUpAmount,
  toggleFund,
  isListed,
}: Props) {
  return (
    <div className="px-5 py-4">
      {/* ── Path selector: only shown when shared fund is available ── */}
      {hasFund && (
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={!useSharedFund ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              if (useSharedFund) toggleFund()
            }}
          >
            Pay with card
          </Button>
          <Button
            type="button"
            variant={useSharedFund ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              if (!useSharedFund) toggleFund()
            }}
          >
            Use shared fund
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-5">
        {/* ── Left column: presets + fund controls ── */}
        <div className="flex flex-col gap-3 sm:col-span-2">
          {/* Preset buttons — horizontal on mobile, vertical on desktop */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-1">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={
                  pledgeAmount === String(preset) ? "default" : "outline"
                }
                className="w-full"
                onClick={() => updatePledgeAmount(String(preset))}
              >
                £{preset}
              </Button>
            ))}
          </div>

          {/* Top-up — shown whenever paying with own funds */}
          {!useSharedFund && (
            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="dialog-top-up-amount"
                  className="text-xs text-muted-foreground"
                >
                  Shared fund
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="About the shared fund"
                      className="h-4 w-4 rounded-full"
                    >
                      <InfoIcon className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-56 text-xs leading-relaxed"
                  >
                    Help others who can&apos;t contribute financially take part
                  </PopoverContent>
                </Popover>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Help guests who can&apos;t pledge on their own still take part.
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span
                  className="text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  £
                </span>
                <input
                  id="dialog-top-up-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
          )}

          {/* Fund bar — when pledging from shared fund */}
          {useSharedFund && (
            <div className="space-y-1.5">
              <div
                role="presentation"
                className="h-1 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(fundBarPct * 100, 100)}%`,
                    backgroundColor: fundBarColor,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isPledgeValid && available > 0
                  ? `Using ${GBP.format(numericPledge)} of ${GBP.format(available)} available`
                  : `${GBP.format(available)} available in the shared fund`}
              </p>
              {fundOverAvailable && (
                <p className="text-[11px] text-destructive">
                  Shared fund has {GBP.format(available)} available — reduce
                  your pledge to use it
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right column: breakdown + fee ── */}
        <div className="flex flex-col gap-4 sm:col-span-3">
          {favouriteBreakdown.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Your favourites
              </p>
              <div className="space-y-2">
                {favouriteBreakdown.map((line, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm">{line.label}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {GBP.format(line.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(ownBreakdown ?? fundBreakdown) && (
            <PledgeBreakdown {...(ownBreakdown ?? fundBreakdown)!} />
          )}

          {/* Listed-favpoll notice — shown when using the shared fund */}
          {useSharedFund && isListed && (
            <p className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              This is a public favpoll. Your pledge amount and identity are
              always private.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}
