"use client"

import { StripeCheckout } from "@/components/stripe-checkout"
import type { BreakdownLine } from "@/components/pledge-card/pledge-breakdown"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import { formatTipLabel } from "@/components/pledge-card/utils"
import { formatPoundsExact } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type FavouriteBreakdownLine = { label: string; amount: number }

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
  /** The itemised bill (founder, 2026-09-06): reviewed at the moment of payment */
  ownBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null
  favouriteBreakdown: FavouriteBreakdownLine[]
  /** Pounds of the total moved to the shared pot (step 3's split). */
  fundPart: number
  tipAmount: number
  tipOptions: number[]
  onTipChange: (v: number) => void
  /** True while a tip change is re-pricing the PaymentIntent. */
  refreshingIntent?: boolean
  isListed?: boolean
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
  ownBreakdown,
  favouriteBreakdown,
  fundPart,
  tipAmount,
  tipOptions,
  onTipChange,
  refreshingIntent = false,
  isListed,
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
      {/* The itemised bill, read at the moment of payment (founder,
          2026-09-06): the favourite lines, the fund if split, the tip as
          chips on the bill itself, and the total the card is charged. */}
      {ownBreakdown && (
        <div className="mb-4">
          {favouriteBreakdown.length > 0 && (
            <div className="mb-3 space-y-2">
              {favouriteBreakdown.map((line, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm">{line.label}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPoundsExact(line.amount)}
                  </span>
                </div>
              ))}
              {fundPart > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Shared pot</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPoundsExact(fundPart)}
                  </span>
                </div>
              )}
            </div>
          )}
          <PledgeBreakdown
            {...ownBreakdown}
            extraRow={
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Tip for favpoll</span>
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label="Optional contribution to favpoll"
                >
                  {tipOptions.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      size="xs"
                      role="radio"
                      aria-checked={tipAmount === value}
                      variant={tipAmount === value ? "secondary" : "ghost"}
                      className="px-2 font-normal aria-checked:font-medium"
                      disabled={refreshingIntent}
                      onClick={() => onTipChange(value)}
                    >
                      {formatTipLabel(value)}
                    </Button>
                  ))}
                </div>
              </div>
            }
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            The tip is optional — never taken from your pledge.
          </p>
          {/* The privacy reassurance, quiet under the bill (unboxed
              2026-09-07 — the muted panel read as a third card) */}
          {isListed && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              This is a public favpoll. Your pledge amount and identity are
              always private.
            </p>
          )}
        </div>
      )}

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
      {/* Keyed on the secret: a tip change re-prices the intent, and the
          Elements provider must remount onto the new one. */}
      <StripeCheckout
        key={clientSecret}
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
