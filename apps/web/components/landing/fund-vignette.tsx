"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Vignette } from "@/components/landing/vignette"

// THE shared fund dialog — SeedFundModal in its guest variant, the one a
// guest opens to put money in the pot for somebody else.
//
// It showed StepAmount's split row before (founder, 2026-08-09): the control
// for moving part of your OWN pledge across. That is a shared-fund feature
// but it is not the shared fund dialog, and the section is about the fund
// itself — a thing anyone can top up, that a guest with no means draws on.
//
// Mirrored rather than mounted, the way TopicPickerVignette mirrors the two
// topic dialogs: SeedFundModal wants a favpoll id, hits the payment-intent
// route and renders through a portal. The copy and the controls here are its
// own, to the word.

const PRESETS = [10, 25, 50] as const
const PICKED = 25

const IDLE_MS = 1600
const PRESS_MS = 320
const HOLD_MS = 4400

export function FundVignette() {
  const reduced = useReducedMotion()
  // -1 idle · 0 pressing · 1 filled
  const [phase, setPhase] = useState(reduced ? 1 : -1)

  useEffect(() => {
    if (reduced) return
    const next = phase === -1 ? 0 : phase === 0 ? 1 : -1
    const wait = phase === -1 ? IDLE_MS : phase === 0 ? PRESS_MS : HOLD_MS
    const id = setTimeout(() => setPhase(next), wait)
    return () => clearTimeout(id)
  }, [phase, reduced])

  const filled = phase === 1
  const pressing = phase === 0

  return (
    <Vignette>
      {/* ResponsiveOverlay's dialog shape at sm and up: sm:max-w-lg, a title
          row, then the body. */}
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-background p-5 shadow-lg">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Help others take part
        </p>

        {/* Amount field — £ beside a borderless number input, as the dialog
            has it. Fixed height so the card cannot resize as it fills. */}
        <div className="flex items-baseline gap-1.5 py-4">
          <span className="text-2xl text-muted-foreground select-none">£</span>
          <span
            className={
              filled
                ? "text-3xl text-foreground"
                : "text-3xl text-muted-foreground/50"
            }
          >
            {filled ? PICKED : 0}
          </span>
        </div>

        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              className={
                preset === PICKED && pressing
                  ? "flex-1 scale-[0.97] brightness-95"
                  : "flex-1"
              }
            >
              £{preset}
            </Button>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Anyone can add to the shared fund. You&rsquo;re helping guests who
          can&rsquo;t pledge on their own &mdash; children, students, or anyone
          who&rsquo;d rather not &mdash; still be part of this moment.
        </p>

        {/* The dialog's footer: the primary is disabled until an amount is
            entered, which is why it starts grey and only lights up once the
            preset lands. */}
        <div className="mt-5 flex flex-col gap-3">
          <Button type="button" className="w-full" disabled={!filled}>
            Add to fund
          </Button>
          <Button type="button" variant="ghost" className="w-full">
            No thanks
          </Button>
        </div>
      </div>
    </Vignette>
  )
}
