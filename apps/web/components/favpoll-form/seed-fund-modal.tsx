"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatPoundsExact } from "@/lib/i18n"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { StripeCheckout } from "@/components/stripe-checkout"
import { topUpFund, topUpFundAsGuest } from "@/app/favpolls/[id]/actions"

const PRESETS = [10, 25, 50]

type Props = {
  favpollId: string
  onComplete: () => void
  /** Called when the guest variant is closed without completing. */
  onCancel?: () => void
  /** "organiser" (default): post-publish seeding flow. "guest": add-to-fund from favpoll page. */
  variant?: "organiser" | "guest"
  /** Guest variant only: when true, shows an informational notice that
   * this is a public favpoll. The organiser variant carried a Listed
   * SWITCH here until 2026-09-01 — retired: the wizard's Settings step
   * owns visibility now (the three-way control), and this modal opens
   * one step after it was just set. */
  isListed?: boolean
}

export function SeedFundModal({
  favpollId,
  onComplete,
  onCancel,
  variant = "organiser",
  isListed,
}: Props) {
  const [amount, setAmount] = useState("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  // The PaymentIntent behind clientSecret — the top-up actions verify it
  // against Stripe before crediting the fund.
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isGuest = variant === "guest"

  const numeric = parseFloat(amount)
  const isValid = !isNaN(numeric) && numeric > 0

  async function handleSeed() {
    if (!isValid) return
    setError(null)
    setSubmitting(true)
    try {
      // Fund-only top-up: the route computes the charge from topUpAmount
      // and binds the PI to the favpoll (no poll, no pledge part).
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favpollId,
          topUpAmount: numeric,
        }),
      })
      const data = (await res.json()) as {
        clientSecret?: string
        paymentIntentId?: string
        error?: string
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment")
      setClientSecret(data.clientSecret ?? null)
      setPaymentIntentId(data.paymentIntentId ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymentSuccess() {
    try {
      if (isGuest) {
        await topUpFundAsGuest(favpollId, numeric, paymentIntentId ?? "")
      } else {
        await topUpFund(favpollId, numeric, paymentIntentId ?? "")
      }
    } catch {
      // Fund recording failed — continue regardless
    }
    setPaymentIntentId(null)
    onComplete()
  }

  function handlePaymentCancel() {
    setClientSecret(null)
    setSubmitting(false)
    setError("Payment was cancelled.")
  }

  if (clientSecret) {
    return (
      <StripeCheckout
        clientSecret={clientSecret}
        // WITH THE CARD FEE, because the PaymentIntent has it. The route
        // adds the fee server-side to every charge it creates (lib/card-fee),
        // so passing the bare amount here would show a total lower than the
        // one actually taken — the worst kind of payment bug, and a silent
        // one.
        chargeAmount={numeric}
        onSuccess={handlePaymentSuccess}
        onClose={handlePaymentCancel}
      />
    )
  }

  const title = isGuest ? "Add to the shared pot" : "Give guests a head start"

  const description = isGuest ? (
    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
      Not everybody is in a position to pledge money of their own. The shared
      pot helps them take part. Any money left in the shared pot goes to the
      charity.
    </p>
  ) : (
    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
      The shared pot lets guests who can&rsquo;t pledge on their own &mdash;
      children, students, or anyone who&rsquo;d rather not &mdash; still take
      part. Seed it with a gift and their participation is taken care of.
    </p>
  )

  const footer = isGuest ? (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="h-11 w-full md:text-base"
        disabled={!isValid || submitting}
        onClick={handleSeed}
      >
        {submitting ? "Setting up…" : "Add to fund"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full md:text-base"
        onClick={onCancel}
      >
        No thanks
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="h-11 w-full md:text-base"
        disabled={!isValid || submitting}
        onClick={handleSeed}
      >
        {submitting ? "Setting up…" : "Seed fund"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full md:text-base"
        onClick={onComplete}
      >
        Skip for now
      </Button>
    </div>
  )

  return (
    <ResponsiveOverlay
      open
      onOpenChange={(open) => {
        if (!open) (isGuest ? onCancel : onComplete)?.()
      }}
      title={title}
      hideCloseButton={!isGuest}
      dialogClassName="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      dialogContentClassName="flex-1 overflow-y-auto px-5 pt-0 pb-2"
      bodyClassName="px-5 pt-0 pb-2"
      footer={footer}
    >
      {/* Amount field */}
      <div className="flex items-baseline gap-1.5 py-4">
        <span
          className="text-2xl text-muted-foreground select-none"
          aria-hidden="true"
        >
          £
        </span>
        <input
          id="seed-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          aria-label="Amount in pounds"
          className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {isValid && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Every penny of your {formatPoundsExact(numeric)} reaches the fund.
        </p>
      )}

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            className="h-11 flex-1 md:text-base"
            onClick={() => setAmount(String(preset))}
          >
            £{preset}
          </Button>
        ))}
      </div>

      {description}

      {isGuest && isListed && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          This favpoll is publicly listed. Your contribution is always private.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </ResponsiveOverlay>
  )
}
