"use client"

import { useEffect, useRef, useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Info } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { buildPackSteps } from "./pack-card"
import { BrandedQR } from "@/components/branded-qr"
import { InsertCard, INSERT_CARD_WIDTH } from "./insert-card"
import { ExportImageButton } from "@/components/keepsake/export-image-button"
import { PackSheet, PLAIN_ORIENTATION } from "./pack-sheet"
import { AverySheet, AVERY_SHEETS } from "./avery-sheet"
import type { AveryCode } from "./avery-sheet"
import { Switch } from "@/components/ui/switch"
import { PrintWorkspace } from "@/components/print-workspace"
import { ToolbarLabel } from "@/components/ui/segmented-control"
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

type Target = keyof typeof PLAIN_ORIENTATION | AveryCode | "insert" | "qr"

// One tab per sheet, in the order an organiser meets them: the big things
// for the room first, then the things for a table, then the small things.
// The insert card last — not a printed sheet but a downloadable block to
// set into stationery the family already has (founder, 2026-09-14).
const SHEETS: { id: Target; label: string; note: string }[] = [
  { id: "a4", label: "Poster", note: "A4 · 1 to a sheet" },
  { id: "a5", label: "Table cards", note: "A5 · 2 to a sheet" },
  { id: "a6", label: "Postcards", note: "A6 · 4 to a sheet" },
  ...(Object.keys(AVERY_SHEETS) as AveryCode[]).map((code) => ({
    id: code as Target,
    label: AVERY_SHEETS[code].label,
    note: `${AVERY_SHEETS[code].note} · fits Avery ${AVERY_SHEETS[code].code}`,
  })),
  {
    id: "insert",
    label: "Insert card",
    note: "image · for your own stationery",
  },
  // The code alone, folded in from its own toolbar dropdown (founder,
  // 2026-09-14): one menu = every artefact, the action button adapts.
  {
    id: "qr",
    label: "QR code",
    note: "code alone · put it on anything",
  },
]

export function PackDocument({
  data,
  leading,
  qrExport,
}: {
  data: PackData
  /** The way back, rendered at the far left of the one toolbar. */
  leading?: React.ReactNode
  /** The download-the-code control — rendered as THE action when the
   *  QR code is the selected artefact (founder, 2026-09-14). */
  qrExport?: React.ReactNode
}) {
  const steps = buildPackSteps(data)

  // ONE SHEET AT A TIME (founder, 2026-08-15). The pack showed all eight
  // stacked, which is a scroll rather than a thing you look at — and it made
  // printing awkward, because "print this page" had to hide the other seven.
  //
  // Selecting a sheet is now the same act as choosing what to print, so the
  // hide-the-others machinery is gone and @page orientation simply follows
  // the selection.
  const [selected, setSelected] = useState<Target>("a4")
  const [printing, setPrinting] = useState(false)
  // Guides default ON: most organisers print on whatever paper they have.
  // Turning them off is the deliberate act of someone holding Avery stock.
  const [guides, setGuides] = useState(true)

  useEffect(() => {
    if (!printing) return
    const reset = () => setPrinting(false)
    window.addEventListener("afterprint", reset)
    const id = requestAnimationFrame(() => window.print())
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener("afterprint", reset)
    }
  }, [printing])

  const insertRef = useRef<HTMLDivElement>(null)

  const isInsert = selected === "insert"
  const isQr = selected === "qr"
  const isAvery = selected in AVERY_SHEETS
  const landscape =
    isInsert || isQr
      ? false
      : isAvery
        ? AVERY_SHEETS[selected as AveryCode].orientation === "landscape"
        : PLAIN_ORIENTATION[selected as keyof typeof PLAIN_ORIENTATION] ===
          "landscape"
  const current = SHEETS.find((s) => s.id === selected)!

  return (
    // .paper pins the light token values so the cards print the same whatever
    // theme the organiser views in — but it belongs on the SHEETS, not here.
    // See pack-sheet.tsx: wrapping the whole pack put the toolbar inside it.
    <div className="print:block">
      <style>{`@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 10mm; }`}</style>

      {/* THE SELECTED SHEET's dimensions, not the pack's envelope. An A4 is
          794 x 1123 one way round and 1123 x 794 the other, and this used to
          pass 1123 for BOTH axes — the biggest each axis ever gets — so every
          sheet was fitted to a square that no sheet is. A landscape poster got
          sized as though it were also portrait-tall and sat well under the
          space it had. The pack showed all eight at once when that was
          written; it shows one at a time now, so the envelope has no one left
          to protect. The same `landscape` that sets @page sets this. */}
      <PrintWorkspace
        // The insert is its own small object, not a sheet — sized to the
        // card so the desk doesn't scale it down to A4's envelope. Height
        // is a ceiling estimate: the card grows with the topic's wrap.
        widestPx={
          isQr ? 306 : isInsert ? INSERT_CARD_WIDTH : landscape ? 1123 : 794
        }
        tallestPx={isQr ? 306 : isInsert ? 500 : landscape ? 794 : 1123}
        leading={leading}
        toolbar={
          <>
            {/* A dropdown, not tabs (founder, 2026-08-15). Eight tabs is a
                scrolling strip that pushed the paper down the page; the
                sheet you want is a choice, and a choice is a menu.
                NO LABEL (founder, 2026-09-14): with the insert card and
                the QR in here "Sheet" stopped being true, and the
                dropdown's own value explains itself. */}
            <DropdownMenu>
              {/* Default size throughout the toolbar — level with the
                  leading back button (founder, 2026-09-14). */}
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  {current.label}
                  <ChevronDown data-icon="inline-end" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {SHEETS.map((sheet) => (
                  <DropdownMenuItem
                    key={String(sheet.id)}
                    onSelect={() => setSelected(sheet.id)}
                    className="items-start"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{sheet.label}</span>
                      {/* The note WRAPS, never truncates (founder, 2026-08-17).
                          It ends in "fits Avery L7418" — the code you buy the
                          stationery by — so an ellipsis eats precisely the one
                          token the menu exists to tell you. Two lines on the
                          longest notes is the correct trade; a fixed-width box
                          clipping its own payload is not. */}
                      <span className="text-xs leading-snug text-muted-foreground">
                        {sheet.note}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cut lines and the print advice are PRINT concerns — they
                show only when Print is the action (founder, 2026-09-14:
                advice lives with the control it governs; the insert
                downloads and the QR has its own 13mm note in its
                Download menu). */}
            {!isInsert && !isQr && (
              <>
                <ToolbarLabel>Cut lines</ToolbarLabel>
                <Switch
                  aria-label="Cut lines"
                  checked={guides}
                  onCheckedChange={setGuides}
                />

                {/* The printing advice was a full-width alert taking a
                    third of the screen above the paper. It is worth
                    saying — it was born of a card that scanned
                    reluctantly — but it is worth saying ONCE, to
                    whoever asks. */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Before you print a batch"
                    >
                      <Info data-icon="inline-start" aria-hidden="true" />
                      Before you print
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-80 text-sm leading-relaxed"
                  >
                    Print a single card and scan it with a phone camera, held at
                    the distance and in the light your guests will have. Home
                    printers vary more than you would expect, and the wallet
                    card carries the smallest code — if any card is going to
                    struggle, it is that one.
                  </PopoverContent>
                </Popover>
              </>
            )}

            {isInsert ? (
              <ExportImageButton
                sheetRef={insertRef}
                filename="favpoll-insert-card.png"
                variant="secondary"
                size="default"
              />
            ) : isQr ? (
              qrExport
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPrinting(true)}
              >
                <Printer data-icon="inline-start" aria-hidden="true" />
                Print
              </Button>
            )}
          </>
        }
      >
        <div data-sheet={String(selected)}>
          {isQr ? (
            // The code as it downloads, on a paper panel — .paper pins
            // light tokens so the preview matches the exported file
            // whatever theme the organiser views in.
            <div className="paper paper-screen inline-block rounded-lg border border-border bg-background p-6">
              <BrandedQR
                value={data.qrUrl}
                size={256}
                aria-label="QR code for the favpoll"
              />
            </div>
          ) : isInsert ? (
            // inline-block wrapper: the export captures the ref node's
            // layout box, and a block div would hand it the workspace's
            // full width of empty desk.
            <div ref={insertRef} className="inline-block">
              <InsertCard data={data} />
            </div>
          ) : isAvery ? (
            <AverySheet
              data={data}
              steps={steps}
              code={selected as AveryCode}
              guides={guides}
            />
          ) : (
            <PackSheet
              data={data}
              steps={steps}
              guides={guides}
              scale={selected as "a4" | "a5" | "a6"}
            />
          )}
        </div>
      </PrintWorkspace>
    </div>
  )
}
