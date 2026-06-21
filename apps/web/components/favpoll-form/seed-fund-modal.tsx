"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { StripeCheckout } from "@/components/stripe-checkout"
import {
  topUpFund,
  topUpFundAsGuest,
  setFavpollListed,
} from "@/app/favpolls/[id]/actions"

const PRESETS = [10, 25, 50]

type Props = {
  favpollId: string
  onComplete: () => void
  /** Called when the guest variant is closed without completing. */
  onCancel?: () => void
  /** "organiser" (default): post-publish seeding flow. "guest": add-to-fund from favpoll page. */
  variant?: "organiser" | "guest"
  /** When true, shows an informational notice that this is a public favpoll. */
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
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [listingState, setListingState] = useState(isListed ?? true)

  const isGuest = variant === "guest"

  async function handleToggleListed(value: boolean) {
    setListingState(value)
    try {
      await setFavpollListed(favpollId, value)
    } catch {
      setListingState(!value)
    }
  }

  const numeric = parseFloat(amount)
  const isValid = !isNaN(numeric) && numeric > 0

  async function handleSeed() {
    if (!isValid) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numeric,
          metadata: { type: "pot_top_up", event_id: favpollId },
        }),
      })
      const data = (await res.json()) as {
        clientSecret?: string
        error?: string
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment")
      setClientSecret(data.clientSecret ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymentSuccess() {
    try {
      if (isGuest) {
        await topUpFundAsGuest(favpollId, numeric)
      } else {
        await topUpFund(favpollId, numeric)
      }
    } catch {
      // Fund recording failed — continue regardless
    }
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
        chargeAmount={numeric}
        onSuccess={handlePaymentSuccess}
        onClose={handlePaymentCancel}
      />
    )
  }

  const title = isGuest ? "Help others take part" : "Give guests a head start"

  const description = isGuest ? (
    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
      Anyone can add to the shared fund. You&rsquo;re helping guests who
      can&rsquo;t pledge on their own &mdash; children, students, or anyone
      who&rsquo;d rather not &mdash; still be part of this moment.
    </p>
  ) : (
    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
      The shared fund lets guests who can&rsquo;t pledge on their own &mdash;
      children, students, or anyone who&rsquo;d rather not &mdash; still take
      part. Seed it with a gift and their participation is taken care of.
    </p>
  )

  const footer = isGuest ? (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full"
        disabled={!isValid || submitting}
        onClick={handleSeed}
      >
        {submitting ? "Setting up…" : "Add to fund"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onCancel}
      >
        No thanks
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full"
        disabled={!isValid || submitting}
        onClick={handleSeed}
      >
        {submitting ? "Setting up…" : "Seed fund"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
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
          className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setAmount(String(preset))}
          >
            £{preset}
          </Button>
        ))}
      </div>

      {description}

      {!isGuest && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {listingState ? "Listed" : "Unlisted"}
            </p>
            <p className="text-xs text-muted-foreground">
              {listingState
                ? "Appears on the live events page."
                : "Only reachable by people you give the link to."}
            </p>
          </div>
          <Switch checked={listingState} onCheckedChange={handleToggleListed} />
        </div>
      )}

      {isGuest && listingState && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          This favpoll is publicly listed. Your contribution is always private.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </ResponsiveOverlay>
  )
}
