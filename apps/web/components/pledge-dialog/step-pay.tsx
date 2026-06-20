"use client"

import { StripeCheckout } from "@/components/stripe-checkout"

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount: number
  onSuccess: (email?: string) => void
  onBack: () => void
  onSubmittingChange?: (v: boolean) => void
  onStripeReadyChange?: (ready: boolean) => void
  showEmailCapture?: boolean
}

export function StepPay({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onBack,
  onSubmittingChange,
  onStripeReadyChange,
  showEmailCapture,
}: Props) {
  return (
    <div className="px-5 py-4">
      <StripeCheckout
        inline
        formId="pledge-checkout-form"
        clientSecret={clientSecret}
        chargeAmount={chargeAmount}
        charityAmount={charityAmount}
        onSuccess={onSuccess}
        onClose={onBack}
        onSubmittingChange={onSubmittingChange}
        onStripeReadyChange={onStripeReadyChange}
        showEmailCapture={showEmailCapture}
      />
    </div>
  )
}
