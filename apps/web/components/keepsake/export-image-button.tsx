"use client"

import { useState } from "react"
import { ImageDown } from "lucide-react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import { toast } from "sonner"

// The keepsake as a PNG — the stationery roadmap's first step (export
// images, then paper templates). The register pages promised "an image to
// share" long before this existed; this makes the claim true.
//
// Client-side snapshot of the RENDERED sheet (html-to-image draws the DOM
// into an SVG foreignObject and rasterises it), so the download is exactly
// the certificate on screen — tokens, fonts, the register's palette — with
// no second renderer to drift. pixelRatio 2 gives 2246×1588 landscape
// (≈192dpi on A4), enough for a domestic print or a phone share.
//
// The node is captured at LAYOUT size: PrintWorkspace scales the sheet with
// a transform, and html-to-image reads offsetWidth/Height, which transforms
// don't touch — the export is full-size however far the desk is zoomed out.
export function ExportImageButton({
  sheetRef,
  filename,
}: {
  sheetRef: React.RefObject<HTMLDivElement | null>
  filename: string
}) {
  const [busy, setBusy] = useState(false)

  async function download() {
    const node = sheetRef.current
    if (!node || busy) return
    setBusy(true)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = filename
      a.click()
    } catch {
      toast.error("The image export failed — try the Print button instead.", {
        style: TOAST_ERROR_STYLE,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={download} disabled={busy}>
      <ImageDown data-icon="inline-start" aria-hidden="true" />
      {busy ? "Exporting…" : "Export image"}
    </Button>
  )
}
