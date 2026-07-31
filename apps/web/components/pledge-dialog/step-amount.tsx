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
import { Info } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

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
              Pledge what your favourite&apos;s worth — anything extra can go to
              the shared fund below. Processed securely by Stripe; favpoll takes
              no fee.
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
  /** Omitted (hero demo) hides the shared-fund top-up box */
  topUpAmount?: string
  setTopUpAmount?: (v: string) => void
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
  topUpAmount,
  setTopUpAmount,
}: Props) {
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
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Your favourites
              </p>
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
            </div>
          )}

          {/* Split the payment: the pledge is the favourite's worth; any
              extra generosity goes to the shared fund (founder principle,
              2026-07-31). Rides the same charge — see topUpAmount in
              use-pledge. Own-funds path only. */}
          {!useSharedFund && setTopUpAmount && (
            <div className="rounded bg-muted p-3">
              <div className="flex items-center justify-between gap-1.5">
                <label
                  htmlFor="dialog-top-up-amount"
                  className="text-xs text-muted-foreground"
                >
                  Add to the shared fund
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
                      <Info className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-56 text-xs leading-relaxed"
                  >
                    Your pledge is what your favourite&apos;s worth. Anything
                    extra goes here — it helps guests who can&apos;t pledge
                    themselves take part.
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative mt-2">
                <span
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  £
                </span>
                <input
                  id="dialog-top-up-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={topUpAmount ?? ""}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-7 text-base focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="0"
                />
              </div>
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
