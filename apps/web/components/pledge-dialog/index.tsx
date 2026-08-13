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
  impactStatements?: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  onPledgeSuccess?: (guestToken?: string) => void
  onAddItem?: (label: string) => Promise<void>
  /** false defaults the contribution to None (memorials) */
  suggestTip?: boolean
  isListed?: boolean
  /** Controlled mode — if provided, the internal trigger button is suppressed */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PledgeDialog({
  favpollId,
  clerkUserId,
  charityNames,
  impactStatements,
  pollWithItems,
  pot,
  userPotAllocation,
  onPledgeSuccess,
  onAddItem,
  suggestTip,
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
    suggestTip,
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
      pledgeAmount={dialog.totalInput}
      updatePledgeAmount={dialog.handleTotalChange}
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
      canAdd={dialog.canAdd}
      addingItem={dialog.addingItem}
    />
  )

  // Step 1 footer — Cancel gives the dialog a visible exit (the × is
  // hidden and outside-click dismissal has no affordance)
  const step1Footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => handleOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="flex-1 text-base"
        disabled={!dialog.canAdvanceStep1}
        onClick={() => dialog.handleNext()}
      >
        Next →
      </Button>
    </div>
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
    1: `Pick your favourite ${topicTitle.toLowerCase()}`,
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
        fullscreenOnMobile
        mobileBack={
          dialog.step === 1
            ? { label: "Cancel", onClick: () => handleOpenChange(false) }
            : {
                label: "Back",
                onClick: dialog.handleBack,
                disabled: dialog.step === 3 && stripeSubmitting,
              }
        }
        mobileSave={
          dialog.step === 1
            ? {
                label: "Next",
                onClick: () => dialog.handleNext(),
                disabled: !dialog.canAdvanceStep1,
              }
            : dialog.step === 2
              ? {
                  label: nextLabel,
                  onClick: () => dialog.handleNext(),
                  disabled: isNextDisabled,
                }
              : {
                  label: stripeSubmitting ? "Processing…" : "Pay now",
                  form: "pledge-checkout-form",
                  disabled: stripeSubmitting || !stripeReady,
                }
        }
        headerClassName={
          dialog.step === 1 || dialog.step === 2 ? "p-0" : "px-5 py-4"
        }
        bodyClassName="p-0"
        dialogContentClassName="flex-1 overflow-y-auto"
      >
        {dialog.step === 1 && (
          // min-h: searching filters the chips down and the bottom sheet
          // would shrink with them — on iOS the whole sheet then sinks
          // behind the keyboard. A stable floor keeps the input in view.
          <div className="flex min-h-80 flex-col gap-2 px-5 pt-1 pb-4">
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
            pledgeAmount={dialog.totalInput}
            updatePledgeAmount={dialog.handleTotalChange}
            useSharedFund={dialog.useSharedFund}
            hasFund={dialog.hasFund}
            ownBreakdown={dialog.ownBreakdown}
            fundBreakdown={dialog.fundBreakdown}
            favouriteBreakdown={dialog.favouriteBreakdown}
            toggleFund={dialog.toggleFund}
            impactStatements={impactStatements}
            tipAmount={dialog.tipAmount}
            setTipAmount={dialog.setTipAmount}
            tipOptions={dialog.tipOptions}
            isListed={isListed}
            fundPart={dialog.fundPart}
            onFundStep={dialog.stepFund}
          />
        )}

        {dialog.step === 3 && dialog.pledgeClientSecret && (
          <StepPay
            clientSecret={dialog.pledgeClientSecret}
            chargeAmount={dialog.ownCharge}
            charityAmount={dialog.numericPledge}
            guestEmail={dialog.guestEmail}
            onGuestEmailChange={dialog.setGuestEmail}
            onSuccess={dialog.handlePledgePaymentSuccess}
            preflight={dialog.pledgePreflight}
            onBack={dialog.handleBack}
            onSubmittingChange={setStripeSubmitting}
            onStripeReadyChange={setStripeReady}
            showEmailCapture={!clerkUserId}
            isGuest={!clerkUserId}
            displayName={dialog.displayName}
            onDisplayNameChange={dialog.setDisplayName}
            isAnonymous={dialog.isAnonymous}
            onIsAnonymousChange={dialog.setIsAnonymous}
          />
        )}
      </ResponsiveOverlay>
    </>
  )
}
