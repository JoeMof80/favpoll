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
import { PollHeading } from "../poll-heading"

type Props = {
  favpollId: string
  clerkUserId: string | null
  charityNames: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  onPledgeSuccess?: (guestToken?: string) => void
  onAddItem?: (label: string) => Promise<void>
  isListed?: boolean
  /** Controlled mode — if provided, the internal trigger button is suppressed */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PledgeDialog({
  favpollId,
  clerkUserId,
  charityNames,
  pollWithItems,
  pot,
  userPotAllocation,
  onPledgeSuccess,
  onAddItem,
  isListed,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const [stripeSubmitting, setStripeSubmitting] = useState(false)
  const [stripeReady, setStripeReady] = useState(false)

  function setOpen(o: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(o)
    } else {
      setInternalOpen(o)
    }
  }

  const triggerButton = !isControlled ? (
    <PollHeading
      topicTitle={pollWithItems.topics.title}
      size="md"
      onPledge={() => setOpen(true)}
    />
  ) : null

  const dialog = usePledgeDialog({
    favpollId,
    clerkUserId,
    charityNames,
    pollWithItems,
    pot,
    userPotAllocation,
    onPledgeSuccess: (guestToken) => {
      onPledgeSuccess?.(guestToken)
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

  // Reset step state when dialog opens fresh (controlled mode re-open after close)
  useEffect(() => {
    if (isControlled && open && dialog.step !== 1) {
      dialog.handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isControlled])

  const topicTitle = pollWithItems.topics.title

  // Step 2 header: amount input with block-start label and block-end fund status
  const step2Header = (
    <StepAmountHeader
      pledgeAmount={dialog.pledgeAmount}
      updatePledgeAmount={dialog.updatePledgeAmount}
      useSharedFund={dialog.useSharedFund}
      available={dialog.available}
      numericPledge={dialog.numericPledge}
      isPledgeValid={dialog.isPledgeValid}
      fundOverAvailable={dialog.fundOverAvailable}
      error={dialog.error}
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

  const isNextDisabled = dialog.useSharedFund
    ? !dialog.canFundConfirm
    : !dialog.isPledgeValid || dialog.submitting
  const nextLabel = dialog.submitting ? "Processing…" : "Pledge"

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
        ← Back
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
        hideCloseButton
        header={
          dialog.step === 1
            ? step1Header
            : dialog.step === 2
              ? step2Header
              : undefined
        }
        footer={currentFooter}
        headerClassName={
          dialog.step === 1
            ? "px-4 py-3"
            : dialog.step === 2
              ? "p-0"
              : "px-5 py-4"
        }
        dialogContentClassName="flex-1 overflow-y-auto"
      >
        {dialog.step === 1 && (
          <div className="flex flex-col gap-2 px-5 py-4">
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
            useSharedFund={dialog.useSharedFund}
            hasFund={dialog.hasFund}
            ownBreakdown={dialog.ownBreakdown}
            fundBreakdown={dialog.fundBreakdown}
            favouriteBreakdown={dialog.favouriteBreakdown}
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
