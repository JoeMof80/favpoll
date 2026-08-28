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
// order of service made on /memorials: the copy named one artefact and the
// picture showed the stationery range.
//
// THE REAL PackCard at `averyTent` — Avery L4794, 120 x 45mm, four to a
// sheet — so the card standing here is the card that comes off the printer.
//
// STANDING, NOT LYING FLAT, and that is the whole reason a tent card is the
// right format for a party: it faces a guest without anyone having to pick it
// up. Three cheap cues do it, and none of them draws a 3D card:
//   · the FOLD as the top edge, with the far panel's sliver above it
//   · a slight perspective, so the face leans away at the top
//   · a contact shadow beneath, tight and dark, where card meets table
// A drawn isometric card would be a lookalike; this is the real face with
// light on it.

// 120 x 45mm at 96dpi.
const CARD_W = 453
const CARD_H = 170

/** How much of the folded-over back panel shows above the near face. */
const FOLD = 9

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
        className="h-[152px] w-[294px] sm:h-[227px] sm:w-[440px] lg:h-[258px] lg:w-[500px]"
      >
        {/* Authored at the card's real size and scaled to the column, the
            way every printed artefact on this site is. */}
        <div
          className="relative origin-top-left scale-[0.649] sm:scale-[0.971] lg:scale-[1.104]"
          style={{ width: CARD_W, height: FOLD + CARD_H + 40 }}
        >
          {/* The far panel — only its top edge shows past the fold, which is
              what you actually see of a tent card's back from in front.
              INSET on both sides and DARKER: it is behind, and further from
              the light. It sits above the near face rather than under it,
              which the first pass got wrong — the sliver was at top 0 and so
              was the face, so the face covered the one cue that says this
              card is folded rather than propped. */}
          <div
            className="paper paper-screen absolute bg-background"
            style={{
              left: 14,
              top: 0,
              width: CARD_W - 28,
              height: FOLD,
              filter: "brightness(0.9)",
            }}
          />

          {/* The near face, leaning away at the top, and starting BELOW the
              fold so the far edge stays visible. perspective on the wrapper
              rather than the card, so the fold stays a straight horizontal
              edge and only the face tilts. */}
          <div
            className="absolute inset-x-0"
            style={{ top: FOLD, perspective: 900 }}
          >
            <div
              className="paper paper-screen relative origin-top overflow-hidden"
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: "rotateX(11deg)",
              }}
            >
              <PackCard data={data} steps={steps} scale="averyTent" bleed />
              {/* The fold: a crease, not a border. A hairline plus the light
                  falling off just under it — a printed border along the top
                  of a folded card is the one line that is definitely not
                  there. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-foreground/15" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-foreground/8 to-transparent" />
            </div>
          </div>

          {/* Contact shadow. Tight and dark where the card meets the table,
              spreading as it leaves — the thing that makes an object sit on
              a surface rather than float above one. */}
          <div
            className="pointer-events-none absolute rounded-[50%] bg-zinc-950/35 blur-[6px]"
            style={{
              left: 24,
              top: CARD_H + 2,
              width: CARD_W - 48,
              height: 10,
            }}
          />
          <div
            className="pointer-events-none absolute rounded-[50%] bg-zinc-950/15 blur-2xl"
            style={{
              left: 0,
              top: FOLD + CARD_H,
              width: CARD_W,
              height: 30,
            }}
          />
        </div>
      </div>
    </Vignette>
  )
}
