"use client"

import { useEffect, useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SCALE, buildPackSteps } from "./pack-card"
import { PackSheet } from "./pack-sheet"
import type { PackData } from "./pack-card"

// Pre-event material for an organiser to print and place at the venue:
// one A4 sheet of two A5 cards (table/easel size) and one A4 sheet of
// eight wallet cards (credit-card size, 85.6 × 54 mm — they slip into a
// wallet or an order of service). Both are the SAME card at two scales
// (founder, 2026-08-02): the favpoll-card grammar — eyebrow + name with
// the brand top-right, topic ribbon row, the numbered mechanic steps
// beside the QR, and the shared-fund escape hatch. Steps come from
// lib/mechanic-steps, the single source shared with the guest page's
// lock card, so print and page always match.
//
// The card itself lives in ./pack-card (2026-08-06) — the landing page
// shows a wallet card as a still and must not import this module's print
// state or its window.print() effect.

export type { PackData } from "./pack-card"

// Sits OUTSIDE the sheet, like the top Save-as-PDF button. Module scope, not
// nested in PackDocument: a component declared during render is a NEW type on
// every render, so React unmounts and remounts the subtree each time instead
// of updating it (react-hooks/static-components). The print target it sets
// comes in as a prop rather than closing over the parent's setter.
function SheetPrintButton({
  target,
  onPrint,
}: {
  target: keyof typeof SCALE
  onPrint: (target: keyof typeof SCALE) => void
}) {
  return (
    <div className="mb-2 flex w-full justify-end print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onPrint(target)}
      >
        <Printer data-icon="inline-start" aria-hidden="true" />
        Print this page
      </Button>
    </div>
  )
}

export function PackDocument({ data }: { data: PackData }) {
  const steps = buildPackSteps(data)

  // Per-page printing (founder, 2026-08-02): each sheet has its own
  // button; while one prints, the others hide.
  const [printTarget, setPrintTarget] = useState<keyof typeof SCALE | null>(
    null
  )
  useEffect(() => {
    if (!printTarget) return
    const reset = () => setPrintTarget(null)
    window.addEventListener("afterprint", reset)
    const id = requestAnimationFrame(() => window.print())
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener("afterprint", reset)
    }
  }, [printTarget])

  const hideWhenOtherPrints = (key: keyof typeof SCALE) =>
    printTarget && printTarget !== key ? "print:hidden" : ""

  return (
    // .paper pins the light token values across the whole pack, so the cards
    // print the same whatever theme the organiser is viewing in — see the
    // block in globals.css for the measurements that forced it.
    <div className="paper flex flex-col gap-8 print:block">
      {/* The three sheets live in ./pack-sheet, shared with the features
          page so the pack it depicts and the pack it prints cannot drift. */}
      <div className={hideWhenOtherPrints("a4")}>
        <SheetPrintButton target="a4" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          scale="a4"
          className="break-after-page"
        />
      </div>

      <div className={hideWhenOtherPrints("a5")}>
        <SheetPrintButton target="a5" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          scale="a5"
          className="break-after-page"
        />
      </div>

      <div className={hideWhenOtherPrints("a6")}>
        <SheetPrintButton target="a6" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          scale="a6"
          className="break-after-page"
        />
      </div>

      <div className={hideWhenOtherPrints("tent")}>
        <SheetPrintButton target="tent" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          scale="tent"
          className="break-after-page"
        />
      </div>

      <div className={hideWhenOtherPrints("wallet")}>
        <SheetPrintButton target="wallet" onPrint={setPrintTarget} />
        <PackSheet data={data} steps={steps} scale="wallet" />
      </div>
    </div>
  )
}
