"use client"

import Link from "next/link"
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
  guestEmail: string
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
  clerkUserId: string | null
  setTopUpAmount: (v: string) => void
  setGuestEmail: (v: string) => void
  toggleFund: () => void
}

export function StepAmount({
  pledgeAmount,
  updatePledgeAmount,
  topUpAmount,
  guestEmail,
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
  clerkUserId,
  setTopUpAmount,
  setGuestEmail,
  toggleFund,
}: Props) {
  return (
    <div className="px-5 py-4">
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

          {/* Fund toggle */}
          {hasFund && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={toggleFund}
              aria-label={
                useSharedFund
                  ? "Use your own funds instead"
                  : "Use the shared fund instead"
              }
              className="w-full text-xs text-muted-foreground hover:text-primary"
            >
              {useSharedFund ? "Use your own funds" : "Use the shared fund"}
            </Button>
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!clerkUserId && (
            <div>
              <label
                htmlFor="dialog-guest-email"
                className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
              >
                Your email
              </label>
              <input
                id="dialog-guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="for your receipt and withdrawal link"
                className="mt-1 w-full border-b border-border bg-transparent py-1 text-base outline-none focus:border-primary"
                aria-label="Email address for receipt and withdrawal link"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                No account needed.{" "}
                <Link
                  href="/sign-in"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>{" "}
                to track your pledges over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
