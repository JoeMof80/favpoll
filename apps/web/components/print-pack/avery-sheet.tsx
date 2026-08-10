import { PackCard } from "./pack-card"
import type { PackData } from "./pack-card"

// Sheets laid out to Avery UK's own die-cut stock, so print lands on the
// perforations instead of on guides you cut by hand.
//
// THEY ARE ALL LANDSCAPE, which is why they live on their own route. Two
// 120mm panels side by side is 240mm and will not fit portrait A4's 210 —
// Avery's tent and place card templates are landscape sheets. Chrome will not
// honour a per-sheet page orientation inside a mixed document (proven twice
// on the postcard sheet), so mixing these into the main pack was never an
// option: the whole document has to be landscape, and that means a second
// print job. Founder decided it was worth one.
//
// NOTHING IS DRAWN BETWEEN THE CARDS. The stock is already die-cut and
// scored, so a cut guide or a fold line would print ON a card rather than
// between them. That is the difference between these and the plain A4 sheets.

// Geometry read off Avery's Word templates. Every one of these folds, so a
// "unit" is the flat piece: two faces, the upper one inverted, which comes
// the right way up as the card is folded back over itself.
//
// The grids are centred on a 297 x 210 page, which is how Avery lay them out
// and what the founder's screenshot of L4794 shows: cells butting together,
// no gutters, even margins.
export const AVERY_SHEETS = {
  // 8 panels = 4 cards, 2 x 2 units of 120 x 90mm = 240 x 180mm.
  L4794: {
    label: "Tent cards",
    code: "L4794",
    face: "averyTent" as const,
    unit: { w: "120mm", h: "90mm" },
    grid: { cols: 2, rows: 2 },
    box: { w: "240mm", h: "180mm" },
    steps: true,
    note: "120 × 45 mm · 4 to a sheet",
  },
  // 2 panels = 1 card, 210 x 120mm.
  L4796: {
    label: "Large tent cards",
    code: "L4796",
    face: "averyTentLarge" as const,
    unit: { w: "210mm", h: "120mm" },
    grid: { cols: 1, rows: 1 },
    box: { w: "210mm", h: "120mm" },
    steps: true,
    note: "210 × 60 mm · 1 to a sheet",
  },
  // 8 panels = 4 cards, 2 x 2 units of 110 x 80mm = 220 x 160mm.
  C32253: {
    label: "Place cards",
    code: "C32253",
    face: "averyPlace" as const,
    unit: { w: "110mm", h: "80mm" },
    grid: { cols: 2, rows: 2 },
    box: { w: "220mm", h: "160mm" },
    steps: false,
    note: "110 × 40 mm · 4 to a sheet",
  },
}

export type AveryCode = keyof typeof AVERY_SHEETS

export function AverySheet({
  data,
  steps,
  code,
  className = "",
}: {
  data: PackData
  steps: string[] | null
  code: AveryCode
  className?: string
}) {
  const sheet = AVERY_SHEETS[code]
  const cardSteps = sheet.steps ? steps : null
  const count = sheet.grid.cols * sheet.grid.rows

  return (
    <section
      className={`flex min-h-[190mm] items-center justify-center rounded-lg border border-border bg-background p-6 shadow-sm print:min-h-0 print:break-inside-avoid print:rounded-none print:border-0 print:p-0 print:shadow-none ${className}`}
    >
      <div
        className="grid max-w-full break-inside-avoid"
        style={{
          width: sheet.box.w,
          height: sheet.box.h,
          // minmax(0, 1fr), NOT 1fr. A plain 1fr carries an implicit `auto`
          // minimum, so a track grows to fit content that is too big for it —
          // here the rows swelled from 90mm to 106mm and pushed the last card
          // off the page. Tailwind's grid-rows-* uses minmax(0, 1fr) for
          // exactly this reason; the inline styles have to say it too.
          gridTemplateColumns: `repeat(${sheet.grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${sheet.grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col">
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
          </div>
        ))}
      </div>
    </section>
  )
}
