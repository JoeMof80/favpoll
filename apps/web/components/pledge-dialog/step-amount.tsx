"use client"

import type { BreakdownLine } from "@/components/pledge-card/pledge-breakdown"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import { GBP } from "@/components/pledge-card/utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
              Processed securely by Stripe. A small platform fee is included in
              your total.
            </p>
          )}
          {useSharedFund && !fundOverAvailable && (
            <p className="text-[11px] text-muted-foreground">
              {isPledgeValid && available > 0
                ? `Using ${GBP.format(numericPledge)} of ${GBP.format(available)} available`
                : `${GBP.format(available)} available in the shared fund`}
            </p>
          )}
          {useSharedFund && fundOverAvailable && (
            <p className="text-[11px] text-destructive">
              Shared fund has {GBP.format(available)} available — reduce your
              pledge to use it
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
  isListed?: boolean
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
  isListed,
}: Props) {
  return (
    <div className="px-5 py-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-5">
        {/* ── Left column: presets + listed notice ── */}
        <div className="flex flex-col gap-3 sm:col-span-2">
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
          {isListed && (
            <p className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
              This is a public favpoll. Your pledge amount and identity are
              always private.
            </p>
          )}
        </div>

        {/* ── Right column: favourites → tabs → breakdown ── */}
        <div className="flex flex-col gap-4 sm:col-span-3">
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
        </div>
      </div>
    </div>
  )
}
