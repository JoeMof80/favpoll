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
