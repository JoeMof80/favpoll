"use client"

import { useRef, useState } from "react"
import { ChevronDown, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { buildQrOptions } from "@/components/branded-qr"

// The code on its own, as a file — a TOOLBAR MENU, not a card.
//
// It was a full-width panel with the code, two buttons and two lines of
// explanation, above the paper (founder, 2026-08-15). Downloading the code is
// a thing you do once, if at all; it does not need a third of the screen
// every visit, above the thing you came to look at.
//
// favpoll will never template every kind of stationery — the printers people
// already use, a wedding stationer's own design, an insert a funeral director
// is producing. Handing over the code itself covers all of them at once, and
// is the reason this ships before more templates do.
//
// The colour is read from the SAME .paper scope the pack prints in, not from
// the page theme. A dark-mode organiser downloading a near-white code onto
// white card is exactly the failure #535 fixed on the cards themselves, and
// an exported file carries it out of the app where nothing can correct it.

// 1024px is far past what any of this needs — at the 13mm floor below it is
// ~2000dpi — but the file is a few KB and it costs nothing to be beyond
// argument. SVG is the better answer for a designer and is offered first.
const PNG_SIZE = 1024

// 33 modules at the ~0.4mm floor a domestic printer needs, plus the 4-module
// quiet zone the spec requires: (33 + 8) x 0.4 = 16.4mm of code and margin,
// of which the code itself is 13.2mm. Stated on screen because an exported
// file lands somewhere favpoll cannot check it — this is the one number that
// decides whether it scans.
const MIN_MM = 13

// The design tokens resolve to lab()/oklch(), which every browser reads and a
// lot of print software does not. An exported SVG is the one artefact favpoll
// hands to a stranger's toolchain — Illustrator, a shop's RIP, Word — so the
// colour is rasterised to plain sRGB hex first. Canvas does the conversion:
// fillStyle accepts any CSS colour the browser understands and getImageData
// gives it back as bytes.
function toSrgbHex(color: string): string {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return "#000000"
  // Seed with black: an unparseable fillStyle is IGNORED rather than throwing,
  // so without this a failure would silently inherit whatever came before.
  ctx.fillStyle = "#000000"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

export function QrExport({ value, name }: { value: string; name: string }) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<"png" | "svg" | null>(null)

  async function download(extension: "png" | "svg") {
    const node = scopeRef.current
    if (!node || busy) return
    setBusy(extension)
    try {
      const token =
        getComputedStyle(node).getPropertyValue("--foreground").trim() ||
        "black"
      const foreground = toSrgbHex(token)
      const { default: QRCodeStyling } = await import("qr-code-styling")
      const qr = new QRCodeStyling(
        buildQrOptions({ value, size: PNG_SIZE, foreground, logo: true })
      )
      await qr.download({ name, extension })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {/* The pinned scope download() reads --foreground from. A PROBE, not a
          wrapper (2026-08-15): it used to wrap the trigger and its menu, so
          the toolbar's own controls sat inside pinned LIGHT tokens and came
          out near-white on a dark band in dark mode. Nothing here is printed —
          the export only ever needed an element to call getComputedStyle on.
          Custom properties compute on a display:none element, so `hidden`
          costs no layout and no paint. */}
      <div ref={scopeRef} hidden className="paper" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy !== null}
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            {busy ? "Preparing…" : "Download code"}
            <ChevronDown data-icon="inline-end" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem onSelect={() => download("svg")}>
            <span className="flex min-w-0 flex-col">
              <span>Download SVG</span>
              <span className="text-xs text-muted-foreground">
                Stays sharp at any size — give a printer this one
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => download("png")}>
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* The one number that decides whether an exported code works, kept
              with the thing it governs. */}
          <p className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
            Put it on anything — an order of service, a stationer&rsquo;s own
            design, a menu. Print it at least {MIN_MM}mm across with clear space
            around it, or it will scan reluctantly.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
