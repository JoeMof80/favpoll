"use client"

import { StripeCheckout } from "@/components/stripe-checkout"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount: number
  onSuccess: (email?: string) => void | Promise<void>
  onBack: () => void
  preflight?: (email?: string) => Promise<{
    message: string
    signInEmail?: string
    authMode?: "sign-in" | "sign-up"
  } | null>
  onSubmittingChange?: (v: boolean) => void
  onStripeReadyChange?: (ready: boolean) => void
  showEmailCapture?: boolean
  /** Wall identity (anonymity model, 2026-07-05) */
  isGuest: boolean
  guestEmail: string
  onGuestEmailChange: (v: string) => void
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
  preflight,
  onSubmittingChange,
  onStripeReadyChange,
  showEmailCapture,
  isGuest,
  guestEmail,
  onGuestEmailChange,
  displayName,
  onDisplayNameChange,
  isAnonymous,
  onIsAnonymousChange,
}: Props) {
  return (
    <div className="px-5 py-4">
      {/* One legible unit in the house header grammar: block-start label,
          the control, block-end caption — not four floating fragments */}
      {/* One identity unit — email (required) and wall name were two
          cards with the charge lines between; the email read as an
          afterthought (founder, 2026-07-26). */}
      <div className="mb-4 rounded-lg border border-border bg-card">
        <p className="px-4 pt-3 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
          {isGuest ? "Your details" : "On the wall of favourites"}
        </p>
        <div className="space-y-2.5 px-4 py-2.5">
          {isGuest && (
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => onGuestEmailChange(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address for receipt and withdrawal link"
            />
          )}
          {isGuest ? (
            <Input
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Your name (optional)"
              aria-label="Name shown on the wall of favourites"
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
              aria-label="Hide my name from the wall of favourites"
            />
            Hide my name from the wall of favourites
          </label>
        </div>
        <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          {isGuest
            ? "Your receipt and withdrawal link go to this email — no account needed. The organiser can always see your name; leave it blank to appear as “Someone”."
            : "The organiser can always see your name for thank-yous."}
        </p>
      </div>
      <StripeCheckout
        inline
        formId="pledge-checkout-form"
        clientSecret={clientSecret}
        chargeAmount={chargeAmount}
        charityAmount={charityAmount}
        onSuccess={onSuccess}
        preflight={preflight}
        onClose={onBack}
        onSubmittingChange={onSubmittingChange}
        onStripeReadyChange={onStripeReadyChange}
        showEmailCapture={false}
        externalEmail={isGuest ? guestEmail : undefined}
      />
    </div>
  )
}
