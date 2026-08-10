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
// 180 x 250mm, which is the POSTER's footprint — the one geometry in this
// pack with a long history of printing correctly.
//
// It was 196 x 264 for one commit and that was too wide: the printable width
// at Chrome's 10mm default is 190mm. A rotated block ignores max-w-full
// (transforms do not affect layout), so Chrome saw content overflowing the
// page and SHRANK THE WHOLE DOCUMENT to fit — every sheet came out at about
// two thirds size in the top corner of its page.
//
// That failure also passed a page-count check, which is why counting pages is
// not enough on its own: scaling to fit is not fragmenting. Assert the
// geometry.
// The footprint every rotated/cut sheet uses: h-[250mm] w-[180mm], set as
// Tailwind classes rather than inline styles so it is literally the same
// declaration the poster has always used.

// Dashed cut guides, drawn ON the sheet rather than round each card. They are
// what a border used to imply, without the border's problem: a printed rule
// round a card shows every millimetre you cut off-line, whereas a dashed line
// down the middle is aimed at, not compared against.
function CutGuides({ cols = 1, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div
          key={`r${i}`}
          className="absolute inset-x-0 border-t border-dashed border-border"
          style={{ top: `${((i + 1) / rows) * 100}%` }}
        />
      ))}
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <div
          key={`c${i}`}
          className="absolute inset-y-0 border-l border-dashed border-border"
          style={{ left: `${((i + 1) / cols) * 100}%` }}
        />
      ))}
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

  if (scale === "place") {
    return (
      // PLACE CARDS, six to a sheet — one per setting, so the sheet is worth
      // more than the tent card's four. Folded and printed on both faces the
      // same way: the upper copy is upside down and comes the right way up as
      // the card is folded back over itself.
      //
      // steps={null} deliberately. Three numbered steps do not fit beside a
      // code in a 40mm face, and a card at arm's length that gets picked up
      // does not need them — the name, the topic, the code and the
      // shared-fund line say it.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2 ${className}`}
      >
        <div className="relative h-[240mm] w-[176mm] max-w-full break-inside-avoid">
          <div className="grid h-full w-full grid-cols-2 grid-rows-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative flex flex-col">
                <div className="h-1/2 w-full rotate-180">
                  <PackCard data={data} steps={null} scale="place" bleed />
                </div>
                <div className="h-1/2 w-full">
                  <PackCard data={data} steps={null} scale="place" bleed />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dotted border-border/70"
                />
              </div>
            ))}
          </div>
          <CutGuides cols={2} rows={3} />
        </div>
      </section>
    )
  }

  if (scale === "tent") {
    return (
      // TENT CARDS, four to a sheet. Each flat piece is 88 x 100mm and carries
      // the face TWICE — the upper copy rotated 180 degrees — so that when it
      // is folded along the middle both sides stand upright. A guest on either
      // side of the table gets a code; a tent card with one blank face is a
      // tent card half the room cannot use.
      //
      // Portrait sheet, no rotation, no page rules. The postcard sheet spent
      // three attempts learning that lesson.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2 ${className}`}
      >
        <div className="relative h-[200mm] w-[176mm] max-w-full break-inside-avoid">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative flex flex-col">
                {/* Upper face, upside down — it comes the right way up as the
                    card is folded back over itself. */}
                <div className="h-1/2 w-full rotate-180">
                  <PackCard data={data} steps={steps} scale="tent" bleed />
                </div>
                <div className="h-1/2 w-full">
                  <PackCard data={data} steps={steps} scale="tent" bleed />
                </div>
                {/* The fold, distinguished from the cuts: a finer dotted rule,
                    and it says so. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dotted border-border/70"
                />
              </div>
            ))}
          </div>
          <CutGuides cols={2} rows={2} />
        </div>
      </section>
    )
  }

  if (scale === "a6") {
    return (
      // Four postcards, quartered — portrait cards on a portrait sheet, so
      // there is no rotation and no page-orientation rule. Every sheet in the
      // pack prints portrait in one job, which is where this started.
      <section
        className={`${SHEET} flex min-h-[277mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2 ${className}`}
      >
        <div className="relative h-[250mm] w-[180mm] max-w-full break-inside-avoid">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PackCard key={i} data={data} steps={steps} scale="a6" bleed />
            ))}
          </div>
          <CutGuides cols={2} rows={2} />
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
        <div className="relative h-[250mm] w-[180mm] max-w-full break-inside-avoid">
          <div className="grid h-full w-full grid-rows-2">
            <PackCard data={data} steps={steps} scale="a5" bleed />
            <PackCard data={data} steps={steps} scale="a5" bleed />
          </div>
          <CutGuides cols={1} rows={2} />
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
