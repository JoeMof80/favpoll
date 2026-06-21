"use client"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { StripeCheckout } from "@/components/stripe-checkout"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AmountInput } from "./amount-input"
import { AmountPresets } from "./amount-presets"
import { PledgeBreakdown } from "./pledge-breakdown"
import { usePledge } from "./use-pledge"
import {
  GBP,
  FUND_GREEN,
  FUND_AMBER,
  FUND_RED,
  formatCharityLabel,
} from "./utils"

type PrePublishProps = {
  prePublish: true
  pledgeAmount?: string
  onPledgeAmountChange?: (amount: string) => void
  charityNames?: string[]
}

type LiveProps = {
  prePublish?: false | undefined
  favpollId: string
  clerkUserId: string | null
  charityNames: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  pollSelections: Record<string, string[]>
  onPledgeAmountChange: (amount: string) => void
  onPledgeSuccess?: () => void
}

type Props = PrePublishProps | LiveProps

function PreviewPledgeCard({
  pledgeAmount: externalAmount,
  onPledgeAmountChange,
  charityNames = [],
}: {
  pledgeAmount?: string
  onPledgeAmountChange?: (amount: string) => void
  charityNames?: string[]
}) {
  const [internalAmount, setInternalAmount] = useState("")
  const pledgeAmount = externalAmount ?? internalAmount
  const setPledgeAmount = onPledgeAmountChange ?? setInternalAmount
  const [topUpAmount, setTopUpAmount] = useState("")
  const [useSharedFund, setUseSharedFund] = useState(false)

  const numericPledge = parseFloat(pledgeAmount) || 0
  const numericTopUp = parseFloat(topUpAmount) || 0
  const available = numericTopUp
  const isPledgeValid = numericPledge > 0
  const isTopUpValid = numericTopUp > 0
  const fundBarPct = available > 0 ? numericPledge / available : 0
  const fundBarColor =
    fundBarPct <= 0.8 ? FUND_GREEN : fundBarPct <= 1.0 ? FUND_AMBER : FUND_RED
  const fundOverAvailable = available > 0 && numericPledge > available

  const ownCharge =
    numericPledge + numericTopUp > 0
      ? Math.round((numericPledge + numericTopUp) * 1.03 * 100) / 100
      : 0
  const ownFee =
    Math.round((ownCharge - (numericPledge + numericTopUp)) * 100) / 100
  const charityLabel = formatCharityLabel(charityNames)

  const ownBreakdown =
    !useSharedFund && isPledgeValid
      ? {
          lines: [
            { label: `To ${charityLabel}`, amount: numericPledge },
            {
              label: "Shared fund contribution",
              amount: numericTopUp,
              hidden: !isTopUpValid,
            },
            { label: "Platform fee (3%)", amount: ownFee },
          ],
          total: { label: "Total charged", amount: ownCharge },
        }
      : null

  const fundBreakdown =
    useSharedFund && isPledgeValid && !fundOverAvailable
      ? {
          lines: [
            { label: `To ${charityLabel}`, amount: numericPledge },
            { label: "Deducted from shared fund", amount: numericPledge },
          ],
          total: { label: "Charged to you", amount: 0 },
        }
      : null

  return (
    <div className="space-y-4">
      <AmountInput
        id="pledge-amount"
        value={pledgeAmount}
        onChange={setPledgeAmount}
      />
      <AmountPresets
        amounts={[5, 10, 20, 50]}
        value={pledgeAmount}
        onChange={setPledgeAmount}
      />

      {/* Top-up — own funds only */}
      {!useSharedFund && (
        <div className="rounded bg-muted p-3">
          <div className="flex items-center justify-between gap-1.5">
            <label
              htmlFor="preview-top-up-amount"
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
              id="preview-top-up-amount"
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

      {/* Fund extras — progress bar + over-available warning */}
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
                : available > 0
                  ? `${GBP.format(available)} available in the shared fund`
                  : "No funds in the shared fund yet"}
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

      {/* Breakdown */}
      {(ownBreakdown ?? fundBreakdown) && (
        <PledgeBreakdown {...(ownBreakdown ?? fundBreakdown)!} />
      )}

      {/* Confirm */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          className="h-11 w-full text-base"
          onClick={() =>
            toast.warning("Publish your favpoll to start receiving pledges.", {
              style: {
                background: "#fffbeb",
                color: "#f59e0b",
                border: "1px solid #f59e0b",
              },
              position: "top-center",
            })
          }
        >
          Pledge favourites
        </Button>
        <div className="my-1 flex w-full items-center justify-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setUseSharedFund((v) => !v)}
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
    </div>
  )
}

export function LivePledgeCard(props: LiveProps) {
  const {
    pledgeAmount,
    topUpAmount,
    guestEmail,
    useSharedFund,
    pledgeClientSecret,
    error,
    submitting,
    available,
    hasFund,
    numericPledge,
    ownCharge,
    isPledgeValid,
    fundOverAvailable,
    fundBarPct,
    fundBarColor,
    canOwnConfirm,
    canFundConfirm,
    ownBreakdown,
    fundBreakdown,
    updatePledgeAmount,
    setTopUpAmount,
    setGuestEmail,
    toggleFund,
    setPledgeClientSecret,
    setSubmitting,
    handleOwnConfirm,
    handleFundConfirm,
    handlePledgePaymentSuccess,
  } = usePledge(props)

  return (
    <div className="space-y-4">
      {pledgeClientSecret && (
        <StripeCheckout
          clientSecret={pledgeClientSecret}
          charityAmount={numericPledge}
          chargeAmount={ownCharge}
          onSuccess={handlePledgePaymentSuccess}
          onClose={() => {
            setPledgeClientSecret(null)
            setSubmitting(false)
          }}
        />
      )}

      <AmountInput
        id="pledge-amount"
        value={pledgeAmount}
        onChange={updatePledgeAmount}
      />
      <AmountPresets
        amounts={[5, 10, 20, 50]}
        value={pledgeAmount}
        onChange={updatePledgeAmount}
      />

      {/* Top-up — own funds only */}
      {!useSharedFund && (
        <div className="rounded bg-muted p-3">
          <div className="flex items-center justify-between gap-1.5">
            <label
              htmlFor="top-up-amount"
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
              id="top-up-amount"
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

      {/* Fund extras — progress bar + over-available warning */}
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
              {isPledgeValid
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

      {/* Breakdown */}
      {(ownBreakdown ?? fundBreakdown) && (
        <PledgeBreakdown {...(ownBreakdown ?? fundBreakdown)!} />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Guest email */}
      {!props.clerkUserId && (
        <div>
          <label
            htmlFor="guest-email"
            className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
          >
            Your email
          </label>
          <input
            id="guest-email"
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

      {/* Confirm */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          onClick={useSharedFund ? handleFundConfirm : handleOwnConfirm}
          disabled={useSharedFund ? !canFundConfirm : !canOwnConfirm}
          className="h-11 w-full text-base"
        >
          {submitting ? "Processing…" : "Pledge favourites"}
        </Button>

        {/* Shared fund trigger */}
        {hasFund && (
          <>
            <div className="my-1 flex w-full items-center justify-center gap-4">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border"></div>
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
          </>
        )}
      </div>
    </div>
  )
}

export function PledgeCard(props: Props) {
  if (props.prePublish) {
    return (
      <PledgeCardWrapper>
        <PreviewPledgeCard
          pledgeAmount={props.pledgeAmount}
          onPledgeAmountChange={props.onPledgeAmountChange}
          charityNames={props.charityNames}
        />
      </PledgeCardWrapper>
    )
  }
  return (
    <PledgeCardWrapper>
      <LivePledgeCard {...props} />
    </PledgeCardWrapper>
  )
}

export function PledgeCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between gap-1.5">
        <label
          htmlFor="pledge-amount"
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
            favourites. Add more to the shared fund, if you wish. All pledges
            are anonymous.
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  )
}
