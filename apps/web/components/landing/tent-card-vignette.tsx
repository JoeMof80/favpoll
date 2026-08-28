import { PackCard } from "@/components/print-pack/pack-card"
import { Vignette } from "@/components/landing/vignette"
import {
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"
import type { PackData } from "@/components/print-pack/pack-card"

// One tent card, standing on a table (founder, 2026-08-28: "the QR code
// stationery artefact should be a tent card").
//
// NOT PackVignette, which is the whole pack fanned out — four sheets showing
// WHICH formats exist. That is the right picture for /features, where the
// pack itself is the feature. Beside copy that says "print a card for every
// table so guests can play along between courses", the reader wants the
// object on the table, not the catalogue it came from. Same correction the
// order of service made on /memorials.
//
// THE REAL PackCard at `averyTent` — Avery L4794, 120 x 45mm, four to a
// sheet — so the card standing here is the card that comes off the printer.
//
// AT AN ANGLE, AND ACTUALLY FOLDED (founder, 2026-08-28: "it doesn't work. i
// think it needs to be at an angle"). The first pass faced the card straight
// on with a 9-degree lean and a sliver of the back panel above the fold, and
// it read as a flat card with a grey bar over it — because straight on, a
// tent card and a flat card have the SAME silhouette. Nothing about the
// viewing angle said folded.
//
// So it is a real fold now: two panels sharing a top edge, each rotated away
// from it in opposite directions, making the Λ a tent card actually is. The
// whole thing then turns on rotateY, which is what does the work — from three
// quarters the ridge has length, the near panel foreshortens, and the far
// panel shows as the sliver of card stock behind it. That silhouette belongs
// to nothing but a folded card.
//
// NO PAINTED SHADING ANYWHERE ON IT, top or bottom (founder, 2026-08-28:
// "maybe remove the shadow altogether", then "the shadow at the top is
// always weird"). Both were the same mistake in two places: shading added to
// SAY something the geometry already says.
//
// The crease went first. A hairline and a gradient falling off under the fold
// were meant to read as a fold — but the fold is already the ridge where two
// panels meet at 40 degrees, and the gradient only darkened the top of a
// printed face, which no real card does. It had survived every version, which
// is how it earned "always".
//
// NO SHADOW UNDERNEATH EITHER.
// Right, and the reason is worth keeping. Three shadows were tried — a pair
// of 2D ellipses, then those turned with the card, then a proper ground plane
// laid flat inside the 3D scene with rotateX(90deg) — and each was wrong in a
// new way: the ellipses floated free of both bottom edges, and the ground
// plane, seen almost edge-on through the scene's own rotation, stretched off
// to the corner as a grey streak.
//
// The common cause is that THERE IS NO TABLE. A cast shadow is a statement
// about a surface, and this vignette has no surface for it to be about — the
// pack fan, the keepsake and the order of service all sit on nothing too,
// they just do not claim otherwise. Without one the card reads as an object
// on the page, which is what every other artefact here reads as. The drop
// shadows those carry are the CSS kind that hugs the paper's own edge, not a
// cast shadow implying a floor.
//
// The far panel is BLANK stock, not a second PackCard. Both faces of a real
// tent card are printed — that is the point, a guest either side of the table
// gets a code — but the far one faces AWAY, so what a viewer in front of it
// sees is the back of the paper. Printing it here would show the design
// reversed and hovering behind the card, which is the sort of detail that
// makes an image quietly wrong.

// 120 x 45mm at 96dpi.
const CARD_W = 453
const CARD_H = 170

/** Half the fold's opening: each panel leans this far off vertical.
 *
 * SIGNS MATTER AND I HAD THEM BACKWARDS. About a TOP origin, a positive
 * rotateX swings the bottom edge TOWARD the viewer. So the printed near
 * panel takes +SPLAY and the blank far panel -SPLAY. Inverted, the blank
 * panel leant forward and painted over the printed one — the card rendered
 * as a white slab with the tent's silhouette peeking out behind it. */
const SPLAY = 17
/** The turn. Everything reads as a fold at this angle and as a card at 0. */
const TURN = 40

/**
 * Looking DOWN on it, which was the other half of "looks weird".
 *
 * The scene was rotateX(+6), and about the scene's own centre a positive
 * rotateX brings the bottom toward the viewer — so we were looking UP at the
 * card from somewhere below the tabletop. Nobody sees a table card from
 * there, and the eye knows it even when it cannot name it: the object read as
 * a plank tilting in mid-air rather than as paper sitting on a surface.
 *
 * Negative puts the eye above the card, where a guest's actually is. It also
 * earns the ridge: from above, the fold has a visible top surface, which is
 * the single most tent-card-shaped thing in the picture.
 */
const TILT = 5

export function TentCardVignette({
  data = DEMO_PACK_DATA,
  steps = DEMO_PACK_STEPS,
}: {
  data?: PackData
  steps?: typeof DEMO_PACK_STEPS
} = {}) {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="h-[151px] w-[294px] sm:h-[226px] sm:w-[440px] lg:h-[257px] lg:w-[500px]"
      >
        {/* Authored at the card's real size and scaled to the column, the way
            every printed artefact on this site is. */}
        <div
          className="relative origin-top-left scale-[0.649] sm:scale-[0.971] lg:scale-[1.104]"
          style={{ width: CARD_W, height: CARD_H + 63, perspective: 900 }}
        >
          <div
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(-${TILT}deg) rotateY(-${TURN}deg)`,
            }}
          >
            {/* THE FAR PANEL — plain stock, leaning away from the fold. Its
                own shading rather than a filter: `paper` pins the light
                tokens, so a brightness filter would fight them. */}
            <div
              className="paper paper-screen absolute inset-0 bg-background"
              style={{
                transformOrigin: "top center",
                transform: `rotateX(-${SPLAY}deg)`,
                boxShadow: "inset 0 0 0 100vmax rgb(0 0 0 / 0.11)",
              }}
            />

            {/* THE NEAR PANEL — the printed face, leaning toward the viewer.
                Same origin, opposite rotation: the two share the top edge and
                that shared edge IS the fold. */}
            <div
              className="paper paper-screen relative overflow-hidden"
              style={{
                width: CARD_W,
                height: CARD_H,
                transformOrigin: "top center",
                transform: `rotateX(${SPLAY}deg)`,
              }}
            >
              <PackCard data={data} steps={steps} scale="averyTent" bleed />
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
