"use client"

import { useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { CheckoutForm } from "./checkout-form"
import { formatPoundsExact } from "@/lib/i18n"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Stripe's iframe can't read our CSS custom properties, so resolve the
// design tokens to concrete rgb() at runtime (no hardcoded hexes — the
// browser converts whatever globals.css holds). SSR-safe: falls back to
// Stripe defaults until mounted.
function resolveToken(varName: string): string | undefined {
  if (typeof window === "undefined") return undefined
  const el = document.createElement("span")
  el.style.color = `var(${varName})`
  el.style.display = "none"
  document.body.appendChild(el)
  const resolved = getComputedStyle(el).color
  el.remove()
  if (!resolved) return undefined
  // The tokens compute to lab()/oklch(), which Stripe silently rejects.
  // Painting a pixel and reading it back always yields sRGB integers.
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return resolved
  ctx.fillStyle = resolved
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount?: number
  onSuccess: (email?: string) => void | Promise<void>
  onClose: () => void
  /** Forwarded to CheckoutForm: pre-charge veto (e.g. duplicate-pledge check) */
  preflight?: (
    email?: string
  ) => Promise<{ message: string; signInEmail?: string } | null>
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
  /** Guest email captured outside the form (see CheckoutForm.externalEmail) */
  externalEmail?: string
}

export function StripeCheckout({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onClose,
  preflight,
  inline = false,
  formId,
  onSubmittingChange,
  onStripeReadyChange,
  showEmailCapture,
  externalEmail,
}: Props) {
  const [submitting, setSubmittingRaw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setSubmitting(v: boolean) {
    setSubmittingRaw(v)
    onSubmittingChange?.(v)
  }

  // Themed to the app's tokens so the payment fields stop looking like a
  // different product at the most trust-sensitive moment.
  const appearance = useMemo(
    () => ({
      theme: "stripe" as const,
      variables: {
        colorPrimary: resolveToken("--primary"),
        colorText: resolveToken("--foreground"),
        colorTextSecondary: resolveToken("--muted-foreground"),
        colorTextPlaceholder: resolveToken("--muted-foreground"),
        colorBackground: resolveToken("--background"),
        colorDanger: resolveToken("--destructive"),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        borderRadius: "10px",
      },
    }),
    []
  )

  const inner = (
    <>
      <p className="mb-1 text-sm text-muted-foreground">
        You will be charged{" "}
        <span className="font-medium text-foreground">
          {formatPoundsExact(chargeAmount)}
        </span>
      </p>
      {charityAmount !== undefined && (
        <p className="mb-5 text-xs text-muted-foreground">
          {formatPoundsExact(charityAmount)} to charity — favpoll takes no fee
        </p>
      )}
      {charityAmount === undefined && <div className="mb-5" />}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          fonts: [
            {
              cssSrc:
                "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&display=swap",
            },
          ],
          appearance,
        }}
      >
        <CheckoutForm
          onSuccess={onSuccess}
          preflight={preflight}
          onCancel={onClose}
          submitting={submitting}
          setSubmitting={setSubmitting}
          error={error}
          setError={setError}
          showButtons={!inline}
          formId={formId}
          onStripeReadyChange={onStripeReadyChange}
          showEmailCapture={showEmailCapture}
          externalEmail={externalEmail}
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
