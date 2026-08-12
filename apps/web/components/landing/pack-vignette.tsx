import { PackSheet } from "@/components/print-pack/pack-sheet"
import { AverySheet } from "@/components/print-pack/avery-sheet"
import { Vignette } from "@/components/landing/vignette"
import {
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"

// The pack as it looks BEFORE it is printed: three sheets of A4, carrying
// one poster, two table cards and eight wallet cards (founder, 2026-08-09).
//
// It showed three loose cards fanned on a table, which got the three SIZES
// across but not the thing an organiser actually receives. "Eight wallet
// cards to a sheet" is a sentence in the lead; a sheet with eight cards
// ruled on it is the same fact, already understood.
//
// These are the REAL PackSheets, shared with PackDocument, so the pack this
// page depicts and the pack the printer produces cannot drift apart.

// An A4 sheet is 210mm wide and the pack's sheets are 277mm of usable print
// height — 794 x 1047px at 96dpi. FIVE in a row with 24px gutters is
// 4066 x 1047, which the boxes below are that multiplied by the scale.
// The A6 postcard and tent sheets joined them (2026-08-09/10) and the scale dropped to
// suit; the sheets get small, but what distinguishes them is the COUNT on
// each — 1, 2, 4, 8 — and a count survives shrinking better than type does.
//
// SIDE BY SIDE, not fanned. Overlapping them would hide the right-hand
// column of the wallet sheet and the lower of the two A5 cards, which is
// precisely what distinguishes the three. All three sheets are the same
// size here, so there is no size relationship to preserve — only a layout
// one, and layout has to be seen whole.
// A4 at 96dpi: portrait 794 x 1123px, landscape 1123 x 794. The sheets are
// true pages now — each renders at the size it prints — so the row mixes both
// orientations and is centred on the tallest.
//
// Four of them, portrait and landscape alternating, is 3906px wide: the
// poster (landscape), the A5 pair (portrait), the postcards (landscape) and
// the wallet-card-and-label sheet (portrait). That is the range; the tent and
// place cards are named in the bullets beside it.
const PORTRAIT = { w: 794, h: 1123 }
const LANDSCAPE = { w: 1123, h: 794 }
const GUTTER = 24

const SHEETS = [
  { kind: "plain", id: "a4", page: LANDSCAPE },
  { kind: "plain", id: "a5", page: PORTRAIT },
  { kind: "plain", id: "a6", page: LANDSCAPE },
  { kind: "avery", id: "L7418", page: PORTRAIT },
] as const

const ROW_W =
  SHEETS.reduce((n, s) => n + s.page.w, 0) + GUTTER * (SHEETS.length - 1)
const ROW_H = Math.max(...SHEETS.map((s) => s.page.h))

export function PackVignette() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — measured to fit rather than
          computed at runtime, matching the process overview.
          0.12 / 0.22 / 0.255 give 294, 538 and 624 wide. */}
      <div
        data-artefact-box
        className="h-[84px] w-[293px] sm:h-[156px] sm:w-[543px] lg:h-[180px] lg:w-[625px]"
      >
        {/* .paper pins the light token values — the cards force bg-white, so
            without them a dark-mode visitor gets white ink on a white card
            (#535). .paper-screen puts the border back to the app's: .paper
            darkens it for ink that survives a domestic printer, which on a
            screen just outlines every row. */}
        <div
          className="paper paper-screen flex origin-top-left scale-[0.075] items-center gap-6 sm:scale-[0.139] lg:scale-[0.16]"
          style={{ width: ROW_W, height: ROW_H }}
        >
          {SHEETS.map((s) => (
            <div key={s.id} style={{ width: s.page.w }}>
              {s.kind === "avery" ? (
                <AverySheet
                  data={DEMO_PACK_DATA}
                  steps={DEMO_PACK_STEPS}
                  code={s.id}
                  guides
                />
              ) : (
                <PackSheet
                  data={DEMO_PACK_DATA}
                  steps={DEMO_PACK_STEPS}
                  scale={s.id as "a4" | "a5" | "a6"}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Vignette>
  )
}
