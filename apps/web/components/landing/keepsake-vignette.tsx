import { KeepsakeDocument } from "@/components/keepsake/keepsake-document"
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

// THE DETAIL CROP (founder, 2026-08-27): "The Tribute Keepsake should show
// specifically that with [Belinda's] details."
//
// The data was already hers — DEMO_KEEPSAKE_DATA is built from
// MEMORIAL_SCENE and the fixture carries a comment guarding it from drifting
// to the birthday scene. The fault was SCALE. Two A4 sheets fanned across
// 1644px and scaled to 0.28 put her name at 10px and her reveal at 5px, so
// the sheet was legible as an object and illegible as a keepsake — the
// section's recurring defect, a whole document shrunk until nothing on it
// reads.
//
// So: ONE sheet, the tribute, cropped to its head — the prefix, the name,
// the topic and the reveal, which is the half a family would actually look
// at. Full width, both side edges kept, running off the bottom: cropping
// horizontally as well would cut the document's own corner marks, and a
// frame with no edges stops reading as paper.
//
// The pair stays on /features, where "two ways to tell it" is the point
// being made. Here the idea beside it says "a tribute style keepsake",
// singular, so the fundraiser sheet was illustrating a claim the copy does
// not make.
const TRIBUTE_CROP_H = 470

export function KeepsakeVignetteDetail() {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="h-[122px] w-[292px] sm:h-[197px] sm:w-[472px] lg:h-[241px] lg:w-[575px]"
      >
        {/* .paper / .paper-screen for the reason the fan below uses them:
            ink on paper, pinned to the light values whatever the viewer's
            theme (#535). overflow-hidden ON the scaled element: it is the
            crop window, authored at the sheet's width and a fraction of its
            height, with the full-height document positioned inside it. */}
        <div
          className="paper paper-screen relative origin-top-left scale-[0.26] overflow-hidden shadow-xl sm:scale-[0.42] lg:scale-[0.512]"
          style={{ width: LANDSCAPE.w, height: TRIBUTE_CROP_H }}
        >
          <div
            className="absolute inset-x-0 top-0"
            style={{ height: LANDSCAPE.h }}
          >
            <KeepsakeDocument
              data={DEMO_KEEPSAKE_DATA}
              variant="tribute"
              orientation="landscape"
            />
          </div>
          {/* The cut, softened — a hard slice across a page reads as a
              rendering fault rather than as a crop. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          {/* lg is 0.512, NOT the 0.5556 that would fill 624px: Vignette's
              px-6 takes 48 off the frame, so the widest a scaled sheet may
              be is 576. At 0.5556 the sheet ran 623px inside a 576px well
              and the frame clipped it — measured at 1280 and 1536. */}
        </div>
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
