"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

type CheckoutFormProps = {
  onSuccess: () => void
  onCancel: () => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
  setError: (v: string | null) => void
  error: string | null
}

function CheckoutForm({
  onSuccess,
  onCancel,
  submitting,
  setSubmitting,
  setError,
  error,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed")
      setSubmitting(false)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting || !stripe}
          className="flex-1"
        >
          {submitting ? "Processing…" : "Pay now"}
        </Button>
      </div>
    </form>
  )
}

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    n
  )

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount?: number // if provided, shows breakdown; omit for fund top-ups
  onSuccess: () => void
  onClose: () => void
  /** Render inline (no fixed overlay). Use inside a dialog's step 3. */
  inline?: boolean
}

export function StripeCheckout({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onClose,
  inline = false,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inner = (
    <>
      <p className="mb-1 text-sm text-muted-foreground">
        You will be charged{" "}
        <span className="font-medium text-foreground">{gbp(chargeAmount)}</span>
      </p>
      {charityAmount !== undefined && (
        <p className="mb-5 text-xs text-muted-foreground">
          {gbp(charityAmount)} to charity · {gbp(chargeAmount - charityAmount)}{" "}
          platform fee
        </p>
      )}
      {charityAmount === undefined && <div className="mb-5" />}
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: "stripe" } }}
      >
        <CheckoutForm
          onSuccess={onSuccess}
          onCancel={onClose}
          submitting={submitting}
          setSubmitting={setSubmitting}
          error={error}
          setError={setError}
        />
      </Elements>
    </>
  )

  if (inline) return <div className="space-y-1">{inner}</div>

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Complete payment"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-medium text-foreground">
          Complete your pledge
        </h2>
        {inner}
      </div>
    </div>
  )
}
