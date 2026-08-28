"use client"

import { BrandedQR } from "@/components/branded-qr"
import { FavpollLogo } from "@/components/favpoll-logo"
import { Vignette } from "@/components/landing/vignette"
import {
  MEMORIAL_PACK_DATA,
  DEMO_QR_URL,
} from "@/components/landing/demo-fixture"

// The corner of an order of service, with a favpoll code printed on it.
//
// WHY THIS EXISTS (founder, 2026-08-27). The idea beside it is "QR-coded
// order of service", and what stood here was PackVignette — a fan of A4/A5
// sheets and two Avery label sheets. The words described the FAMILY'S paper
// and the picture showed FAVPOLL'S, which was the one outright mismatch in
// the Ideas section.
//
// NOT THE LABEL TEMPLATE EITHER, which was the second attempt: the real
// PackCard at `l7160`. Faithful, and wrong for this — that face deliberately
// drops the steps ("38mm and cannot hold the steps"), so with steps null it
// renders a QR bottom-left with the whole right half of its body empty. A
// blank column reads as a layout fault to anyone who has not read the code,
// and it put an Avery-shaped sticker on a page the funeral director set.
//
// A MINIMAL BLOCK INSTEAD (founder, 2026-08-27, with a reference): who it is
// for, what the topic is, the code, the mark. Nothing else. This is not a
// template favpoll ships — it is what a family or their printer would set
// into the page they already have, which is the honest picture, since favpoll
// has no order-of-service template and never will. The code itself is what
// gets handed over (see qr-export: "favpoll will never template every kind of
// stationery").
//
// THE EDGES ARE MASKED, NOT OVERLAID. An earlier pass laid a gradient from
// the paper's own colour over the paper and it dissolved NOTHING: the sheet
// was still there underneath with a crisp edge where its box ended, so the
// fade was invisible and the "this is a fragment" reading never arrived. A
// mask removes the paper itself, so the page genuinely thins out into the
// frame. Left and top fade; RIGHT AND BOTTOM STAY CRISP, because those two
// edges are the corner — a fragment that dissolves on all four sides is a
// detail shot, not a corner.
//
// Words and data are MEMORIAL_PACK_DATA — Belinda, favourite colour, Marie
// Curie — so this cannot drift from the reveal, the display and the keepsake
// beside it. `Favourite <topic>` is composed the way the product composes it
// everywhere else (PollHeading, the CSV export, the pack card).

const PREFIX = MEMORIAL_PACK_DATA.prefix
const NAME = MEMORIAL_PACK_DATA.name
const TOPIC_LABEL = `Favourite ${MEMORIAL_PACK_DATA.topicTitle ?? ""}`

// Authored at the size it renders at on a large screen and scaled DOWN for
// small ones — the reverse of the keepsake, which authors at full A4 and
// scales to a half. That one shows a whole sheet; this has to be read.
const SHEET_W = 500
const SHEET_H = 420

// THE TORN EDGE (founder, 2026-08-27: "i don't think the fade works. Can we
// give the edge a wave or tear effect instead to suggest truncation?").
//
// The fade never earned its keep and went through three versions failing in
// three different ways. As an OVERLAY it dissolved nothing — the paper was
// still there underneath with a crisp edge where its box ended. As a MASK it
// dissolved the paper but BANDED, six or seven visible steps, because paper
// white and the frame's tint are a few values apart and 8-bit alpha cannot
// cross that smoothly over a long ramp. Shortening the ramp fixed the banding
// and cost the effect its meaning: a 14% ramp is a soft edge, and a soft edge
// is not truncation, it is a vignette.
//
// A TEAR SAYS IT OUTRIGHT. It is also strictly better as a technique: a
// polygon is a hard-edged shape, so there is no alpha ramp to band, nothing
// to tune against the background, and it survives any backdrop the section is
// ever given.
//
// Right and bottom stay STRAIGHT — those are the page's real edges, and the
// corner they make is what says "corner of a page". Torn on all four sides
// would be a scrap.
//
// SHALLOW AND DENSE, which took three passes to settle. The first tear ran
// ~20px deep over eighteen points a side and rendered as a SAWTOOTH — big
// even triangles that read as a decorative border, a shape somebody chose,
// rather than as damage. Doubling the point count and halving the depth is
// what moved it from pattern to tear; a further ~30% off the depth (top
// 31-40, left 36-47) is where it settled. Paper tears in short irregular
// runs, and the shallower it gets the more it reads as fibre giving way
// rather than as an edge somebody cut.
//
// Irregular on purpose, and it is the other half of the same point: the
// spacing between points and the depth of each excursion both vary, and
// neither repeats. Any periodicity at all reads as a perforation.
//
// Coordinates are in the sheet's own 500 x 420 space: clip-path resolves
// before the transform, so one set of points serves all three scales.
const TORN_EDGE = `polygon(
  43px 40px, 57px 36px, 68px 38px, 86px 33px, 97px 36px, 112px 34px,
  131px 37px, 144px 32px, 152px 35px, 171px 31px, 189px 36px, 198px 34px,
  218px 39px, 231px 34px, 243px 36px, 265px 32px, 277px 36px, 292px 34px,
  310px 38px, 325px 33px, 334px 36px, 356px 31px, 369px 35px, 383px 33px,
  401px 37px, 417px 34px, 428px 36px, 449px 32px, 463px 36px, 478px 34px,
  492px 37px, 500px 34px,
  500px 420px,
  38px 420px, 42px 402px, 40px 384px, 47px 366px, 38px 349px, 43px 330px,
  39px 312px, 45px 293px, 37px 276px, 40px 257px, 47px 240px, 38px 222px,
  44px 203px, 36px 187px, 40px 168px, 46px 150px, 37px 134px, 43px 113px,
  38px 97px, 45px 78px, 39px 62px
)`

export function OrderOfServiceVignette() {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="h-[247px] w-[294px] sm:h-[370px] sm:w-[440px] lg:h-[420px] lg:w-[500px]"
      >
        {/* THE SHADOW LIVES OUT HERE, and it has to (founder, 2026-08-27:
            "I don't see a drop shadow"). A box-shadow ON the clipped element
            is INVISIBLE: the clip is the border box or tighter, so everything
            painted outside it — which is the entire shadow — is cut away. Two
            passes of shadow-xl rendered nothing at all for that reason.
            A `filter: drop-shadow` on an unclipped WRAPPER composites the
            child's already-clipped output and casts from THAT, so the shadow
            traces the torn edge rather than outlining a rectangle the paper
            no longer fills. It is what makes the tear read as paper with a
            thickness instead of a shape cut out of the frame. */}
        <div
          className="origin-top-left scale-[0.588] drop-shadow-lg sm:scale-[0.88] lg:scale-100"
          style={{ width: SHEET_W, height: SHEET_H }}
        >
          {/* .paper pins the light token values and .paper-screen keeps the
              app's border weight — the pairing every printed artefact on this
              site uses, for the reason that class exists: ink on paper must
              not follow the viewer's theme (#535). */}
          <div
            className="paper paper-screen relative h-full w-full bg-background"
            style={{ clipPath: TORN_EDGE }}
          >
            {/* THE BLOCK, FRAMED AND IN THE CORNER (founder, 2026-08-27). Both
              halves of that matter. The frame is what marks it as an insert
              rather than a stray paragraph of the page — the family's printer
              set a box, the way a donations panel has always been a box. And
              NO SHADOW ON IT (founder, 2026-08-27). One was added when the
              PAPER needed one and it landed on the wrong element: printed
              ink does not float above the page it is printed on, so a lifted
              panel says "sticker" — which is the very reading the label
              template was dropped for. The sheet keeps its drop shadow; the
              block is part of the sheet.

              the corner is where it belongs: this is the page's smallest
              possible ask, tucked out of the way of the service, not a panel
              taking the middle of the sheet. It was centred and half the page
              tall before, which claimed the page rather than sitting on it.

              Anchored bottom-right so it holds the corner the mask leaves
              crisp — the artefact's subject sits in the one region that is
              unambiguously a page corner. */}
            <div className="absolute right-8 bottom-8 w-[152px] rounded-md border border-border px-3 pt-2.5 pb-3 text-center">
              <p className="text-[8px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {PREFIX}
              </p>
              <p className="mt-0.5 text-[13px] leading-tight font-medium text-foreground">
                {NAME}
              </p>
              <p className="mt-2 border-t border-b border-border py-1.5 text-[8px] font-medium tracking-[0.14em] text-primary uppercase">
                {TOPIC_LABEL}
              </p>
              <div className="mt-2.5 flex flex-col items-center gap-2">
                {/* Illustrative, not scannable: 118px natural falls to ~69px on
                  a phone, under the module floor a 33x33 code needs. Nobody
                  should be told to scan this one. */}
                <BrandedQR
                  value={DEMO_QR_URL}
                  size={118}
                  aria-label="favpoll QR code"
                />
                {/* SCALED, not just set in a smaller type size (founder,
                  2026-08-27: "the favpoll branding is too big for an order of
                  service. it should be minimal"). FavpollLogo's mark is a
                  hardcoded 24 x 22 svg, so className moves the wordmark and
                  leaves the heart at full size — the lockup gets more
                  mark-heavy the smaller you set it, which is the opposite of
                  what a footnote on someone's order of service wants. A
                  transform takes both together. The fixed-height wrapper
                  reclaims the space the untransformed box would still
                  occupy. */}
                <div className="flex h-3.5 items-center justify-center">
                  <FavpollLogo className="origin-center scale-[0.58] text-[11px] font-medium" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
