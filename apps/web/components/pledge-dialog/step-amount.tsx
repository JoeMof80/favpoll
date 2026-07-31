"use client"

import type { BreakdownLine } from "@/components/pledge-card/pledge-breakdown"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import { formatTipLabel } from "@/components/pledge-card/utils"
import { formatPoundsExact } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Info, Minus, Plus } from "lucide-react"

type FavouriteBreakdownLine = { label: string; amount: number }

const PRESETS = [5, 10, 20, 50]

type HeaderProps = {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
  useSharedFund?: boolean
  available?: number
  numericPledge?: number
  isPledgeValid?: boolean
  fundOverAvailable?: boolean
  error?: string | null
}

export function StepAmountHeader({
  pledgeAmount,
  updatePledgeAmount,
  useSharedFund = false,
  available = 0,
  numericPledge = 0,
  isPledgeValid = false,
  fundOverAvailable = false,
  error = null,
}: HeaderProps) {
  return (
    <InputGroup className="h-auto rounded-none border-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0">
      <InputGroupAddon
        align="block-start"
        className="justify-between px-5 pt-4 pb-0"
      >
        <label
          htmlFor="dialog-pledge-amount"
          className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
        >
          Your pledge
        </label>
      </InputGroupAddon>

      <div className="flex w-full items-baseline gap-1.5 px-5 py-3">
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

      <InputGroupAddon align="block-end" className="px-5 pb-4">
        <div className="w-full space-y-1.5">
          {!useSharedFund && (
            <p className="text-[11px] text-muted-foreground">
              Give what feels right — you can split it below between your
              favourite and the shared fund. Processed securely by Stripe;
              favpoll takes no fee.
            </p>
          )}
          {useSharedFund && !fundOverAvailable && (
            <p className="text-[11px] text-muted-foreground">
              {isPledgeValid && available > 0
                ? `Using ${formatPoundsExact(numericPledge)} of ${formatPoundsExact(available)} available`
                : `${formatPoundsExact(available)} available in the shared fund`}
            </p>
          )}
          {useSharedFund && fundOverAvailable && (
            <p className="text-[11px] text-destructive">
              Shared fund has {formatPoundsExact(available)} available — reduce
              your pledge to use it
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </InputGroupAddon>
    </InputGroup>
  )
}

type Props = {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
  useSharedFund: boolean
  hasFund: boolean
  ownBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null
  fundBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null
  favouriteBreakdown: FavouriteBreakdownLine[]
  toggleFund: () => void
  /** Admin-curated impact lines per charity ("£20 funds an hour…") */
  impactStatements?: string[]
  tipAmount: number
  setTipAmount: (v: number) => void
  /** Chip values for the current pledge tier (see tipOptionsFor) */
  tipOptions: number[]
  /** false hides the contribution row (hero demo) */
  showTip?: boolean
  isListed?: boolean
  /** Pounds of the total moved to the shared fund (dialog split). */
  fundPart?: number
  /** Step the fund by ±£1 — omitted (hero demo) hides the split row. */
  onFundStep?: (delta: number) => void
}

export function StepAmount({
  pledgeAmount,
  updatePledgeAmount,
  useSharedFund,
  hasFund,
  ownBreakdown,
  fundBreakdown,
  favouriteBreakdown,
  toggleFund,
  impactStatements,
  tipAmount,
  setTipAmount,
  tipOptions,
  showTip = true,
  isListed,
  fundPart = 0,
  onFundStep,
}: Props) {
  const numericTotal = parseFloat(pledgeAmount)
  const totalValid = !isNaN(numericTotal) && numericTotal > 0
  // The favourite keeps at least £1 of worth
  const canStepUp = totalValid && fundPart + 1 <= Math.floor(numericTotal - 1)
  const showSplit = !useSharedFund && !!onFundStep && totalValid
  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-5">
        {/* Presets quick-set the header amount — a horizontal row under
            it at every width, matching the pledge card and hero demo (the
            desktop two-column stack was the app's one layout island) */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
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
          {impactStatements && impactStatements.length > 0 && (
            <div className="space-y-1.5 rounded-md bg-secondary/40 px-3 py-2.5">
              {impactStatements.map((statement, i) => (
                <p
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-secondary-foreground"
                >
                  <Sparkles
                    className="mt-0.5 size-3 shrink-0"
                    aria-hidden="true"
                  />
                  {statement}
                </p>
              ))}
            </div>
          )}
          {isListed && (
            <p className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              This is a public favpoll. Your pledge amount and identity are
              always private.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {hasFund && (
            <Tabs
              value={useSharedFund ? "fund" : "card"}
              onValueChange={(v) => {
                if ((v === "fund") !== useSharedFund) toggleFund()
              }}
              className="border-b border-border"
            >
              <TabsList className="w-full" variant="line">
                <TabsTrigger value="card" className="flex-1">
                  Pay with card
                </TabsTrigger>
                <TabsTrigger value="fund" className="flex-1">
                  Use shared fund
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {favouriteBreakdown.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  {favouriteBreakdown.length === 1
                    ? "Your favourite · its worth"
                    : "Your favourites · their worth"}
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="About your favourite's worth"
                      className="h-4 w-4 rounded-full"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-64 text-xs leading-relaxed"
                  >
                    This amount is what your favourite&apos;s worth — it&apos;s
                    what counts in the standings. Anything you move to the
                    shared fund helps guests who can&apos;t pledge take part.
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                {favouriteBreakdown.map((line, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm">{line.label}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPoundsExact(line.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {/* The split: whole pounds move from the favourite(s) to the
                  shared fund — the favourite lines above tick down as this
                  ticks up, total unchanged (founder redesign, 2026-07-31) */}
              {showSplit && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shared fund</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label="Move £1 back to your favourite"
                      disabled={fundPart <= 0}
                      onClick={() => onFundStep!(-1)}
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
                      onClick={() => onFundStep!(1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(ownBreakdown ?? fundBreakdown) && (
            <div className="space-y-1.5">
              <PledgeBreakdown
                {...(ownBreakdown ?? fundBreakdown)!}
                extraRow={
                  showTip && !useSharedFund ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        Tip for favpoll
                      </span>
                      <div
                        className="flex gap-1"
                        role="radiogroup"
                        aria-label="Optional contribution to favpoll"
                      >
                        {tipOptions.map((value) => (
                          <Button
                            key={value}
                            type="button"
                            size="xs"
                            role="radio"
                            aria-checked={tipAmount === value}
                            variant={
                              tipAmount === value ? "secondary" : "ghost"
                            }
                            className="px-2 font-normal aria-checked:font-medium"
                            onClick={() => setTipAmount(value)}
                          >
                            {formatTipLabel(value)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null
                }
              />
              {showTip && !useSharedFund && (
                <p className="text-[11px] text-muted-foreground">
                  Optional — never taken from your pledge.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
