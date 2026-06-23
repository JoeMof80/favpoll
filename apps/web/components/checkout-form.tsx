"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

export type CheckoutFormProps = {
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

export function CheckoutForm({
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
