"use client"

import { useEffect, useRef, useState } from "react"
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
  onSuccess: (email?: string) => void
  onCancel: () => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
  setError: (v: string | null) => void
  error: string | null
  /** When false, Cancel/Pay buttons are omitted (caller renders them in a footer). */
  showButtons: boolean
  /** Sets the form's id so an external submit button can use form="<id>". */
  formId?: string
  /** Called when Stripe Elements finish loading (ready to submit). */
  onStripeReadyChange?: (ready: boolean) => void
  /** When true, renders an email input above PaymentElement for guest pledge email capture. */
  showEmailCapture?: boolean
}

function CheckoutForm({
  onSuccess,
  onCancel,
  submitting,
  setSubmitting,
  setError,
  error,
  showButtons,
  formId,
  onStripeReadyChange,
  showEmailCapture,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState("")

  const onReadyRef = useRef(onStripeReadyChange)
  useEffect(() => {
    onReadyRef.current = onStripeReadyChange
  })
  useEffect(() => {
    onReadyRef.current?.(!!stripe && !!elements)
  }, [stripe, elements])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    if (showEmailCapture && !email.trim()) {
      setError("Please enter your email address")
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        ...(showEmailCapture && email ? { receipt_email: email } : {}),
      },
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed")
      setSubmitting(false)
      return
    }

    onSuccess(showEmailCapture ? email : undefined)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {showEmailCapture && (
        <div className="space-y-1">
          <label
            htmlFor="checkout-email"
            className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
          >
            Your email
          </label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="for your receipt and withdrawal link"
            className="w-full border-b border-border bg-transparent py-1 text-base outline-none focus:border-primary"
            aria-label="Email address for receipt and withdrawal link"
          />
          <p className="text-[11px] text-muted-foreground">
            No account needed.
          </p>
        </div>
      )}
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {showButtons && (
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
      )}
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
  onSuccess: (email?: string) => void
  onClose: () => void
  /** Render inline (no fixed overlay). Use inside a dialog's step 3. */
  inline?: boolean
  /** Sets the form's id so an external footer button can submit it via form="<id>". */
  formId?: string
  /** Called when submitting state changes (lets an external footer button reflect state). */
  onSubmittingChange?: (submitting: boolean) => void
  /** Called when Stripe Elements finish loading (lets an external submit button disable until ready). */
  onStripeReadyChange?: (ready: boolean) => void
  /** When true, renders an email input for guest pledge email capture. */
  showEmailCapture?: boolean
}

export function StripeCheckout({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onClose,
  inline = false,
  formId,
  onSubmittingChange,
  onStripeReadyChange,
  showEmailCapture,
}: Props) {
  const [submitting, setSubmittingRaw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setSubmitting(v: boolean) {
    setSubmittingRaw(v)
    onSubmittingChange?.(v)
  }

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
          showButtons={!inline}
          formId={formId}
          onStripeReadyChange={onStripeReadyChange}
          showEmailCapture={showEmailCapture}
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
