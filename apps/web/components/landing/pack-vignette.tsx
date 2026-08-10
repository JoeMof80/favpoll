import { PackSheet } from "@/components/print-pack/pack-sheet"
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
const SHEET_W = 794
const SHEET_H = 1047
const GUTTER = 24
const SHEETS = ["a4", "a5", "a6", "tent", "wallet"] as const
const ROW_W = SHEET_W * SHEETS.length + GUTTER * (SHEETS.length - 1)

export function PackVignette() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — measured to fit rather than
          computed at runtime, matching the process overview.
          0.12 / 0.22 / 0.255 give 294, 538 and 624 wide. */}
      <div
        data-artefact-box
        className="h-[76px] w-[293px] sm:h-[140px] sm:w-[541px] lg:h-[161px] lg:w-[622px]"
      >
        {/* .paper pins the light token values — the cards force bg-white, so
            without them a dark-mode visitor gets white ink on a white card
            (#535). .paper-screen puts the border back to the app's: .paper
            darkens it for ink that survives a domestic printer, which on a
            screen just outlines every row. */}
        <div
          className="paper paper-screen flex origin-top-left scale-[0.072] gap-6 sm:scale-[0.133] lg:scale-[0.153]"
          style={{ width: ROW_W, height: SHEET_H }}
        >
          {SHEETS.map((scale) => (
            <div key={scale} style={{ width: SHEET_W }}>
              <PackSheet
                data={DEMO_PACK_DATA}
                steps={DEMO_PACK_STEPS}
                scale={scale}
              />
            </div>
          ))}
        </div>
      </div>
    </Vignette>
  )
}
