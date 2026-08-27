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
          {/* Content sits in the CRISP corner. The left padding clears the
              mask's fade so no line is half-dissolved — a word thinning out
              mid-stroke reads as a rendering fault rather than as a page
              continuing, the finding that killed the cropped dialog corners
              in the How It Works hints. */}
          <div className="flex h-full flex-col items-center justify-end pr-11 pb-10 pl-28 text-center">
            {/* Eaten by the top fade, on purpose: a crop needs something
                disappearing into it, or the sheet reads as a short page
                rather than a long one. */}
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Music on Leaving
            </p>
            <p className="mt-3 font-serif text-[14px] leading-relaxed text-foreground">
              The family thank you for your
              <br />
              kindness and support today.
            </p>

            <div className="mt-8 w-full">
              <p className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {PREFIX}
              </p>
              <p className="mt-1 text-[19px] leading-tight font-medium text-foreground">
                {NAME}
              </p>
              <p className="mt-3 border-t border-b border-border py-2 text-[11px] font-medium tracking-[0.14em] text-primary uppercase">
                {TOPIC_LABEL}
              </p>
              <div className="mt-4 flex flex-col items-center gap-3">
                {/* Illustrative, not scannable: 118px natural falls to ~69px
                    on a phone, under the module floor a 33x33 code needs.
                    Nobody should be told to scan this one. */}
                <BrandedQR
                  value={DEMO_QR_URL}
                  size={118}
                  aria-label="favpoll QR code"
                />
                <FavpollLogo className="text-[15px] font-medium" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
