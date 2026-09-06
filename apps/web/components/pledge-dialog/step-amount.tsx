"use client"

import { formatPoundsExact } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

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
              Give what feels right. Processed securely by Stripe — favpoll
              takes no platform fee.
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
  toggleFund: () => void
  /** Admin-curated impact lines per charity ("£20 funds an hour…") */
  impactStatements?: string[]
}

/**
 * LEAN since 2026-09-06 (the four-step flow): the amount, the presets, the
 * fund tabs — nothing else. The split became its own step, and the tip and
 * itemised bill moved to the review page, where they are read at the
 * moment of payment.
 */
export function StepAmount({
  pledgeAmount,
  updatePledgeAmount,
  useSharedFund,
  hasFund,
  toggleFund,
  impactStatements,
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
                Use shared fund
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
    </div>
  )
}
