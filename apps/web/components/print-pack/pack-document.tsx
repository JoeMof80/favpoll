"use client"

import { useEffect, useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SCALE, buildPackSteps } from "./pack-card"
import { PackSheet, PLAIN_ORIENTATION } from "./pack-sheet"
import { AverySheet, AVERY_SHEETS } from "./avery-sheet"
import type { AveryCode } from "./avery-sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
type Target = keyof typeof SCALE | AveryCode

function SheetPrintButton({
  target,
  onPrint,
}: {
  target: Target
  onPrint: (target: Target) => void
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
  const [printTarget, setPrintTarget] = useState<Target | null>(null)
  // Guides default ON: most organisers print on whatever paper they have.
  // Turning them off is the deliberate act of someone holding Avery stock.
  const [guides, setGuides] = useState(true)
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

  const hideWhenOtherPrints = (key: Target) =>
    printTarget && printTarget !== key ? "print:hidden" : ""

  // @page is DOCUMENT level — Chrome will not honour a per-sheet orientation
  // inside one document, which is why the Avery sheets used to need a route
  // of their own. Because the pack prints one sheet at a time, the page can
  // instead be set from whatever is being printed. One route, right way up.
  const landscape =
    printTarget !== null &&
    (printTarget in AVERY_SHEETS
      ? AVERY_SHEETS[printTarget as AveryCode].orientation === "landscape"
      : PLAIN_ORIENTATION[printTarget as keyof typeof PLAIN_ORIENTATION] ===
        "landscape")

  return (
    // .paper pins the light token values across the whole pack, so the cards
    // print the same whatever theme the organiser is viewing in — see the
    // block in globals.css for the measurements that forced it.
    <div className="paper flex flex-col gap-8 print:block">
      <style>{`@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 10mm; }`}</style>

      {/* One control for the whole pack. Every Avery layout is a perfectly
          good plain-paper layout — the guides are the only difference. */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 py-4 print:hidden">
        <div className="min-w-0">
          <Label htmlFor="cut-guides" className="text-base font-medium">
            Show cut lines
          </Label>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Leave these on to print on ordinary paper and cut by hand. Turn them
            off if you are printing on the Avery card each sheet names — the
            stock is already cut, and the lines would land on the cards.
          </p>
        </div>
        <Switch id="cut-guides" checked={guides} onCheckedChange={setGuides} />
      </div>
      {/* The three sheets live in ./pack-sheet, shared with the features
          page so the pack it depicts and the pack it prints cannot drift. */}
      <div data-sheet="a4" className={hideWhenOtherPrints("a4")}>
        <SheetPrintButton target="a4" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          guides={guides}
          scale="a4"
          className="break-after-page"
        />
      </div>

      <div data-sheet="a5" className={hideWhenOtherPrints("a5")}>
        <SheetPrintButton target="a5" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          guides={guides}
          scale="a5"
          className="break-after-page"
        />
      </div>

      <div data-sheet="a6" className={hideWhenOtherPrints("a6")}>
        <SheetPrintButton target="a6" onPrint={setPrintTarget} />
        <PackSheet
          data={data}
          steps={steps}
          guides={guides}
          scale="a6"
          className="break-after-page"
        />
      </div>

      {(Object.keys(AVERY_SHEETS) as AveryCode[]).map((code) => {
        const sheet = AVERY_SHEETS[code]
        return (
          <div
            key={code}
            data-sheet={code}
            className={hideWhenOtherPrints(code)}
          >
            <div className="mb-2 flex items-baseline justify-between gap-3 print:hidden">
              <p className="text-sm font-medium text-foreground">
                {sheet.label}{" "}
                <span className="font-normal text-muted-foreground">
                  · fits Avery {sheet.code}
                </span>
              </p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {sheet.note}
              </p>
            </div>
            <SheetPrintButton target={code} onPrint={setPrintTarget} />
            <AverySheet
              data={data}
              steps={steps}
              code={code}
              guides={guides}
              className="break-after-page"
            />
          </div>
        )
      })}
    </div>
  )
}
