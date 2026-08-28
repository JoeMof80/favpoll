import { PackSheet } from "@/components/print-pack/pack-sheet"
import { Vignette } from "@/components/landing/vignette"
import {
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"
import type { PackData } from "@/components/print-pack/pack-card"

// One A4 poster, whole — the fundraiser register's paper artefact.
//
// THE REGISTER PICKED THE OBJECT. A memorial's paper is an order of service
// and a celebration's is a place name, because both are things already being
// printed for a room. A sponsored event has no such document: the runner is
// not hosting anything, and the people sponsoring them are mostly not in the
// same building. What a fundraiser has always had is the sheet on the wall —
// the sponsor form in the staffroom, the noticeboard at the club, the poster
// by the till — so that is what this shows.
//
// NOT PackVignette, for the third time (see FoldedCardVignette and the order
// of service). The fan is the catalogue: four sheets answering "which
// formats exist", which is the question /features asks. Beside copy about
// putting a poster up, the reader wants the poster.
//
// LANDSCAPE, because the design is. The a4 face is drawn landscape and
// rotated 90 degrees onto a portrait sheet at print time (2026-08-02), so
// 1123 x 794 is the sheet as it reads once it is on the wall, and PackVignette
// already renders it at exactly these dimensions.
//
// NO CUT GUIDES. PackSheet draws a dashed perimeter by default, which on the
// pack fan is correct — those sheets are cut, and the guide is the trim line.
// A poster is not cut: the sheet IS the poster, so the only thing the dashes
// would do here is put a "cut along here" instruction round something nobody
// cuts.
//
// NO PIN, NO TAPE, NO WALL. The temptation on a poster is to say "this is up
// somewhere" with a drawing pin or a corner of tape, and it is the same
// mistake the tent card's shadow was: painting a claim about a surface that
// is not in the picture. The sheet carries its own drop shadow, hugging its
// own edge, like every other artefact on these pages.

// A4 at 96dpi, landscape — the pack vignette's own measurement.
const LANDSCAPE = { w: 1123, h: 794 }

// 0.2618 / 0.4844 / 0.5556 of 1123 x 794 give the boxes below, and the widths
// are PackVignette's so the two sheets sit at the same size across the site.
const POSTER_SCALE = "scale-[0.2618] sm:scale-[0.4844] lg:scale-[0.5556]"

export function PosterVignette({
  data = DEMO_PACK_DATA,
  steps = DEMO_PACK_STEPS,
}: {
  data?: PackData
  steps?: typeof DEMO_PACK_STEPS
} = {}) {
  return (
    <Vignette className="flex justify-center">
      {/* The box reserves the SCALED size — a transform does not change the
          layout box, so without it a 794px sheet would sit here at its
          natural height and push the rest of the row down. */}
      <div
        data-artefact-box
        className="h-[208px] w-[294px] sm:h-[385px] sm:w-[544px] lg:h-[441px] lg:w-[624px]"
      >
        {/* .paper pins the light token values — the card forces bg-white, so
            without them a dark-mode visitor gets white ink on a white sheet
            (#535). .paper-screen puts the border back to the app's weight. */}
        <div
          className={`paper paper-screen origin-top-left drop-shadow-xl ${POSTER_SCALE}`}
          style={{ width: LANDSCAPE.w, height: LANDSCAPE.h }}
        >
          <PackSheet data={data} steps={steps} scale="a4" guides={false} />
        </div>
      </div>
    </Vignette>
  )
}
