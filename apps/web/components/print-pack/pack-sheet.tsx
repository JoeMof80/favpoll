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
              <PackCard data={data} steps={steps} scale="a4" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (scale === "a6") {
    return (
      // FULL BLEED, and it has to be: four A6 cards tile an A4 sheet exactly
      // (2 x 105 = 210mm, 2 x 148.5 = 297mm), so there is no room left for a
      // printer margin. Anything less than the whole sheet and they stop
      // being A6 — which matters, because a postcard gets posted and A6 is
      // what fits the envelope and the letter rate.
      //
      // Same rotate-onto-portrait sandwich as the poster: the cards are
      // landscape and four of them make a 297 x 210 block, which is turned
      // 90 degrees so this sheet stays portrait like every other one and a
      // single print job still covers the pack. The half-size/scale(2) pair
      // keeps the pre-transform layout box small enough not to fragment
      // across pages in the print dialog.
      <section
        className={`${SHEET} flex items-center justify-center overflow-hidden p-0 print:break-inside-avoid ${className}`}
      >
        <div className="flex h-[297mm] w-[210mm] max-w-full break-inside-avoid items-center justify-center">
          <div className="h-[105mm] w-[148.5mm] [transform:rotate(-90deg)_scale(2)]">
            <div className="grid h-[210mm] w-[297mm] origin-top-left scale-50 grid-cols-2 grid-rows-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PackCard key={i} data={data} steps={steps} scale="a6" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (scale === "a5") {
    return (
      // Two per sheet, for tables and easels.
      <section
        className={`${SHEET} flex min-h-[277mm] flex-col items-center px-6 py-6 print:min-h-0 ${className}`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-[6mm]">
          <PackCard data={data} steps={steps} scale="a5" />
          <PackCard data={data} steps={steps} scale="a5" />
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
