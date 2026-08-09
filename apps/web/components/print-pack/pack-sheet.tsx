import { PackCard, SCALE } from "./pack-card"
import type { PackData } from "./pack-card"

// One A4 sheet of the pack, exactly as it prints.
//
// Split out of PackDocument (2026-08-09) so the features page can show the
// three sheets pre-print without restating their layouts. It had a fan of
// three loose cards instead, which showed the three SIZES but not the thing
// an organiser actually gets: three sheets of A4, carrying one poster, two
// table cards and eight wallet cards. That is the fact worth showing, and
// the only honest way to show it is to render the sheets.
//
// Every sheet is portrait A4 and 277mm of usable height — the print box
// inside the paper, not the paper itself.

// Distinct pages on screen (border + shadow), seamless in print where
// break-after-page splits them.
const SHEET =
  "bg-background border border-border rounded-lg shadow-sm print:border-0 print:rounded-none print:shadow-none"

// THE SAFE BOX. Every sheet lays out inside this, and it is why the A6 sheet
// is no longer full bleed (founder-caught in the print dialog, 2026-08-10):
// four A6 tile A4 exactly, so a full-bleed sheet has nothing left for the
// printer's own margin and Chrome fragments it across two pages. A postcard
// cut a few mm under A6 still takes a stamp — Royal Mail's letter limit is
// 240 x 165mm — so the exactness was never worth the fragility.
//
// 196 x 264mm sits inside Chrome's 10mm default (190 x 277) on the short
// edge and well inside it on the long one, with room for printers whose
// hardware margin is worse.
const SAFE_W = "196mm"
const SAFE_H = "264mm"

// Dashed cut guides, drawn ON the sheet rather than round each card. They are
// what a border used to imply, without the border's problem: a printed rule
// round a card shows every millimetre you cut off-line, whereas a dashed line
// down the middle is aimed at, not compared against.
function CutGuides({ quarters = false }: { quarters?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
      {quarters && (
        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-border" />
      )}
    </div>
  )
}

export function PackSheet({
  data,
  steps,
  scale,
  className = "",
}: {
  data: PackData
  steps: string[] | null
  scale: keyof typeof SCALE
  /** Sheet-level extras from the host — break-after-page, print:hidden. */
  className?: string
}) {
  if (scale === "a4") {
    return (
      // The A4 card: a landscape design ROTATED 90° onto a portrait sheet
      // (founder, 2026-08-02) — every sheet stays portrait, one print job
      // covers the pack, and the poster comes out landscape when the paper is
      // turned. The card keeps real mm dimensions in the pre-rotation box.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2 ${className}`}
      >
        {/* Print fragmentation uses PRE-transform boxes, so a rotated
            250mm-wide element split across pages in the print dialog
            (founder-caught twice, 2026-08-02; headless zero-margin PDFs
            masked it). The half-size/scale(2) sandwich keeps the layout box
            at 125 × 90 mm — far inside any printable area, one fragment —
            while painting at the full 250 × 180. */}
        <div className="flex h-[250mm] w-[180mm] max-w-full break-inside-avoid items-center justify-center">
          <div className="h-[90mm] w-[125mm] [transform:rotate(-90deg)_scale(2)]">
            <div className="h-[180mm] w-[250mm] origin-top-left scale-50">
              <PackCard data={data} steps={steps} scale="a4" bleed />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (scale === "a6") {
    return (
      // Four postcards, quartered. The cards are landscape and four make a
      // 264 x 196 block, turned 90 degrees onto a portrait sheet — the
      // poster's trick, so every sheet in the pack stays portrait and one
      // print job still covers it. The half-size/scale(2) sandwich comes with
      // it: print fragmentation uses PRE-transform boxes, and that is what
      // stops a rotated sheet splitting across pages.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2 ${className}`}
      >
        <div
          className="flex max-w-full break-inside-avoid items-center justify-center"
          style={{ width: SAFE_W, height: SAFE_H }}
        >
          <div
            className="[transform:rotate(-90deg)_scale(2)]"
            style={{ width: "132mm", height: "98mm" }}
          >
            <div
              className="relative origin-top-left scale-50"
              style={{ width: "264mm", height: "196mm" }}
            >
              <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PackCard
                    key={i}
                    data={data}
                    steps={steps}
                    scale="a6"
                    bleed
                  />
                ))}
              </div>
              <CutGuides quarters />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (scale === "a5") {
    return (
      // Two per sheet, for tables and easels — the sheet cut in half.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:p-2 ${className}`}
      >
        <div
          className="relative max-w-full break-inside-avoid"
          style={{ width: SAFE_W, height: SAFE_H }}
        >
          <div className="grid h-full w-full grid-rows-2">
            <PackCard data={data} steps={steps} scale="a5" bleed />
            <PackCard data={data} steps={steps} scale="a5" bleed />
          </div>
          <CutGuides />
        </div>
      </section>
    )
  }

  // Wallet cards: credit-card size (85.6 × 54 mm), eight to a sheet.
  return (
    <section
      className={`${SHEET} min-h-[277mm] px-6 py-8 print:min-h-0 ${className}`}
    >
      <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
        {Array.from({ length: 8 }).map((_, i) => (
          <PackCard key={i} data={data} steps={steps} scale="wallet" />
        ))}
      </div>
    </section>
  )
}
