"use client"

import { useState } from "react"
import Link from "next/link"
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AmountInput } from "@/components/pledge-card/amount-input"
import { AmountPresets } from "@/components/pledge-card/amount-presets"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import type { BreakdownLine } from "@/components/pledge-card/pledge-breakdown"
import { GBP } from "@/components/pledge-card/utils"

type FavouriteBreakdownLine = { label: string; amount: number }

type Props = {
  pledgeAmount: string
  topUpAmount: string
  guestEmail: string
  useSharedFund: boolean
  error: string | null
  submitting: boolean
  available: number
  hasFund: boolean
  numericPledge: number
  isPledgeValid: boolean
  fundOverAvailable: boolean
  fundBarPct: number
  fundBarColor: string
  ownCharge: number
  canOwnConfirm: boolean
  canFundConfirm: boolean
  ownBreakdown: { lines: BreakdownLine[]; total: { label: string; amount: number } } | null
  fundBreakdown: { lines: BreakdownLine[]; total: { label: string; amount: number } } | null
  favouriteBreakdown: FavouriteBreakdownLine[]
  charityBreakdown: FavouriteBreakdownLine[]
  charityNames: string[]
  clerkUserId: string | null
  updatePledgeAmount: (v: string) => void
  setTopUpAmount: (v: string) => void
  setGuestEmail: (v: string) => void
  toggleFund: () => void
  onNext: () => void
}

export function StepAmount({
  pledgeAmount,
  topUpAmount,
  guestEmail,
  useSharedFund,
  error,
  submitting,
  available,
  hasFund,
  numericPledge,
  isPledgeValid,
  fundOverAvailable,
  fundBarPct,
  fundBarColor,
  ownCharge,
  canOwnConfirm,
  canFundConfirm,
  ownBreakdown,
  fundBreakdown,
  favouriteBreakdown,
  charityBreakdown,
  charityNames,
  clerkUserId,
  updatePledgeAmount,
  setTopUpAmount,
  setGuestEmail,
  toggleFund,
  onNext,
}: Props) {
  const [showCharityBreakdown, setShowCharityBreakdown] = useState(false)

  const isNextDisabled = useSharedFund ? !canFundConfirm : !canOwnConfirm
  const nextLabel = submitting
    ? "Processing…"
    : useSharedFund
      ? "Pledge"
      : "Next →"

  return (
    <div className="space-y-4 px-5 py-4">
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

      <AmountInput
        id="dialog-pledge-amount"
        value={pledgeAmount}
        onChange={updatePledgeAmount}
      />
      <AmountPresets
        amounts={[5, 10, 20, 50]}
        value={pledgeAmount}
        onChange={updatePledgeAmount}
      />

      {/* Per-favourite breakdown (primary, always visible when amount set) */}
      {isPledgeValid && favouriteBreakdown.length > 0 && (
        <div className="space-y-1.5 border-t border-border pt-3 text-xs">
          {favouriteBreakdown.map((line, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{line.label}</span>
              <span className="font-medium tabular-nums">
                {GBP.format(line.amount)}
              </span>
            </div>
          ))}

          {/* Per-charity secondary (collapsible, only when 2+ charities) */}
          {charityBreakdown.length > 0 && (
            <div className="pt-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={() => setShowCharityBreakdown((v) => !v)}
              >
                {showCharityBreakdown ? (
                  <>
                    Hide <ChevronUpIcon className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    See how this is split{" "}
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
              {showCharityBreakdown && (
                <div className="mt-2 space-y-1">
                  {charityBreakdown.map((line, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{line.label}</span>
                      <span className="font-medium tabular-nums">
                        {GBP.format(line.amount)}
                      </span>
                    </div>
                  ))}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Split equally between {charityNames.length} charities
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top-up — own funds only */}
      {!useSharedFund && (
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
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-7 text-base focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>
      )}

      {/* Shared fund bar + warning */}
      {useSharedFund && (
        <div className="space-y-3">
          <div>
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
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isPledgeValid && available > 0
                ? `Using ${GBP.format(numericPledge)} of ${GBP.format(available)} available`
                : `${GBP.format(available)} available in the shared fund`}
            </p>
          </div>
          {fundOverAvailable && (
            <p className="text-[11px] text-destructive">
              Shared fund has {GBP.format(available)} available — reduce your
              pledge to use it
            </p>
          )}
        </div>
      )}

      {/* Fee + total breakdown */}
      {(ownBreakdown ?? fundBreakdown) && (
        <PledgeBreakdown {...(ownBreakdown ?? fundBreakdown)!} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Guest email */}
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

      {/* Shared fund toggle */}
      {hasFund && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full items-center justify-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
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
            className="w-full text-muted-foreground hover:text-primary"
          >
            {useSharedFund ? "Use your own funds" : "Use the shared fund"}
          </Button>
        </div>
      )}

      {/* Footer next button rendered here for mobile sheet (dialog uses footer slot) */}
      <Button
        type="button"
        className="h-11 w-full text-base md:hidden"
        disabled={isNextDisabled}
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </div>
  )
}
