"use client"

import { StripeCheckout } from "@/components/stripe-checkout"

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount: number
  onSuccess: () => void
  onBack: () => void
  onSubmittingChange?: (v: boolean) => void
  onStripeReadyChange?: (ready: boolean) => void
}

export function StepPay({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onBack,
  onSubmittingChange,
  onStripeReadyChange,
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
      />
    </div>
  )
}
