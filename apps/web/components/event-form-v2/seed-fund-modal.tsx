"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { AmountInput } from "@/components/pledge-card/amount-input"
import { StripeCheckout } from "@/components/stripe-checkout"
import { topUpFund } from "@/app/events/[id]/actions"

const PRESETS = [10, 25, 50]

type Props = {
  eventId: string
  onComplete: () => void
}

export function SeedFundModal({ eventId, onComplete }: Props) {
  const [amount, setAmount] = useState("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
          metadata: { type: "pot_top_up", event_id: eventId },
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
      await topUpFund(eventId, numeric)
    } catch {
      // Fund recording failed — continue to event page regardless
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

  return (
    <ResponsiveOverlay
      open
      onOpenChange={() => {}}
      title="Give guests a head start"
      hideCloseButton
      dialogContentClassName="flex-1 overflow-y-auto px-5 py-4"
      footer={
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            disabled={!isValid || submitting}
            onClick={handleSeed}
          >
            {submitting ? "Setting up payment…" : "Seed the shared fund"}
          </Button>
          <a
            href="#"
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault()
              onComplete()
            }}
          >
            Skip for now
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The shared fund lets guests who can&rsquo;t pledge on their own —
          children, students, or anyone who&rsquo;d rather not — still take
          part. Seed it with a gift and their participation is taken care of.
        </p>

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

        <AmountInput id="seed-amount" value={amount} onChange={setAmount} />

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </ResponsiveOverlay>
  )
}
