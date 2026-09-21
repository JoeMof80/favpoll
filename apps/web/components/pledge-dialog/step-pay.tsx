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
  /** Wall identity (anonymity model, 2026-07-05) */
  isGuest: boolean
  guestEmail: string
  onGuestEmailChange: (v: string) => void
  displayName: string
  onDisplayNameChange: (v: string) => void
  isAnonymous: boolean
  onIsAnonymousChange: (v: boolean) => void
  /** Gift Aid declaration (2026-09-15) — the charity claims, favpoll
   *  only captures. Pledge amount only, never the tip. */
  giftAid: boolean
  onGiftAidChange: (v: boolean) => void
  giftAidFirstName: string
  onGiftAidFirstNameChange: (v: string) => void
  giftAidLastName: string
  onGiftAidLastNameChange: (v: string) => void
  giftAidHouse: string
  onGiftAidHouseChange: (v: string) => void
  giftAidPostcode: string
  onGiftAidPostcodeChange: (v: string) => void
  /** Organiser has enabled show_guest_amounts */
  showGuestAmounts?: boolean
  /** Guest's display choice: pick / amount / none */
  guestBookDisplay?: "pick" | "amount" | "none"
  onGuestBookDisplayChange?: (v: "pick" | "amount" | "none") => void
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
  isGuest,
  guestEmail,
  onGuestEmailChange,
  displayName,
  onDisplayNameChange,
  isAnonymous,
  onIsAnonymousChange,
  giftAid,
  onGiftAidChange,
  giftAidFirstName,
  onGiftAidFirstNameChange,
  giftAidLastName,
  onGiftAidLastNameChange,
  giftAidHouse,
  onGiftAidHouseChange,
  giftAidPostcode,
  onGiftAidPostcodeChange,
  showGuestAmounts = false,
  guestBookDisplay = "pick",
  onGuestBookDisplayChange,
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
                  <span className="text-base">{line.label}</span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatPoundsExact(line.amount)}
                  </span>
                </div>
              ))}
              {fundPart > 0 && (
                <div className="flex justify-between">
                  <span className="text-base">Shared pot</span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatPoundsExact(fundPart)}
                  </span>
                </div>
              )}
            </div>
          )}
          <PledgeBreakdown
            {...ownBreakdown}
            extraRow={
              <>
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
              </>
            }
          />
        </div>
      )}

      {/* Identity + guest book display choice (2026-09-21).
          When the organiser has enabled show_guest_amounts, we show a
          three-option radio replacing the bare anonymity switch —
          "My pick", "My donation", or "Neither". When off, signed-in
          users get the original switch; guests get no switch (blank
          name = Someone). */}
      {showGuestAmounts && onGuestBookDisplayChange ? (
        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-foreground">
            Show in the guest book
          </legend>
          <div className="space-y-2">
            {(
              [
                ["pick", "My pick"],
                ["amount", "My donation"],
                ["none", "Neither"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="guest-book-display"
                  value={value}
                  checked={guestBookDisplay === value}
                  onChange={() => {
                    onGuestBookDisplayChange(value)
                    // "Neither" hides the name too — the full-anonymous path
                    onIsAnonymousChange(value === "none")
                  }}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : isGuest ? null : (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={isAnonymous}
              onCheckedChange={onIsAnonymousChange}
              aria-label="Hide my name from the guest book"
            />
            Hide my name from the guest book
          </label>
        </div>
      )}
      {/* Gift Aid (2026-09-15): opt-in, collapsed by default — declining
          adds zero friction. The four fields are HMRC's claim-schedule
          minimum; the statement is HMRC's model declaration, required
          visible text, so it stays despite the minimal-chrome rule. The
          charity claims — favpoll only holds the record. */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Switch
            checked={giftAid}
            onCheckedChange={onGiftAidChange}
            aria-label="Add Gift Aid to your pledge"
          />
          Add Gift Aid — worth 25% more at no cost to you
        </label>
        {giftAid && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="gift-aid-first-name"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  First name
                </label>
                <Input
                  id="gift-aid-first-name"
                  autoComplete="given-name"
                  value={giftAidFirstName}
                  onChange={(e) => onGiftAidFirstNameChange(e.target.value)}
                  className="h-11 rounded-[10px] md:text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="gift-aid-last-name"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  Last name
                </label>
                <Input
                  id="gift-aid-last-name"
                  autoComplete="family-name"
                  value={giftAidLastName}
                  onChange={(e) => onGiftAidLastNameChange(e.target.value)}
                  className="h-11 rounded-[10px] md:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="gift-aid-house"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  House name or number
                </label>
                <Input
                  id="gift-aid-house"
                  autoComplete="address-line1"
                  value={giftAidHouse}
                  onChange={(e) => onGiftAidHouseChange(e.target.value)}
                  className="h-11 rounded-[10px] md:text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="gift-aid-postcode"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  Postcode
                </label>
                <Input
                  id="gift-aid-postcode"
                  autoComplete="postal-code"
                  value={giftAidPostcode}
                  onChange={(e) => onGiftAidPostcodeChange(e.target.value)}
                  className="h-11 rounded-[10px] uppercase md:text-base"
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              I am a UK taxpayer. If I pay less Income Tax and/or Capital Gains
              Tax in this tax year than the amount of Gift Aid claimed on all my
              donations, it is my responsibility to pay any difference. Gift Aid
              applies to the pledge only, not the tip.
            </p>
          </div>
        )}
      </div>
      {/* Keyed on the secret: a tip change re-prices the intent, and the
          Elements provider must remount onto the new one. */}
      {/* Guest fields ride INSIDE the payment block (founder, 2026-09-07):
          below the wallet buttons, just before the card inputs — wallet
          payers get their email from the sheet and never need them. */}
      <StripeCheckout
        key={clientSecret}
        fieldsSlot={
          isGuest ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pledge-guest-email"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  Email
                </label>
                <Input
                  id="pledge-guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => onGuestEmailChange(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address for receipt and withdrawal link"
                  className="h-11 rounded-[10px] md:text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="pledge-guest-name"
                  className="mb-1 block text-[15px] text-foreground"
                >
                  Your name (optional)
                </label>
                <Input
                  id="pledge-guest-name"
                  value={displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
                  aria-label="Name shown in the guest book — leave blank to appear as Someone"
                  className="h-11 rounded-[10px] md:text-base"
                />
              </div>
            </div>
          ) : undefined
        }
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
