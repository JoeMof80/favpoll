"use client"

import { FavpollLogo } from "@/components/favpoll-logo"
import { Button } from "@/components/ui/button"

type Props = {
  onDismiss: () => void
}

export function OnboardingInterstitial({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background md:hidden">
      <div className="flex min-h-full flex-col px-6 py-8">
        <FavpollLogo />

        <p className="mt-4 text-[13px] text-[#534AB7] italic">
          Expressions of joy, for charitable causes, in the name of those we
          love.
        </p>

        <h1 className="mt-3 text-[20px] font-medium">Love. Honour. Charity.</h1>

        <div className="mt-6 flex-1 space-y-6">
          <div>
            <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
              HONOUR
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Tell their story. A name, a photo, a few lines about the occasion.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
              LOVE
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Pick a topic. Guests pledge a donation against their own
              favourite. Share the reveal after.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
              CHARITY
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              All pledges go to your chosen cause, in their name.
            </p>
          </div>
        </div>

        <Button type="button" className="mt-8 w-full" onClick={onDismiss}>
          Get started
        </Button>
      </div>
    </div>
  )
}
