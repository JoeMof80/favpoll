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
                boxShadow: "inset 0 0 0 100vmax rgb(0 0 0 / 0.07)",
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
              {/* The crease. A hairline and the light falling off just under
                  it — a printed border along the top of a folded card is the
                  one line that is definitely not there. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-foreground/20" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-foreground/10 to-transparent" />
            </div>
          </div>

          {/* Contact shadow, cast flat on the table and turned with the card.
              Tight and dark where the paper meets the surface, spreading as
              it leaves — the thing that makes an object sit on a table rather
              than float above one. */}
          <div
            className="pointer-events-none absolute rounded-[50%] bg-zinc-950/40 blur-[6px]"
            style={{
              left: 40,
              top: CARD_H * 0.965,
              width: CARD_W - 80,
              height: 14,
              transform: `rotateY(-${TURN}deg)`,
            }}
          />
          <div
            className="pointer-events-none absolute rounded-[50%] bg-zinc-950/18 blur-2xl"
            style={{
              left: 0,
              top: CARD_H * 0.95,
              width: CARD_W,
              height: 34,
            }}
          />
        </div>
      </div>
    </Vignette>
  )
}
