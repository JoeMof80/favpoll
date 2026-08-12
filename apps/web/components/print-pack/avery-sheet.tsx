import { PackCard } from "./pack-card"
import { pageClasses } from "./pack-sheet"
import type { PackData } from "./pack-card"

// Sheets laid out to Avery UK's own stock, so print lands on the die cuts
// rather than on guides you cut by hand.
//
// GUIDES ARE A TOGGLE, not a property of the sheet (founder, 2026-08-10).
// These are perfectly good plain-paper layouts — they are just Avery's
// dimensions — so someone without the stock gets dashed lines and cuts along
// them. That is what let the near-identical plain tent (88 x 50) and place
// (88 x 40) layouts be deleted: one layout per format, guides optional.
//
// ORIENTATION IS PER SHEET. The tent and place formats are landscape, because
// two 120mm panels side by side is 240mm and portrait A4 gives you 210. The
// labels and business cards are portrait. The pack sets @page from whichever
// sheet is being printed — see PackDocument.

export type AverySheetDef = {
  label: string
  code: string
  note: string
  face: "averyTent" | "averyTentLarge" | "averyPlace" | "l7418" | "l7160"
  orientation: "portrait" | "landscape"
  /** Folded formats carry the face twice, the upper copy inverted. */
  folded: boolean
  grid: { cols: number; rows: number }
  box: { w: string; h: string }
  steps: boolean
}

// Geometry read off Avery's Word templates plus the founder's screenshot of
// L4794 open in Pages: cells butting together, no gutters, centred.
//
// For folded formats the grid counts CARDS and each cell holds two faces —
// which is what reconciles Avery's template pages (panels: 8, 2, 8) with
// their product pages (cards: 4, 1, 4).
export const AVERY_SHEETS: Record<string, AverySheetDef> = {
  L7418: {
    // Two uses, one layout: cut lines on plain card and it is the wallet-card
    // sheet; cut lines off on L7418 stock and it is a sheet of labels.
    label: "Wallet cards & labels",
    code: "L7418",
    note: "86 × 55 mm · 8 to a sheet",
    face: "l7418",
    orientation: "portrait",
    folded: false,
    grid: { cols: 2, rows: 4 },
    box: { w: "172mm", h: "220mm" },
    steps: true,
  },
  L7160: {
    label: "Small labels",
    code: "L7160",
    note: "63.5 × 38.1 mm · 21 to a sheet · self-adhesive",
    face: "l7160",
    orientation: "portrait",
    folded: false,
    grid: { cols: 3, rows: 7 },
    box: { w: "190.5mm", h: "266.7mm" },
    steps: false,
  },
  L4794: {
    label: "Tent cards",
    code: "L4794",
    note: "120 × 45 mm · 4 to a sheet · folded",
    face: "averyTent",
    orientation: "landscape",
    folded: true,
    grid: { cols: 2, rows: 2 },
    box: { w: "240mm", h: "180mm" },
    steps: true,
  },
  L4796: {
    label: "Large tent cards",
    code: "L4796",
    note: "210 × 60 mm · 1 to a sheet · folded",
    face: "averyTentLarge",
    orientation: "landscape",
    folded: true,
    grid: { cols: 1, rows: 1 },
    box: { w: "210mm", h: "120mm" },
    steps: true,
  },
  C32253: {
    label: "Place cards",
    code: "C32253",
    note: "110 × 40 mm · 4 to a sheet · folded",
    face: "averyPlace",
    orientation: "landscape",
    folded: true,
    grid: { cols: 2, rows: 2 },
    box: { w: "220mm", h: "160mm" },
    steps: false,
  },
}

export type AveryCode = keyof typeof AVERY_SHEETS

export function AverySheet({
  data,
  steps,
  code,
  guides,
  className = "",
}: {
  data: PackData
  steps: string[] | null
  code: AveryCode
  /** Dashed cut lines, for plain paper. Off when printing on the real stock. */
  guides: boolean
  className?: string
}) {
  const sheet = AVERY_SHEETS[code]
  const cardSteps = sheet.steps ? steps : null
  const count = sheet.grid.cols * sheet.grid.rows

  return (
    <section
      // A page, not a box round the cards — see pageClasses. Avery centre
      // their grids, so a sheet that shrank to its content put every card a
      // few mm off the die cut.
      className={`${pageClasses(sheet.orientation)} mx-auto flex items-center justify-center rounded-lg border border-border bg-background shadow-sm print:break-inside-avoid print:rounded-none print:border-0 print:shadow-none ${className}`}
    >
      <div
        className="relative grid max-w-full break-inside-avoid"
        style={{
          width: sheet.box.w,
          height: sheet.box.h,
          // minmax(0, 1fr), NOT 1fr. A plain 1fr carries an implicit `auto`
          // minimum, so a track grows to fit content too big for it — rows
          // swelled from 90mm to 106mm and pushed the last card off the page.
          // Tailwind's grid-rows-* uses minmax(0, 1fr) for exactly this
          // reason; inline styles have to say it too.
          gridTemplateColumns: `repeat(${sheet.grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${sheet.grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: count }).map((_, i) =>
          sheet.folded ? (
            <div key={i} className="flex flex-col">
              {/* Upper face inverted — it comes the right way up as the card
                  is folded back over itself, so both sides of a tent card
                  stand upright and a guest either side of a table gets a
                  code. */}
              <div className="h-1/2 w-full rotate-180">
                <PackCard
                  data={data}
                  steps={cardSteps}
                  scale={sheet.face}
                  bleed
                />
              </div>
              <div className="h-1/2 w-full">
                <PackCard
                  data={data}
                  steps={cardSteps}
                  scale={sheet.face}
                  bleed
                />
              </div>
              {guides && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 border-t border-dotted border-border/70"
                  style={{ top: "50%" }}
                />
              )}
            </div>
          ) : (
            <PackCard
              key={i}
              data={data}
              steps={cardSteps}
              scale={sheet.face}
              bleed
            />
          )
        )}

        {/* Cut lines on the grid's own boundaries, so they are the same lines
            the die cut would follow.
            THE PERIMETER TOO, not only the divisions between cards: the grid
            does not reach the paper's edge, so the outside needs trimming as
            much as the middle needs dividing. */}
        {guides && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 border border-dashed border-border"
          >
            {Array.from({ length: sheet.grid.rows - 1 }).map((_, i) => (
              <div
                key={`r${i}`}
                className="absolute inset-x-0 border-t border-dashed border-border"
                style={{ top: `${((i + 1) / sheet.grid.rows) * 100}%` }}
              />
            ))}
            {Array.from({ length: sheet.grid.cols - 1 }).map((_, i) => (
              <div
                key={`c${i}`}
                className="absolute inset-y-0 border-l border-dashed border-border"
                style={{ left: `${((i + 1) / sheet.grid.cols) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
