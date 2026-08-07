"use client"

import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { PhoneFrame } from "@/components/hero-demo-panel/phone-frame"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import { PackCard } from "@/components/print-pack/pack-card"
import { DisplayStill } from "@/components/landing/display-still"
import {
  DEMO_SCENE,
  DEMO_QR_URL,
  DEMO_PACK_DATA,
  DEMO_PACK_STEPS,
} from "@/components/landing/demo-fixture"

// The three artefacts a favpoll produces, shown rather than described.
//
// These are the REAL components — the wallet card the pack prints, the page
// a guest opens, and DisplayStill, which is DisplayScreen itself with
// live={false}. A features page drawn as lookalikes would describe a product
// it could quietly stop resembling; this one cannot.
//
// Each is laid out at its own natural size and scaled, because each is a
// different real object. The scales are per-breakpoint and fixed, matching
// the process overview's approach: measured to fit, not computed at runtime.

export function PackArtefact() {
  return (
    <div
      className="pointer-events-none flex justify-center select-none"
      aria-hidden="true"
    >
      {/* .paper pins the light token values — the card forces bg-white, so
          without them a dark-mode visitor gets white ink on a white card
          (#535). .paper-screen puts the border back to the app's: .paper
          darkens it for ink that survives a domestic printer, which on a
          screen just outlines every row. */}
      {/* Fixed box outside, scale inside — the same shape as the other two,
          so one test can measure all three. The card is 85.6 x 54mm (323 x
          204px), so 0.85 / 1 / 1.35 give 275x174, 323x204 and 437x276; the
          boxes carry a little headroom for the tilt, which widens the
          bounding rect by a few px. */}
      <div
        data-artefact-box
        className="h-[185px] w-[285px] sm:h-[215px] sm:w-[335px] lg:h-[290px] lg:w-[450px]"
      >
        <div className="paper paper-screen w-max origin-top-left scale-[0.85] -rotate-1 drop-shadow-xl sm:scale-100 lg:scale-[1.35]">
          <PackCard
            data={DEMO_PACK_DATA}
            steps={DEMO_PACK_STEPS}
            scale="wallet"
          />
        </div>
      </div>
    </div>
  )
}

export function PhoneArtefact() {
  return (
    <div
      className="pointer-events-none flex justify-center select-none"
      aria-hidden="true"
    >
      {/* 414 x 868 scaled: the well is as tall as the phone at each stop. */}
      <div
        data-artefact-box
        className="h-[434px] w-[207px] lg:h-[521px] lg:w-[248px]"
      >
        <div className="origin-top-left scale-[0.5] lg:scale-[0.6]">
          <PhoneFrame>
            <DemoCard
              scene={DEMO_SCENE}
              phase="reveal"
              barWidths={DEMO_SCENE.results.map((r) => r.widthPercent)}
              prefersReducedMotion
              device="phone"
              className="rounded-none border-0"
            />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

export function DisplayArtefact() {
  return (
    <div
      className="pointer-events-none flex justify-center select-none"
      aria-hidden="true"
    >
      {/* 940 wide inside the TV bezel. The display needs a wide layout or its
          banner collapses to its mobile form and stops reading as a screen in
          a room, so it is rendered full size and scaled down. */}
      {/* The base size is 300, not 400: at a 390px viewport the page has
          342px of usable width after its padding, and a 400px box put the
          whole document into horizontal scroll. */}
      {/* Box sizes are the scaled result, MEASURED at each stop rather than
          derived from one ratio — because the display's own layout is
          viewport-keyed. Below lg its guest wall stops sitting beside the
          rankings and stacks under them, so the same 940-wide screen is
          ~1240 tall instead of 697. Heights: 396 / 722 / 509.

          (That is the fourth time this branch has met a component asking the
          window instead of its container. It is worth knowing about anything
          rendered at a fixed width inside a frame.) */}
      <div
        data-artefact-box
        className="h-[400px] w-[300px] sm:h-[725px] sm:w-[545px] lg:h-[510px] lg:w-[686px]"
      >
        {/* w-max matters: scaling does not affect layout, so without it this
            wrapper took the fixed box's width, the 900px display inside
            overflowed, and TvFrame's overflow-hidden sliced the screen in
            half. It has to size to its content and then be scaled down. */}
        <div className="w-max origin-top-left scale-[0.32] sm:scale-[0.58] lg:scale-[0.73]">
          <TvFrame>
            <div className="w-[900px]">
              <DisplayStill scene={DEMO_SCENE} qrUrl={DEMO_QR_URL} />
            </div>
          </TvFrame>
        </div>
      </div>
    </div>
  )
}
