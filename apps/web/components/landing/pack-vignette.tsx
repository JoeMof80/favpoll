import { PackSheet } from "@/components/print-pack/pack-sheet"
import { AverySheet } from "@/components/print-pack/avery-sheet"
import { Vignette } from "@/components/landing/vignette"
import {
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"

// The pack as it looks BEFORE it is printed — real PackSheets, shared with
// PackDocument, so the pack this page depicts and the pack the printer
// produces cannot drift apart.
//
// A FAN, NOT A ROW (founder, 2026-08-13). Laid side by side, every sheet had
// to fit the frame's width at once and each came out 127px tall — you could
// see that there were sheets, not what was on them. Overlapping buys back
// the width: four sheets take 2354px of fan instead of 3906px of row, so the
// same frame renders them half as large again.
//
// What is lost to the overlap is each sheet's right-hand edge, and that is
// the cheapest thing to lose: what distinguishes these is the COUNT and the
// GRID on each — one poster, two table cards, four folded tents, eight
// labels — and both read from the left.
//
// FOUR, chosen for range rather than completeness. One card and eight; flat
// and folded; landscape and portrait. The postcards and the place cards sit
// between these on every axis, so they are named in the bullets beside the
// vignette instead.

// A4 at 96dpi: portrait 794 x 1123px, landscape 1123 x 794.
const PORTRAIT = { w: 794, h: 1123 }
const LANDSCAPE = { w: 1123, h: 794 }

// Authored at full page size and scaled once, so the overlap is designed
// rather than whatever the flex gap happened to leave. x/y are the top-left
// of each sheet within the fan; the tilts are small and alternate, which
// reads as a stack someone has spread rather than a diagram.
// Ordered so the FOLDED sheet finishes the fan, uncovered. It is the one
// with something to notice — cards printed twice, the upper half upside
// down — and it was unreadable when it sat third with a label sheet over it.
// The three in front of it are recognisable from a sliver: one big card, two
// cards, a grid of eight.
const SHEETS = [
  { kind: "plain", id: "a4", page: LANDSCAPE, x: 0, y: 150, rot: -2.5 },
  { kind: "plain", id: "a5", page: PORTRAIT, x: 500, y: 10, rot: 1.5 },
  { kind: "avery", id: "L7418", page: PORTRAIT, x: 950, y: 30, rot: -1.5 },
  { kind: "avery", id: "L4794", page: LANDSCAPE, x: 1430, y: 190, rot: 2 },
] as const

const FAN_W = Math.max(...SHEETS.map((s) => s.x + s.page.w)) // 2553
const FAN_H = Math.max(...SHEETS.map((s) => s.y + s.page.h)) // 1153

export function PackVignette() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — measured to fit rather than
          computed at runtime, matching the process overview.
          0.115 / 0.213 / 0.2444 of 2553 x 1153 give the sizes below. */}
      <div
        data-artefact-box
        className="h-[133px] w-[294px] sm:h-[246px] sm:w-[544px] lg:h-[282px] lg:w-[624px]"
      >
        {/* .paper pins the light token values — the cards force bg-white, so
            without them a dark-mode visitor gets white ink on a white card
            (#535). .paper-screen puts the border back to the app's: .paper
            darkens it for ink that survives a domestic printer, which on a
            screen just outlines every row. */}
        <div
          className="paper paper-screen relative origin-top-left scale-[0.115] sm:scale-[0.213] lg:scale-[0.2444]"
          style={{ width: FAN_W, height: FAN_H }}
        >
          {SHEETS.map((s) => (
            <div
              key={s.id}
              className="absolute drop-shadow-xl"
              style={{
                left: s.x,
                top: s.y,
                width: s.page.w,
                transform: `rotate(${s.rot}deg)`,
              }}
            >
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
                  scale={s.id as "a4" | "a5"}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Vignette>
  )
}
