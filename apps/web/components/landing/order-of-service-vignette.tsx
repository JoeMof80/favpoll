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

// `black` and `transparent`, never a hex: a mask uses only the alpha channel,
// and the colour guard rightly refuses hardcoded hexes anywhere in the app.
// Two gradients composited to an intersection — one axis each, so the corner
// is the region both leave opaque.
//
// SHORT RAMPS. The first pass faded over 26% and 24% and BANDED visibly —
// six or seven vertical steps down the left edge. Paper white and the
// frame's tint are only a few values apart, so a long ramp spends most of
// its length crossing a delta too small for 8-bit alpha to render smoothly
// and the steps become the picture. Over 14% the same delta is crossed in a
// quarter of the distance and there is nothing left to band.
const PAPER_MASK =
  "linear-gradient(to right, transparent 0%, black 14%), linear-gradient(to bottom, transparent 0%, black 13%)"

export function OrderOfServiceVignette() {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="h-[247px] w-[294px] sm:h-[370px] sm:w-[440px] lg:h-[420px] lg:w-[500px]"
      >
        {/* .paper pins the light token values and .paper-screen keeps the
            app's border weight — the pairing every printed artefact on this
            site uses, for the reason that class exists: ink on paper must not
            follow the viewer's theme (#535). */}
        <div
          className="paper paper-screen relative origin-top-left scale-[0.588] bg-background shadow-xl sm:scale-[0.88] lg:scale-100"
          style={{
            width: SHEET_W,
            height: SHEET_H,
            maskImage: PAPER_MASK,
            WebkitMaskImage: PAPER_MASK,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          {/* THE PAGE'S OWN TEXT, high and centred on the sheet — the
              order of service, dissolving into the crop. ONE LINE, and it is
              not a caption for the block below it (founder, 2026-08-27: "it
              makes no sense where you've put 'the family thank you' text
              either. it doesn't fucking relate to the QR code position").
              An earlier pass stacked the two in one centred column with a
              line of thanks directly above the code, which welded a line of
              the family's page onto favpoll's block and made both belong to
              neither. The thanks then came out altogether — "that just adds
              noise". What is left does the only job this text has: naming
              the page as an order of service, and having something to
              dissolve into the crop so the sheet reads as longer than the
              frame. */}
          <div className="absolute inset-x-0 top-11 px-14 text-center">
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Music on Leaving
            </p>
          </div>

          {/* THE BLOCK, FRAMED AND IN THE CORNER (founder, 2026-08-27). Both
              halves of that matter. The frame is what marks it as an insert
              rather than a stray paragraph of the page — the family's printer
              set a box, the way a donations panel has always been a box. And
              the corner is where it belongs: this is the page's smallest
              possible ask, tucked out of the way of the service, not a panel
              taking the middle of the sheet. It was centred and half the page
              tall before, which claimed the page rather than sitting on it.

              Anchored bottom-right so it holds the corner the mask leaves
              crisp — the artefact's subject sits in the one region that is
              unambiguously a page corner. */}
          <div className="absolute right-8 bottom-8 w-[152px] rounded-md border border-border px-3 pt-2.5 pb-3 text-center shadow-md">
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
              {/* Illustrative, not scannable: 80px natural falls to ~47px on
                  a phone, under the module floor a 33x33 code needs. Nobody
                  should be told to scan this one. */}
              <BrandedQR
                value={DEMO_QR_URL}
                size={80}
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
    </Vignette>
  )
}
