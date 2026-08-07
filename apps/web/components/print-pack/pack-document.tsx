"use client"

import { useEffect, useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PackCard, SCALE, buildPackSteps } from "./pack-card"
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

  // Each section is one A4 sheet: distinct pages on screen (border +
  // shadow + gap), seamless in print where break-after-page splits them.
  const sheet =
    "bg-background border border-border rounded-lg shadow-sm print:border-0 print:rounded-none print:shadow-none"

  return (
    // .paper pins the light token values across the whole pack, so the cards
    // print the same whatever theme the organiser is viewing in — see the
    // block in globals.css for the measurements that forced it.
    <div className="paper flex flex-col gap-8 print:block">
      {/* ── A4 card: landscape design ROTATED 90° on a portrait sheet
          (founder, 2026-08-02) — every sheet stays portrait, one print
          job covers the pack, and the poster comes out landscape when
          the paper is turned. The card keeps real mm dimensions in the
          pre-rotation box. ── */}
      <div className={hideWhenOtherPrints("a4")}>
        <SheetPrintButton target="a4" onPrint={setPrintTarget} />
        <section
          className={`${sheet} flex min-h-[277mm] break-after-page items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2`}
        >
          {/* Print fragmentation uses PRE-transform boxes, so a rotated
              250mm-wide element split across pages in the print dialog
              (founder-caught twice, 2026-08-02; headless zero-margin
              PDFs masked it). The half-size/scale(2) sandwich keeps the
              layout box at 125 × 90 mm — far inside any printable area,
              one fragment — while painting at the full 250 × 180.
              -rotate-90: the poster reads by turning the page clockwise. */}
          <div className="flex h-[250mm] w-[180mm] max-w-full break-inside-avoid items-center justify-center">
            <div className="h-[90mm] w-[125mm] [transform:rotate(-90deg)_scale(2)]">
              <div className="h-[180mm] w-[250mm] origin-top-left scale-50">
                <PackCard data={data} steps={steps} scale="a4" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── A5 cards: two per sheet, for tables and easels ── */}
      <div className={hideWhenOtherPrints("a5")}>
        <SheetPrintButton target="a5" onPrint={setPrintTarget} />
        <section
          className={`${sheet} flex min-h-[277mm] break-after-page flex-col items-center px-6 py-6 print:min-h-0`}
        >
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-[6mm]">
            <PackCard data={data} steps={steps} scale="a5" />
            <PackCard data={data} steps={steps} scale="a5" />
          </div>
        </section>
      </div>

      {/* ── Wallet cards: credit-card size (85.6 × 54 mm) ── */}
      <div className={hideWhenOtherPrints("wallet")}>
        <SheetPrintButton target="wallet" onPrint={setPrintTarget} />
        <section className={`${sheet} min-h-[277mm] px-6 py-8 print:min-h-0`}>
          <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
            {Array.from({ length: 8 }).map((_, i) => (
              <PackCard key={i} data={data} steps={steps} scale="wallet" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
