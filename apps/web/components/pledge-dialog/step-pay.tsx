"use client"

import { StripeCheckout } from "@/components/stripe-checkout"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount: number
  onSuccess: (email?: string) => void
  onBack: () => void
  onSubmittingChange?: (v: boolean) => void
  onStripeReadyChange?: (ready: boolean) => void
  showEmailCapture?: boolean
  /** Guest-wall identity (anonymity model, 2026-07-05) */
  isGuest: boolean
  displayName: string
  onDisplayNameChange: (v: string) => void
  isAnonymous: boolean
  onIsAnonymousChange: (v: boolean) => void
}

export function StepPay({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onBack,
  onSubmittingChange,
  onStripeReadyChange,
  showEmailCapture,
  isGuest,
  displayName,
  onDisplayNameChange,
  isAnonymous,
  onIsAnonymousChange,
}: Props) {
  return (
    <div className="px-5 py-4">
      <div className="mb-4 space-y-2.5 border-b border-border pb-4">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          On the guest wall
        </p>
        {isGuest ? (
          <Input
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Your name (optional)"
            aria-label="Name shown on the guest wall"
          />
        ) : (
          <p className="text-sm text-foreground">
            You&apos;ll appear as your account name.
          </p>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={isAnonymous}
            onCheckedChange={onIsAnonymousChange}
            aria-label="Hide my name from the guest wall"
          />
          Hide my name from the guest wall
        </label>
        <p className="text-[11px] text-muted-foreground">
          The organiser can always see your name for thank-yous.
          {isGuest ? " Leave the name blank to appear as “Someone”." : ""}
        </p>
      </div>
      <StripeCheckout
        inline
        formId="pledge-checkout-form"
        clientSecret={clientSecret}
        chargeAmount={chargeAmount}
        charityAmount={charityAmount}
        onSuccess={onSuccess}
        onClose={onBack}
        onSubmittingChange={onSubmittingChange}
        onStripeReadyChange={onStripeReadyChange}
        showEmailCapture={showEmailCapture}
      />
    </div>
  )
}
