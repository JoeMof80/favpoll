"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { usePledgeDialog } from "./use-pledge-dialog"
import { PickerHeader, PickerItems } from "./step-pick-favourites"
import { StepAmount, StepAmountHeader } from "./step-amount"
import { StepPay } from "./step-pay"

type Props = {
  eventId: string
  clerkUserId: string | null
  charityNames: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  onPledgeSuccess?: () => void
  onAddItem?: (label: string) => Promise<void>
  isListed?: boolean
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol role="list" aria-label="Progress" className="flex gap-1.5">
      {([1, 2, 3] as const).map((n) => (
        <li
          key={n}
          role="listitem"
          aria-label={`Step ${n} of 3`}
          aria-current={step === n ? "step" : undefined}
          className={`text-sm ${step === n ? "text-primary" : "text-muted-foreground/40"}`}
        >
          {step === n ? "●" : "○"}
        </li>
      ))}
    </ol>
  )
}

export function PledgeDialog({
  eventId,
  clerkUserId,
  charityNames,
  pollWithItems,
  pot,
  userPotAllocation,
  onPledgeSuccess,
  onAddItem,
  isListed,
}: Props) {
  const [open, setOpen] = useState(false)
  const [stripeSubmitting, setStripeSubmitting] = useState(false)
  const [stripeReady, setStripeReady] = useState(false)

  const triggerButton = (
    <Button
      type="button"
      variant="secondary"
      className="w-full text-base"
      onClick={() => setOpen(true)}
    >
      Pledge favourites
    </Button>
  )

  const dialog = usePledgeDialog({
    eventId,
    clerkUserId,
    charityNames,
    pollWithItems,
    pot,
    userPotAllocation,
    onPledgeSuccess: () => {
      onPledgeSuccess?.()
      setOpen(false)
    },
    onAddItem,
  })

  // Reset Stripe state whenever we leave step 3 (back or re-entry)
  useEffect(() => {
    if (dialog.step !== 3) {
      setStripeSubmitting(false)
      setStripeReady(false)
    }
  }, [dialog.step])

  function handleOpenChange(o: boolean) {
    if (!o) dialog.handleClose()
    setOpen(o)
  }

  const topicTitle = pollWithItems.topics.title

  // Step 2 header: amount input + presets (always visible, doesn't scroll)
  const step2Header = (
    <StepAmountHeader
      pledgeAmount={dialog.pledgeAmount}
      updatePledgeAmount={dialog.updatePledgeAmount}
    />
  )

  // Step 1 header: the chip+search picker field
  const step1Header = (
    <PickerHeader
      search={dialog.search}
      onSearchChange={dialog.setSearch}
      onAdd={dialog.handleAdd}
      draftIds={dialog.draftIds}
      items={pollWithItems.topics.favourites}
      onDeselect={dialog.toggleDraft}
      topicTitle={topicTitle}
      showCreate={dialog.showCreate}
      addingItem={dialog.addingItem}
    />
  )

  // Step 1 footer
  const step1Footer = (
    <Button
      type="button"
      className="w-full text-base"
      disabled={!dialog.canAdvanceStep1}
      onClick={() => dialog.handleNext()}
    >
      Next →
    </Button>
  )

  // Step 2/3 footer (desktop dialog only — mobile renders its own button in step body)
  const isNextDisabled = dialog.useSharedFund
    ? !dialog.canFundConfirm
    : !dialog.canOwnConfirm
  const nextLabel = dialog.submitting
    ? "Processing…"
    : dialog.useSharedFund
      ? "Pledge"
      : "Next →"

  const step2Footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={dialog.handleBack}
      >
        ← Back
      </Button>
      <Button
        type="button"
        className="flex-1 text-base"
        disabled={isNextDisabled}
        onClick={() => dialog.handleNext()}
      >
        {nextLabel}
      </Button>
    </div>
  )

  const step3Footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        disabled={stripeSubmitting}
        onClick={dialog.handleBack}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="pledge-checkout-form"
        className="flex-1"
        disabled={stripeSubmitting || !stripeReady}
      >
        {stripeSubmitting ? "Processing…" : "Pay now"}
      </Button>
    </div>
  )

  const titleByStep = {
    1: `Choose your favourite ${topicTitle.toLowerCase()}`,
    2: "Your pledge",
    3: "Complete payment",
  }

  const currentFooter =
    dialog.step === 1
      ? step1Footer
      : dialog.step === 2
        ? step2Footer
        : step3Footer

  return (
    <>
      {triggerButton}
      <ResponsiveOverlay
        open={open}
        onOpenChange={handleOpenChange}
        title={titleByStep[dialog.step]}
        header={
          dialog.step === 1
            ? step1Header
            : dialog.step === 2
              ? step2Header
              : undefined
        }
        footer={currentFooter}
        headerClassName={dialog.step === 1 ? "px-4 py-3" : "px-5 py-4"}
        dialogContentClassName="flex-1 overflow-y-auto"
      >
        {dialog.step === 1 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">
                {dialog.draftIds.length === 0
                  ? "Select one or more"
                  : `${dialog.draftIds.length} selected`}
              </span>
              <StepIndicator step={1} />
            </div>
            <PickerItems
              filteredItems={dialog.filteredItems}
              draftIds={dialog.draftIds}
              showCreate={dialog.showCreate}
              search={dialog.search}
              isInfinite={!pollWithItems.topics.is_finite}
              hasAddItem={!!onAddItem}
              onToggle={dialog.toggleDraft}
              addError={dialog.addError}
            />
          </div>
        )}

        {dialog.step === 2 && (
          <StepAmount
            pledgeAmount={dialog.pledgeAmount}
            updatePledgeAmount={dialog.updatePledgeAmount}
            topUpAmount={dialog.topUpAmount}
            useSharedFund={dialog.useSharedFund}
            error={dialog.error}
            available={dialog.available}
            hasFund={dialog.hasFund}
            numericPledge={dialog.numericPledge}
            isPledgeValid={dialog.isPledgeValid}
            fundOverAvailable={dialog.fundOverAvailable}
            fundBarPct={dialog.fundBarPct}
            fundBarColor={dialog.fundBarColor}
            ownBreakdown={dialog.ownBreakdown}
            fundBreakdown={dialog.fundBreakdown}
            favouriteBreakdown={dialog.favouriteBreakdown}
            setTopUpAmount={dialog.setTopUpAmount}
            toggleFund={dialog.toggleFund}
            isListed={isListed}
          />
        )}

        {dialog.step === 3 && dialog.pledgeClientSecret && (
          <StepPay
            clientSecret={dialog.pledgeClientSecret}
            chargeAmount={dialog.ownCharge}
            charityAmount={dialog.numericPledge}
            onSuccess={dialog.handlePledgePaymentSuccess}
            onBack={dialog.handleBack}
            onSubmittingChange={setStripeSubmitting}
            onStripeReadyChange={setStripeReady}
            showEmailCapture={!clerkUserId}
          />
        )}
      </ResponsiveOverlay>
    </>
  )
}
