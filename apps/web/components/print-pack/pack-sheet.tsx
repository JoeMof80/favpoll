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
// Which way up each plain sheet prints. The poster and the postcards are
// landscape because their cards are — and since the pack sets @page from the
// sheet being printed, that no longer costs a second route or a rotation.
export const PLAIN_ORIENTATION = {
  a4: "landscape",
  a5: "portrait",
  a6: "landscape",
} as const

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
function CutGuides({ cols = 1, rows = 1 }: { cols?: number; rows?: number }) {
  return (
    // The perimeter as well as the divisions — the cards do not reach the
    // paper's edge, so the outside needs trimming too. A sheet with one card
    // on it (the poster) gets the perimeter and nothing else.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 border border-dashed border-border"
    >
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
  guides = true,
  className = "",
}: {
  data: PackData
  steps: string[] | null
  scale: keyof typeof SCALE
  /** Dashed cut lines, for plain paper. Toggled for the whole pack. */
  guides?: boolean
  /** Sheet-level extras from the host — break-after-page, print:hidden. */
  className?: string
}) {
  if (scale === "a4") {
    return (
      // The poster, on a LANDSCAPE page (founder, 2026-08-10). It used to be a
      // landscape design rotated 90 degrees onto a portrait sheet, with a
      // half-size/scale(2) sandwich to stop print fragmentation splitting the
      // rotated box across two pages. None of that is needed once the page
      // itself can be landscape — the design simply sits on it.
      <section
        className={`${SHEET} flex min-h-[150mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-0 ${className}`}
      >
        <div className="relative h-[180mm] w-[250mm] max-w-full break-inside-avoid">
          <PackCard data={data} steps={steps} scale="a4" bleed />
          {guides && <CutGuides />}
        </div>
      </section>
    )
  }

  if (scale === "a6") {
    return (
      // Four postcards, quartered, on a LANDSCAPE page — the cards are
      // landscape now, and two across is 277mm, which is a landscape A4's
      // printable width and not a portrait one's.
      <section
        className={`${SHEET} flex min-h-[150mm] items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-0 ${className}`}
      >
        <div className="relative h-[190mm] w-[277mm] max-w-full break-inside-avoid">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PackCard key={i} data={data} steps={steps} scale="a6" bleed />
            ))}
          </div>
          {guides && <CutGuides cols={2} rows={2} />}
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
          {guides && <CutGuides cols={1} rows={2} />}
        </div>
      </section>
    )
  }

  // The wallet-card sheet was here. It is gone (founder, 2026-08-10): L7418
  // is the same card at 86 x 55, eight to a sheet, and with cut lines turned
  // on it IS this sheet — printed on plain card instead of label stock. One
  // layout per format, the same call made for the tent and place cards.
  return null
}
