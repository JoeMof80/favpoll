"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

export type CheckoutFormProps = {
  onSuccess: (email?: string) => void | Promise<void>
  /** Ran after validation, BEFORE Stripe charges. Return a veto to abort
   * the payment (e.g. the guest duplicate-pledge check); signInEmail adds a
   * prefilled create-account hand-off under the message. */
  preflight?: (email?: string) => Promise<{
    message: string
    signInEmail?: string
    authMode?: "sign-in" | "sign-up"
  } | null>
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
  /** Guest email captured OUTSIDE this form (the dialog's identity block).
   * When set, it is validated and used for preflight/receipt/onSuccess
   * exactly as the built-in field would be. */
  externalEmail?: string
}

export function CheckoutForm({
  onSuccess,
  preflight,
  onCancel,
  submitting,
  setSubmitting,
  setError,
  error,
  showButtons,
  formId,
  onStripeReadyChange,
  showEmailCapture,
  externalEmail,
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

  // Set alongside a preflight veto: renders the auth hand-off
  const [authHandOff, setAuthHandOff] = useState<{
    email: string
    mode: "sign-in" | "sign-up"
  } | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return
    const effectiveEmail = showEmailCapture ? email : externalEmail
    const emailRequired = showEmailCapture || externalEmail !== undefined
    if (emailRequired && !effectiveEmail?.trim()) {
      setError("Please enter your email address")
      return
    }

    setSubmitting(true)
    setError(null)
    setAuthHandOff(null)

    if (preflight) {
      const veto = await preflight(effectiveEmail)
      if (veto) {
        setError(veto.message)
        setAuthHandOff(
          veto.signInEmail
            ? { email: veto.signInEmail, mode: veto.authMode ?? "sign-up" }
            : null
        )
        setSubmitting(false)
        return
      }
    }

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        ...(effectiveEmail ? { receipt_email: effectiveEmail } : {}),
      },
      redirect: "if_required",
    })

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed")
      setSubmitting(false)
      return
    }

    try {
      await onSuccess(effectiveEmail)
    } catch (err) {
      // The charge succeeded but recording failed — show why and re-enable.
      // A retry cannot double-charge: Stripe rejects re-confirming a
      // succeeded PaymentIntent.
      setError(
        err instanceof Error ? err.message : "Something went wrong — try again"
      )
      setSubmitting(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {showEmailCapture && (
        /* Same bordered-unit grammar as the wall block above — a bare
           underline between two bordered cards read as an afterthought, and
           this is the field the receipt and withdrawal link depend on. */
        <div className="rounded-lg border border-border bg-card">
          <label
            htmlFor="checkout-email"
            className="block px-4 pt-3 text-xs font-medium tracking-widest text-muted-foreground uppercase"
          >
            Your email
          </label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent px-4 py-2.5 text-base outline-none placeholder:text-muted-foreground/50"
            aria-label="Email address for receipt and withdrawal link"
          />
          <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
            For your receipt and withdrawal link — no account needed.
          </p>
        </div>
      )}
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {authHandOff && (
        <Button asChild variant="outline" className="w-full">
          <a
            href={`/${authHandOff.mode}?email_address=${encodeURIComponent(authHandOff.email)}&redirect_url=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.pathname : "/"
            )}`}
          >
            {authHandOff.mode === "sign-in"
              ? "Sign in with this email →"
              : "Create an account with this email →"}
          </a>
        </Button>
      )}
      {showButtons && (
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
            className="h-11 flex-1 md:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !stripe}
            className="h-11 flex-1 md:text-base"
          >
            {submitting ? "Processing…" : "Pay now"}
          </Button>
        </div>
      )}
    </form>
  )
}
