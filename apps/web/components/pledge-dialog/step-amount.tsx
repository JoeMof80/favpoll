"use client"

import { formatPoundsExact } from "@/lib/i18n"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

const PRESETS = [5, 10, 20, 50]

type FavouriteBreakdownLine = { label: string; amount: number }

type HeaderProps = {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
  /** The shared-pot figure beside it (two-part entry, founder mock
   *  2026-09-06) — omit to render the single-figure header. */
  fundAmount?: string
  onFundAmountChange?: (v: string) => void
  favouriteCount?: number
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
  fundAmount = "",
  onFundAmountChange,
  favouriteCount = 0,
  useSharedFund = false,
  available = 0,
  numericPledge = 0,
  isPledgeValid = false,
  fundOverAvailable = false,
  error = null,
}: HeaderProps) {
  // Two co-equal figures on the card path WITH a favourite picked. A
  // no-pick pledge takes the single-figure path (founder, 2026-09-06):
  // with nothing on the favourite side there is no pair to hold.
  const twoUp = !useSharedFund && !!onFundAmountChange && favouriteCount > 0
  const numericFund = parseFloat(fundAmount)
  const fundQuiet = isNaN(numericFund) || numericFund <= 0
  // The header's block-end carries only the fund-mode lines and errors —
  // the fee line lives in the body's shared-pot note, so the slider
  // sits right under the figures (founder, 2026-09-06).
  const hasBlockEnd = useSharedFund || !!error
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
          {twoUp
            ? favouriteCount === 1
              ? "Favourite"
              : "Favourites"
            : "Your pledge"}
        </label>
        {twoUp && (
          <label
            htmlFor="dialog-fund-amount"
            className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
          >
            Shared pot
          </label>
        )}
      </InputGroupAddon>

      <div
        className={
          hasBlockEnd
            ? "flex w-full items-baseline gap-4 px-5 py-3"
            : "flex w-full items-baseline gap-4 px-5 pt-3 pb-4"
        }
      >
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
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
            aria-label={
              twoUp
                ? "Amount your favourites are worth, in pounds"
                : "Pledge amount in pounds"
            }
            className="w-full min-w-0 border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        {twoUp && (
          <div className="flex shrink-0 items-baseline justify-end gap-1.5">
            <span
              className="text-2xl text-muted-foreground select-none"
              aria-hidden="true"
            >
              £
            </span>
            <input
              id="dialog-fund-amount"
              type="number"
              min="0"
              step="0.01"
              value={fundAmount}
              onChange={(e) => onFundAmountChange!(e.target.value)}
              placeholder="0"
              aria-label="Shared pot amount in pounds, on top of your pledge"
              // Sized to its digits so the figure sits flush right; quiet
              // ink until the fund actually holds money (founder,
              // 2026-09-06).
              style={{ width: `${Math.max(1, fundAmount.length)}ch` }}
              className={`border-0 bg-transparent text-right text-3xl outline-none placeholder:text-muted-foreground focus:text-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                fundQuiet ? "text-muted-foreground" : "text-foreground"
              }`}
            />
          </div>
        )}
      </div>

      {hasBlockEnd && (
        <InputGroupAddon align="block-end" className="px-5 pb-4">
          <div className="w-full space-y-1.5">
            {useSharedFund && !fundOverAvailable && (
              <p className="text-[11px] text-muted-foreground">
                {isPledgeValid && available > 0
                  ? `Using ${formatPoundsExact(numericPledge)} of ${formatPoundsExact(available)} available`
                  : `${formatPoundsExact(available)} available in the shared pot`}
              </p>
            )}
            {useSharedFund && fundOverAvailable && (
              <p className="text-[11px] text-destructive">
                Shared pot has {formatPoundsExact(available)} available — reduce
                your pledge to use it
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

type Props = {
  pledgeAmount: string
  updatePledgeAmount: (v: string) => void
  useSharedFund: boolean
  hasFund: boolean
  toggleFund: () => void
  /** Admin-curated impact lines per charity ("£20 funds an hour…") */
  impactStatements?: string[]
  /** Two-part entry (founder mock, 2026-09-06): omit onFavShare (hero
   *  demo) to hide the slider and list entirely. */
  favouriteBreakdown?: FavouriteBreakdownLine[]
  /** Pounds in the shared pot, on top of the pledge. */
  fundPart?: number
  /** Set the favourites' share of the current sum (the slider). */
  onFavShare?: (pounds: number) => void
}

/**
 * Two-part entry (founder mock, 2026-09-06, superseding total-then-split):
 * the header holds TWO figures — the favourites' worth and the shared
 * pot on top — and the slider here rebalances their sum without
 * changing it. Presets set the favourites side ("pledge its worth").
 * The tip and the itemised bill live on the review page.
 */
export function StepAmount({
  pledgeAmount,
  updatePledgeAmount,
  useSharedFund,
  hasFund,
  toggleFund,
  impactStatements,
  favouriteBreakdown = [],
  fundPart = 0,
  onFavShare,
}: Props) {
  const numericFav = parseFloat(pledgeAmount)
  const favShare = !isNaN(numericFav) && numericFav > 0 ? numericFav : 0
  const total = Math.round((favShare + fundPart) * 100) / 100
  const showSplit =
    !useSharedFund && !!onFavShare && total > 0 && favouriteBreakdown.length > 0
  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-5">
        {/* The slider rebalances the header's two figures — favourites on
            the left (primary fill), shared pot on the right — moving
            whole pounds while the sum holds still. */}
        {showSplit && (
          <Slider
            value={[favShare]}
            min={0}
            max={Math.max(1, total)}
            step={1}
            onValueChange={([v]) => onFavShare!(v)}
            aria-label="Pounds to your favourites"
            trackClassName="bg-chart-3/40"
            rangeClassName="bg-primary"
          />
        )}

        {/* Presets quick-set the favourites' worth — a horizontal row at
            every width, matching the pledge card and hero demo */}
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
        </div>

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
                Use shared pot
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* The list, re-pricing live as either figure moves */}
        {showSplit && (
          <div className="space-y-3 border-t border-border pt-4">
            {favouriteBreakdown.map((line, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-base">{line.label}</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatPoundsExact(line.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-base">Shared pot</span>
              <span className="text-base font-semibold tabular-nums">
                {formatPoundsExact(fundPart)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
