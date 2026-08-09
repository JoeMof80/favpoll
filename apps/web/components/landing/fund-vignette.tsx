"use client"

import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Vignette } from "@/components/landing/vignette"
import { formatPoundsExact } from "@/lib/i18n"

// The shared-fund split, as it happens inside the pledge dialog.
//
// Mirrors StepAmount's breakdown panel with the app's own copy and its own
// controls, the way TopicPickerVignette mirrors the two topic dialogs. Not
// the whole StepAmount: it wants a dozen props, a Stripe-shaped total and a
// tip row, and the section is about ONE row of it.
//
// The thing worth showing is the arithmetic, because it is the part people
// get wrong when it is only described: moving money to the fund does not
// cost the guest a penny more. The favourite ticks DOWN as the fund ticks
// UP and the total never moves — which is why the total is on screen.

const TOTAL = 5
const FAVOURITE = "Cockapoo"
const TARGET_FUND = 2

const STEP_MS = 1100
const HOLD_MS = 3600

export function FundVignette() {
  const reduced = useReducedMotion()
  const [fund, setFund] = useState(reduced ? TARGET_FUND : 0)

  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => setFund((f) => (f >= TARGET_FUND ? 0 : f + 1)),
      fund >= TARGET_FUND ? HOLD_MS : STEP_MS
    )
    return () => clearTimeout(id)
  }, [fund, reduced])

  return (
    <Vignette>
      {/* The dialog's own panel — one card, the breakdown region of it */}
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-background p-5 shadow-lg">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Your favourite · its worth
        </p>

        <div className="mt-3 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">{FAVOURITE}</span>
            <span className="text-sm font-semibold tabular-nums">
              {formatPoundsExact(TOTAL - fund)}
            </span>
          </div>

          {/* Whole pounds move from the favourite to the fund. The stepper is
              the real one — outline icon-xs Buttons — so it disables at the
              ends exactly as the dialog's does. */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Shared fund</span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Move £1 back to your favourite"
                disabled={fund <= 0}
              >
                <Minus />
              </Button>
              <span className="w-14 text-center text-sm font-semibold tabular-nums">
                {formatPoundsExact(fund)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Move £1 to the shared fund"
                disabled={fund >= TOTAL - 1}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </div>

        {/* The total, which never moves — the whole point of the row above */}
        <div className="mt-4 flex justify-between border-t border-border pt-3">
          <span className="text-sm font-medium">Total charged</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatPoundsExact(TOTAL)}
          </span>
        </div>
      </div>
    </Vignette>
  )
}
