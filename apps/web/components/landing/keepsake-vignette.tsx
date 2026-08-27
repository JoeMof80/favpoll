import { KeepsakeDocument } from "@/components/keepsake/keepsake-document"
import { KeepsakeSheet } from "@/components/keepsake/keepsake-sheet"
import { Vignette } from "@/components/landing/vignette"
import { DEMO_KEEPSAKE_DATA } from "@/components/landing/demo-fixture"

// The keepsake as it comes off the printer — the real KeepsakeDocument,
// shared with the keepsake page, so the sheet this page depicts and the
// sheet an organiser prints cannot drift apart.
//
// TWO SHEETS, because "two ways to tell it" is the feature: the tribute in
// front, uncovered — Belinda's memorial is the register the sheet defaults
// to — and the fundraiser behind it in portrait, offset far enough right
// that its centred total stays readable. One landscape, one portrait, so
// the pair also shows both papers without a bullet having to say so.

// A4 at 96dpi, as the pack vignette measures it.
const PORTRAIT = { w: 794, h: 1123 }
const LANDSCAPE = { w: 1123, h: 794 }

// Authored at full page size and scaled once, like the pack's fan. The
// fundraiser sits high-right so its £ centrepiece clears the tribute's
// edge; the tilts are small and opposite, a pair someone has set down
// rather than a diagram.
const FUNDRAISER = { x: 850, y: 0, rot: 1.8, page: PORTRAIT }
const TRIBUTE = { x: 0, y: 250, rot: -1.6, page: LANDSCAPE }

const FAN_W = Math.max(
  TRIBUTE.x + TRIBUTE.page.w,
  FUNDRAISER.x + FUNDRAISER.page.w
) // 1644
const FAN_H = Math.max(
  TRIBUTE.y + TRIBUTE.page.h,
  FUNDRAISER.y + FUNDRAISER.page.h
) // 1123

// THE HOME PAGE'S KEEPSAKE, WITH BELINDA'S DATA (founder, 2026-08-27: "why
// not use the keepsake template from the homepage?").
//
// The same KeepsakeSheet the walkthrough mounts, at the same 0.34 / 0.47 /
// 0.57 ladder — so the sheet a visitor meets on the home page and the sheet
// they meet here are one artefact at one size, which is the continuity this
// page was rebuilt around. Only the DATA differs, and it has to: the
// walkthrough runs on Poppy's Sweet Sixteen, this page on Belinda's.
//
// IT SUPERSEDES A CROP, built earlier the same day. The fault it was fixing
// was real — the fan below puts her name at 10px and her reveal at 5px — but
// cropping to the sheet's head was the wrong fix twice over. The home page
// had ALREADY solved it, by showing a portrait A4 whole at 0.57 instead of
// two landscape sheets at 0.28: 20px and 10px, the same legibility the crop
// was straining for, with no crop and no fade to soften. And the idea beside
// it says "print and FRAME a tribute style keepsake" — the standings and the
// colophon are what you would be framing, and a crop cut them off.
//
// Portrait, not the fan's landscape: portrait is the one you frame.
//
// The pair stays on /features, where "two ways to tell it" is the point being
// made. Here the copy says "a tribute style keepsake", singular, so the
// fundraiser sheet was illustrating a claim the copy does not make.
const KEEPSAKE_SCALE = "scale-[0.34] lg:scale-[0.47] xl:scale-[0.57]"

export function KeepsakeVignetteDetail() {
  return (
    <Vignette className="flex justify-center">
      {/* The box reserves the SCALED size: a transform does not change the
          layout box, so without this a 1123px sheet sits in the frame at its
          natural height and pushes everything below it down.
          0.34 / 0.47 / 0.57 of 794 x 1123 give the sizes below. */}
      <div
        data-artefact-box
        className="h-[382px] w-[270px] lg:h-[528px] lg:w-[373px] xl:h-[640px] xl:w-[453px]"
      >
        <KeepsakeSheet
          data={DEMO_KEEPSAKE_DATA}
          variant="tribute"
          orientation="portrait"
          className={`origin-top-left ${KEEPSAKE_SCALE}`}
        />
      </div>
    </Vignette>
  )
}

export function KeepsakeVignette() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — measured to fit rather
          than computed at runtime, matching the pack vignette.
          0.155 / 0.24 / 0.28 of 1644 x 1123 give the sizes below. */}
      <div
        data-artefact-box
        className="h-[174px] w-[255px] sm:h-[270px] sm:w-[395px] lg:h-[315px] lg:w-[461px]"
      >
        {/* .paper pins the light token values so a dark-mode visitor gets
            ink on paper, not paper-coloured ink (#535); .paper-screen keeps
            the app's border weight on screen. */}
        <div
          className="paper paper-screen relative origin-top-left scale-[0.155] sm:scale-[0.24] lg:scale-[0.28]"
          style={{ width: FAN_W, height: FAN_H }}
        >
          {(
            [
              ["fundraiser", FUNDRAISER],
              ["tribute", TRIBUTE],
            ] as const
          ).map(([variant, s]) => (
            <div
              key={variant}
              className="absolute drop-shadow-xl"
              style={{
                left: s.x,
                top: s.y,
                width: s.page.w,
                height: s.page.h,
                transform: `rotate(${s.rot}deg)`,
              }}
            >
              <KeepsakeDocument
                data={DEMO_KEEPSAKE_DATA}
                variant={variant}
                orientation={s.page === PORTRAIT ? "portrait" : "landscape"}
              />
            </div>
          ))}
        </div>
      </div>
    </Vignette>
  )
}
