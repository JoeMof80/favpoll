"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintWorkspace } from "@/components/print-workspace"
import {
  KeepsakeDocument,
  type KeepsakeData,
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
// Remembered per favpoll, not globally — someone may keep one of each.

export function KeepsakeView({
  data,
  favpollId,
  defaultVariant,
  leading,
  exportCsv,
}: {
  data: KeepsakeData
  favpollId: string
  defaultVariant: KeepsakeVariant
  /** The way back, at the far left of the one toolbar. */
  leading?: React.ReactNode
  /** The CSV export, folded in from the page's own header row. */
  exportCsv?: React.ReactNode
}) {
  const [variant, setVariant] = useState<KeepsakeVariant>(defaultVariant)
  const key = `favpoll:keepsake-variant:${favpollId}`

  // Adopted after mount, not in the initial state: the server render knows
  // nothing of localStorage, and seeding from it directly would hydrate
  // against different markup. Same reason the display does it this way.
  useEffect(() => {
    const stored = window.localStorage.getItem(key)
    if (stored === "tribute" || stored === "fundraiser") setVariant(stored)
  }, [key])

  function choose(next: KeepsakeVariant) {
    setVariant(next)
    window.localStorage.setItem(key, next)
  }

  return (
    // CALM, deliberately. The pack is organiser admin and a workspace suits
    // it exactly; the keepsake is closer to a gift and often a remembrance,
    // and a tool-like canvas round a memorial reads cold. Same shell, fewer
    // controls, and the sheet given the room.
    //
    // A keepsake is always one LANDSCAPE A4: 1123 wide, 794 tall.
    <>
      {/* Landscape, because the document is — see keepsake-document. */}
      <style>{`@page { size: A4 landscape; margin: 10mm; }`}</style>
      <PrintWorkspace
        widestPx={1123}
        tallestPx={794}
        calm
        leading={leading}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={variant}
              onValueChange={(v) => choose(v as KeepsakeVariant)}
              className="shrink-0"
            >
              <TabsList variant="line">
                <TabsTrigger value="tribute">Tribute</TabsTrigger>
                <TabsTrigger value="fundraiser">Fundraiser</TabsTrigger>
              </TabsList>
            </Tabs>
            {exportCsv}
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
        <div className="paper h-[210mm] w-[297mm] overflow-hidden bg-background shadow-lg print:h-[190mm] print:w-[277mm] print:shadow-none">
          <KeepsakeDocument data={data} variant={variant} />
        </div>
      </PrintWorkspace>
    </>
  )
}
