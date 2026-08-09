"use client"

import { useRef, useState } from "react"
import { Download, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandedQR, buildQrOptions } from "@/components/branded-qr"

// The code on its own, as a file.
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
    // .paper pins the light token values, so the downloaded code is the one
    // the pack prints whatever theme the organiser is viewing in.
    <section
      ref={scopeRef}
      className="paper paper-screen mb-4 rounded-lg border border-border bg-background px-5 py-4 print:hidden"
    >
      <div className="flex flex-wrap items-start gap-5">
        <BrandedQR
          value={value}
          size={96}
          aria-label="The code that opens this favpoll"
        />
        <div className="min-w-64 flex-1">
          <h2 className="text-base font-medium text-foreground">
            Using your own stationery
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Download the code and put it on anything — an order of service, a
            stationer&rsquo;s own design, a menu you are printing already. Print
            it at least {MIN_MM}mm across, with clear space around it, or it
            will scan reluctantly.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => download("svg")}
            >
              <Download data-icon="inline-start" aria-hidden="true" />
              {busy === "svg" ? "Preparing…" : "Download SVG"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => download("png")}
            >
              <Download data-icon="inline-start" aria-hidden="true" />
              {busy === "png" ? "Preparing…" : "Download PNG"}
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ScanLine className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            SVG stays sharp at any size — give a printer that one if they ask.
          </p>
        </div>
      </div>
    </section>
  )
}
