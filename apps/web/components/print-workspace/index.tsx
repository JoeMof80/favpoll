"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ToolbarBand } from "@/components/ui/toolbar-band"
import {
  SegmentedControl,
  ToolbarLabel,
} from "@/components/ui/segmented-control"

// A print workspace: the sheet stops being a card in a scrolling page and
// becomes a piece of paper on a desk, with the controls of a print app round
// it (founder, 2026-08-15).
//
// WHY THIS EXISTS. Both surfaces that show printable sheets — the pack and
// the keepsake — had hand-built page chrome that happened to look similar.
// They are the same job: here is a sheet you are about to print. One shell
// makes them consistent and gives the keepsake the "this is A4" affordance it
// never had.
//
// ZOOM IS THE PART OF THE METAPHOR THAT EARNS ITS KEEP. An A4 page at 100% is
// 794 x 1123px, so on most screens you cannot see a whole sheet — you scroll
// a document you are meant to judge AS A PAGE. Fit / 50 / 100 is what every
// print app gives you and what was missing.
//
// NOT DRAGGABLE, deliberately. Free panning is the costly half — pan state,
// scroll conflicts, touch, keyboard reach, "where did my sheet go" — to
// support a gesture that only matters when you are COMPOSING a layout. These
// pages review fixed pages before printing. The paper reads as paper from the
// page shape, the shadow, the surface and the zoom.

const ZOOMS = [0.5, 0.75, 1] as const
type Zoom = "fit" | (typeof ZOOMS)[number]

export function PrintWorkspace({
  children,
  leading,
  toolbar,
  /** Widest sheet in CSS px — 1123 for a landscape A4, 794 for portrait. */
  widestPx,
  tallestPx,
  /** Quieter chrome, for the keepsake: no zoom presets, just fit and 100%. */
  calm = false,
}: {
  children: React.ReactNode
  /** Far-left of the toolbar — the way back. */
  leading?: React.ReactNode
  toolbar?: React.ReactNode
  /** Widest sheet in CSS px — 1123 for a landscape A4, 794 for portrait. */
  widestPx: number
  /** Tallest sheet in CSS px — 1123 portrait, 794 landscape. */
  tallestPx: number
  calm?: boolean
}) {
  const [zoom, setZoom] = useState<Zoom>("fit")
  const [fitScale, setFitScale] = useState(1)
  const [innerHeight, setInnerHeight] = useState(0)
  const frameRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const measure = useCallback(() => {
    const frame = frameRef.current
    const inner = innerRef.current
    if (!frame || !inner) return
    // FIT MEANS A WHOLE PAGE, not a page that happens to be narrow enough.
    // Fitting width alone left a landscape A4 at 100% on a wide screen while
    // its bottom third sat below the fold — which is the thing this control
    // exists to stop.
    //
    // 48px of breathing room on the width; the height budget is the viewport
    // less the site header, the toolbar and the desk's padding.
    const availableW = frame.clientWidth - 48
    const availableH = window.innerHeight - 220
    setFitScale(Math.min(1, availableW / widestPx, availableH / tallestPx))
    setInnerHeight(inner.scrollHeight)
  }, [widestPx, tallestPx])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    const ro = new ResizeObserver(measure)
    if (frameRef.current) ro.observe(frameRef.current)
    if (innerRef.current) ro.observe(innerRef.current)
    return () => {
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [measure])

  const scale = zoom === "fit" ? fitScale : zoom
  const presets: Zoom[] = calm ? ["fit", 1] : ["fit", ...ZOOMS]

  return (
    <div ref={frameRef} className="w-full">
      {/* Sticky, so the controls stay with you down a long pack. Never
          printed — this is the desk, not the paper. */}
      {/* ONE toolbar, and the SAME band the favpolls lists use (founder,
          2026-08-15). The page carried a back-link and a Save-as-PDF row
          above the workspace's own bar — two bars doing one job, and Save as
          PDF had become the same action as Print this sheet once the pack
          showed one sheet at a time.
          The band is full-bleed, so this component owns the centred column
          beneath it rather than sitting inside the page's. */}
      <ToolbarBand className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {leading}
        <ToolbarLabel>Zoom</ToolbarLabel>
        <SegmentedControl
          label="Zoom"
          value={String(zoom)}
          onChange={(v) => setZoom(v === "fit" ? "fit" : (Number(v) as Zoom))}
          options={presets.map((z) => ({
            value: String(z),
            label: z === "fit" ? "Fit" : `${Math.round(z * 100)}%`,
          }))}
        />
        {toolbar && (
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {toolbar}
          </div>
        )}
      </ToolbarBand>

      {/* The desk. A tinted, inset surface so the white of the paper is read
          as paper rather than as the page background. */}
      <div className="mx-auto max-w-330 px-4 py-6 print:max-w-none print:p-0">
        <div className="rounded-lg bg-muted/40 p-6 inset-shadow-sm print:bg-transparent print:p-0">
          {/* The scaled box reserves the SCALED height. A transform does not
            affect layout, so without this the surface keeps the unscaled
            height and leaves a hole under a zoomed-out sheet. */}
          <div
            style={{ height: innerHeight ? innerHeight * scale : undefined }}
            className="print:!h-auto"
          >
            <div
              ref={innerRef}
              style={{ transform: `scale(${scale})` }}
              className="flex origin-top flex-col items-center gap-6 print:!transform-none print:gap-0"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
