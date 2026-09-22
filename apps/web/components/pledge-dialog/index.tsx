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
import {
  PickerHeader,
  PickerPills,
  AddFavouriteView,
} from "./step-pick-favourites"
import { StepAmount, StepAmountHeader } from "./step-amount"
import { StepPay } from "./step-pay"
import { StepGuestBook } from "./step-guest-book"
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
  /** Resolves to the new favourite's id so the picker can auto-pick it */
  onAddItem?: (label: string) => Promise<string | void>
  /** false defaults the contribution to None (memorials) */
  suggestTip?: boolean
  /** Organiser has enabled donation amounts in the guest book */
  showGuestAmounts?: boolean
  isListed?: boolean
  /** The favpoll's register palette — themes the portalled overlay. */
  dataRegister?: string | null
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
  showGuestAmounts = false,
  dataRegister,
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

  // Reset Stripe state whenever we leave the review step (back or re-entry)
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
      updatePledgeAmount={dialog.handleFavChange}
      fundAmount={dialog.topUpAmount}
      onFundAmountChange={dialog.handleFundChange}
      favouriteCount={dialog.favouriteBreakdown.length}
      useSharedFund={dialog.useSharedFund}
      available={dialog.available}
      numericPledge={dialog.numericPledge}
      isPledgeValid={dialog.isPledgeValid}
      fundOverAvailable={dialog.fundOverAvailable}
      error={dialog.error}
    />
  )

  // Step 1 has TWO views (option C, 2026-09-16): the pure-select picker,
  // and the focused add view the list-end row opens.
  const inAddView = dialog.step === 1 && dialog.pickerView === "add"

  const step1Header = inAddView ? undefined : (
    <PickerHeader
      search={dialog.search}
      onSearchChange={dialog.setSearch}
      topicTitle={topicTitle}
    />
  )

  // Select view footer — chips toggle, the primary commits. Its label
  // carries the state: "Next" with a selection; with none it IS the
  // no-favourite exit ("a gift with no favourite attached", 2026-08-17).
  // Add view footer — Back | Add ‘X’, disabled until there's text.
  const step1Footer = inAddView ? (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="ghost"
        className="h-11 flex-1 md:text-base"
        onClick={() => dialog.exitAddView()}
      >
        Back
      </Button>
      <Button
        type="button"
        className="h-11 flex-1 text-base"
        disabled={!dialog.addText.trim() || dialog.addingItem}
        onClick={() => dialog.handleAdd()}
      >
        {dialog.addingItem
          ? "Adding…"
          : dialog.addText.trim()
            ? `Add ${dialog.addText.trim()}`
            : "Add"}
      </Button>
    </div>
  ) : (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="ghost"
        className="h-11 flex-1 md:text-base"
        onClick={() => handleOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="h-11 flex-1 text-base"
        onClick={() => dialog.handleNext()}
      >
        {dialog.selectedIds.length > 0 ? "Next" : "Give without picking"}
      </Button>
    </div>
  )

  const isNextDisabled = dialog.useSharedFund
    ? !dialog.canFundConfirm
    : !dialog.isPledgeValid || dialog.submitting
  // The fund path pledges from step 2; the card path just moves on —
  // the commitment word belongs to the review step's Pay now.
  const step2Label = dialog.submitting
    ? "Processing…"
    : dialog.useSharedFund
      ? "Pledge"
      : "Next"

  const step2Footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="ghost"
        className="h-11 flex-1 md:text-base"
        onClick={dialog.handleBack}
      >
        Back
      </Button>
      <Button
        type="button"
        className="h-11 flex-1 text-base"
        disabled={isNextDisabled}
        onClick={() => dialog.handleNext()}
      >
        {step2Label}
      </Button>
    </div>
  )

  // giftAidComplete: switch off passes; on requires all four fields —
  // a half-filled declaration must not ride into the charge.
  const payDisabled =
    stripeSubmitting ||
    !stripeReady ||
    dialog.refreshingIntent ||
    !dialog.giftAidComplete
  const step3Footer = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="ghost"
        className="h-11 flex-1 md:text-base"
        disabled={stripeSubmitting}
        onClick={dialog.handleBack}
      >
        Back
      </Button>
      <Button
        type="submit"
        form="pledge-checkout-form"
        className="h-11 flex-1 md:text-base"
        disabled={payDisabled}
      >
        {stripeSubmitting ? "Processing…" : "Pay now"}
      </Button>
    </div>
  )

  // Step 3: guest book — lightweight, always advances with Next
  const step3GuestBookFooter = (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="ghost"
        className="h-11 flex-1 md:text-base"
        onClick={dialog.handleBack}
      >
        Back
      </Button>
      <Button
        type="button"
        className="h-11 flex-1 text-base"
        onClick={() => dialog.handleNext()}
        disabled={dialog.submitting}
      >
        {dialog.submitting ? "Processing…" : "Next"}
      </Button>
    </div>
  )

  const titleByStep: Record<number, string> = {
    1: `Pick your favourite ${topicTitle.toLowerCase()}`,
    2: "Your pledge",
    3: "Guest book",
    4: "Review & pay",
  }

  const footerByStep: Record<number, React.ReactNode> = {
    1: step1Footer,
    2: step2Footer,
    3: step3GuestBookFooter,
    4: step3Footer,
  }

  return (
    <>
      {triggerButton}
      <ResponsiveOverlay
        open={open}
        onOpenChange={handleOpenChange}
        title={titleByStep[dialog.step]}
        dataRegister={dataRegister}
        hideCloseButton
        header={
          dialog.step === 1
            ? step1Header
            : dialog.step === 2
              ? step2Header
              : // Steps 3 and 4's eyebrows live INSIDE the scrolling body
                // (the header slot pins, which is right for search fields
                // and wrong for a label — founder, 2026-09-16)
                undefined
        }
        hideTitle
        /* Transactions commit at the BOTTOM (overlay doctrine,
           2026-09-15): the pledge flow is a checkout, so Back/Next/Pay
           live in a bottom footer on every viewport — the big bottom
           Pay is the convention guests know. No top-bar actions: the
           fullscreen bar carries the title alone, and the keyboard
           inset keeps the footer above the keys. */
        footer={footerByStep[dialog.step]}
        fullscreenOnMobile
        /* Step 1's search header gets a hairline + air before the pills —
           the field-not-subtitle treatment (founder, 2026-09-16). ALL
           steps suppress the mobile title bar: every step's header slot
           carries its ask as an eyebrow (step 3 gets a plain eyebrow),
           so a visible title above it said the same thing twice. */
        separators={dialog.step === 1 && !inAddView}
        hideMobileTitleBar
        headerClassName={
          dialog.step === 1 && !inAddView ? "px-5 pt-4 pb-3" : "p-0"
        }
        bodyClassName="p-0"
        dialogContentClassName="flex-1 overflow-y-auto"
      >
        {dialog.step === 1 && !inAddView && (
          // min-h: searching filters the pills down and the bottom sheet
          // would shrink with them — on iOS the whole sheet then sinks
          // behind the keyboard. A stable floor keeps the input in view.
          <div className="min-h-80 px-5 pt-4 pb-4">
            <PickerPills
              filteredItems={dialog.filteredItems}
              selectedIds={dialog.selectedIds}
              search={dialog.search}
              isInfinite={!pollWithItems.topics.is_finite}
              hasAddItem={!!onAddItem}
              canAdd={dialog.canAdd}
              onToggle={dialog.toggleFavourite}
              onEnterAdd={dialog.enterAddView}
            />
          </div>
        )}
        {inAddView && (
          <div className="min-h-80">
            <AddFavouriteView
              topicTitle={topicTitle}
              addText={dialog.addText}
              onAddTextChange={dialog.setAddText}
              addingItem={dialog.addingItem}
              addError={dialog.addError}
              onAdd={dialog.handleAdd}
            />
          </div>
        )}

        {dialog.step === 2 && (
          <StepAmount
            pledgeAmount={dialog.pledgeAmount}
            updatePledgeAmount={dialog.handleFavChange}
            useSharedFund={dialog.useSharedFund}
            hasFund={dialog.hasFund}
            toggleFund={dialog.toggleFund}
            impactStatements={impactStatements}
            favouriteBreakdown={dialog.favouriteBreakdown}
            fundPart={dialog.fundPart}
            onFavShare={dialog.setFavShare}
            onRemoveFavourite={dialog.removeFavourite}
          />
        )}

        {dialog.step === 3 && (
          <StepGuestBook
            isGuest={!clerkUserId}
            displayName={dialog.displayName}
            onDisplayNameChange={dialog.setDisplayName}
            isAnonymous={dialog.isAnonymous}
            onIsAnonymousChange={dialog.setIsAnonymous}
            pledgeMessage={dialog.pledgeMessage}
            onPledgeMessageChange={dialog.setPledgeMessage}
            showAmountToggle={showGuestAmounts && !dialog.useSharedFund}
            hideAmount={dialog.hideAmount}
            onHideAmountChange={dialog.setHideAmount}
          />
        )}

        {dialog.step === 4 && dialog.pledgeClientSecret && (
          <p className="px-5 pt-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Review &amp; pay
          </p>
        )}
        {dialog.step === 4 && dialog.pledgeClientSecret && (
          <StepPay
            clientSecret={dialog.pledgeClientSecret}
            chargeAmount={dialog.ownCharge}
            charityAmount={dialog.numericPledge}
            ownBreakdown={dialog.ownBreakdown}
            favouriteBreakdown={dialog.favouriteBreakdown}
            fundPart={dialog.fundPart}
            tipAmount={dialog.tipAmount}
            tipOptions={dialog.tipOptions}
            onTipChange={dialog.updateTip}
            refreshingIntent={dialog.refreshingIntent}
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
            giftAid={dialog.giftAid}
            onGiftAidChange={dialog.setGiftAid}
            giftAidFirstName={dialog.giftAidFirstName}
            onGiftAidFirstNameChange={dialog.setGiftAidFirstName}
            giftAidLastName={dialog.giftAidLastName}
            onGiftAidLastNameChange={dialog.setGiftAidLastName}
            giftAidHouse={dialog.giftAidHouse}
            onGiftAidHouseChange={dialog.setGiftAidHouse}
            giftAidPostcode={dialog.giftAidPostcode}
            onGiftAidPostcodeChange={dialog.setGiftAidPostcode}
          />
        )}
      </ResponsiveOverlay>
    </>
  )
}
