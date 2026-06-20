"use client"

import { StripeCheckout } from "@/components/stripe-checkout"

type Props = {
  clientSecret: string
  chargeAmount: number
  charityAmount: number
  onSuccess: () => void
  onBack: () => void
}

export function StepPay({
  clientSecret,
  chargeAmount,
  charityAmount,
  onSuccess,
  onBack,
}: Props) {
  return (
    <div className="px-5 py-4">
      <StripeCheckout
        inline
        clientSecret={clientSecret}
        chargeAmount={chargeAmount}
        charityAmount={charityAmount}
        onSuccess={onSuccess}
        onClose={onBack}
      />
    </div>
  )
}
