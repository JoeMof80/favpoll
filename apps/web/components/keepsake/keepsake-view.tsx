"use client"

import { useEffect, useState } from "react"
import {
  SegmentedControl,
  ToolbarLabel,
} from "@/components/ui/segmented-control"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintWorkspace } from "@/components/print-workspace"
import { ExportCsvButton } from "./export-csv-button"
import {
  KeepsakeDocument,
  type KeepsakeData,
  type KeepsakeOrientation,
  type KeepsakeVariant,
} from "./keepsake-document"

// The keepsake's variant switch, deliberately the same shape as the live
// display's presenter override: default from the register, let the organiser
// flip it, remember what they chose.
//
// A memorial opens quiet and a fundraiser opens loud, but the register is a
// guess about the day and the organiser was there. The display has always
// worked this way; the sheet afterwards should not ask a different question.
//
// The ORIENTATION toggle (founder, 2026-08-16) works the same way — guests'
// frames vary, so the organiser picks the paper. Landscape is the default:
// it is the classic certificate shape.
//
// Both remembered per favpoll, not globally — someone may keep one of each.

export function KeepsakeView({
  data,
  favpollId,
  defaultVariant,
  leading,
}: {
  data: KeepsakeData
  favpollId: string
  defaultVariant: KeepsakeVariant
  /** The way back, at the far left of the one toolbar. */
  leading?: React.ReactNode
}) {
  const [variant, setVariant] = useState<KeepsakeVariant>(defaultVariant)
  const [orientation, setOrientation] =
    useState<KeepsakeOrientation>("landscape")
  const variantKey = `favpoll:keepsake-variant:${favpollId}`
  const orientationKey = `favpoll:keepsake-orientation:${favpollId}`

  // Adopted after mount, not in the initial state: the server render knows
  // nothing of localStorage, and seeding from it directly would hydrate
  // against different markup. Same reason the display does it this way.
  useEffect(() => {
    const storedVariant = window.localStorage.getItem(variantKey)
    if (storedVariant === "tribute" || storedVariant === "fundraiser")
      setVariant(storedVariant)
    const storedOrientation = window.localStorage.getItem(orientationKey)
    if (storedOrientation === "landscape" || storedOrientation === "portrait")
      setOrientation(storedOrientation)
  }, [variantKey, orientationKey])

  function chooseVariant(next: KeepsakeVariant) {
    setVariant(next)
    window.localStorage.setItem(variantKey, next)
  }

  function chooseOrientation(next: KeepsakeOrientation) {
    setOrientation(next)
    window.localStorage.setItem(orientationKey, next)
  }

  const isPortrait = orientation === "portrait"

  return (
    // CALM, deliberately. The pack is organiser admin and a workspace suits
    // it exactly; the keepsake is closer to a gift and often a remembrance,
    // and a tool-like canvas round a memorial reads cold. Same shell, fewer
    // controls, and the sheet given the room.
    //
    // An A4: 1123 x 794px landscape, 794 x 1123 portrait.
    <>
      {/* The @page follows the toggle, so the browser's print dialog opens
          on the right paper without the organiser touching a setting. */}
      <style>{`@page { size: A4 ${orientation}; margin: 10mm; }`}</style>
      <PrintWorkspace
        widestPx={isPortrait ? 794 : 1123}
        tallestPx={isPortrait ? 1123 : 794}
        calm
        leading={leading}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <ToolbarLabel>Style</ToolbarLabel>
            <SegmentedControl
              label="How the keepsake is told"
              value={variant}
              onChange={(v) => chooseVariant(v as KeepsakeVariant)}
              options={[
                { value: "tribute", label: "Tribute" },
                { value: "fundraiser", label: "Fundraiser" },
              ]}
            />
            <ToolbarLabel>Paper</ToolbarLabel>
            <SegmentedControl
              label="Which way the paper turns"
              value={orientation}
              onChange={(v) => chooseOrientation(v as KeepsakeOrientation)}
              options={[
                { value: "landscape", label: "Landscape" },
                { value: "portrait", label: "Portrait" },
              ]}
            />
            {/* Rendered HERE rather than taken as an `exportCsv` element prop.
                Passed in from the server page it produced a React key warning
                on every visit ("passed a child from KeepsakePage") — bisected
                to this prop exactly. The pack passes `qrExport` the same way
                and does NOT warn, so the mechanism is not simply "server page
                hands a client element across", and I have not pinned it down.
                What is certain: this component already receives `data`, so the
                element was never needed, and rendering it here is both simpler
                and silent. */}
            <ExportCsvButton data={data} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer data-icon="inline-start" aria-hidden="true" />
              Print
            </Button>
          </div>
        }
      >
        {/* .paper pins the light token values on the SHEET only — the workspace
          around it stays themed. Without this a dark-mode organiser printed a
          keepsake in near-white ink on white paper. Same fix as the print
          pack (#535); the keepsake never got it. */}
        {/* NO BORDER, and the pack now follows this sheet rather than the
            other way round (founder, 2026-08-15). White paper on a muted desk
            separates on its own; an outline as well drew the sheet as a UI
            card, which is the read this whole workspace is trying to avoid.
            The shadow is the only edge paper actually has. */}
        <div
          className={`paper overflow-hidden bg-background shadow-lg print:shadow-none ${
            isPortrait
              ? "h-[297mm] w-[210mm] print:h-[277mm] print:w-[190mm]"
              : "h-[210mm] w-[297mm] print:h-[190mm] print:w-[277mm]"
          }`}
        >
          <KeepsakeDocument
            data={data}
            variant={variant}
            orientation={orientation}
          />
        </div>
      </PrintWorkspace>
    </>
  )
}
