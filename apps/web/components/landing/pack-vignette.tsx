import { PackCard } from "@/components/print-pack/pack-card"
import { Vignette } from "@/components/landing/vignette"
import {
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"

// All three sheets the pack prints, fanned (founder, 2026-08-09). It showed
// the wallet card alone, which is the smallest of the three and the one that
// reads least like a poster — the section says "an A4 poster, A5 cards and
// wallet cards" and then showed one card.
//
// These are the REAL PackCards at their real scales, so the page cannot come
// to depict a pack the printer no longer produces.
//
// FANNED, NOT IN A ROW. The three are 250, 190 and 85.6mm wide, so a row at
// true relative scale has to fit 2,000px of card into a 620px frame — the
// poster comes out at 290px and nothing is legible. Overlapping them keeps
// the relative sizes honest, which is the point: the wallet card looks tiny
// beside the poster because it IS tiny, and that is the fact the section is
// making. It is also how the pack actually looks on a table.

// Pre-scale layout, in px at 96dpi (1mm = 3.7795px):
//   A4 poster  250 x 180mm = 945 x 680   at (0, 0)
//   A5 card    190 x 125mm = 718 x 472   at (500, 300)
//   Wallet    85.6 x 54mm  = 323 x 204   at (960, 640)
// Extent 1283 x 844, which the boxes below are that multiplied by the scale.
//
// The offsets were opened up once it was on screen: each card overlaps only
// the PREVIOUS one's bottom-right corner, so all three read as distinct
// sheets. Tighter and they stack into what looks like one card photographed
// three times, which is the failure mode here — the three carry the same
// design, so only their size and their edges tell them apart.
const EXTENT_W = 1283
const EXTENT_H = 844

// .paper pins the light token values — the card forces bg-white, so without
// them a dark-mode visitor gets white ink on a white card (#535).
// .paper-screen puts the border back to the app's: .paper darkens it for ink
// that survives a domestic printer, which on a screen just outlines every row.
const SHEET = "paper paper-screen absolute origin-top-left drop-shadow-xl"

export function PackVignette() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — measured to fit rather than
          computed at runtime, matching the process overview. */}
      <div
        data-artefact-box
        className="h-[194px] w-[295px] sm:h-[279px] sm:w-[423px] lg:h-[397px] lg:w-[603px]"
      >
        <div
          className="relative origin-top-left scale-[0.23] sm:scale-[0.33] lg:scale-[0.47]"
          style={{ width: EXTENT_W, height: EXTENT_H }}
        >
          {/* A4 poster — for the door. Landscape, as printed: the design is
              rotated 90° onto a portrait sheet, so the poster reads the way
              it does once the paper is turned. */}
          <div
            className={SHEET}
            style={{ top: 0, left: 0, width: 945, height: 680 }}
          >
            <div className="h-full w-full -rotate-2">
              <PackCard
                data={DEMO_PACK_DATA}
                steps={DEMO_PACK_STEPS}
                scale="a4"
              />
            </div>
          </div>

          {/* A5 card — for the tables. Two to a sheet. */}
          <div
            className={SHEET}
            style={{ top: 300, left: 500, width: 718, height: 472 }}
          >
            <div className="h-full w-full rotate-[1.5deg]">
              <PackCard
                data={DEMO_PACK_DATA}
                steps={DEMO_PACK_STEPS}
                scale="a5"
              />
            </div>
          </div>

          {/* Wallet card — credit-card size, eight to a sheet. */}
          <div
            className={SHEET}
            style={{ top: 640, left: 960, width: 324, height: 204 }}
          >
            <div className="h-full w-full -rotate-1">
              <PackCard
                data={DEMO_PACK_DATA}
                steps={DEMO_PACK_STEPS}
                scale="wallet"
              />
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
