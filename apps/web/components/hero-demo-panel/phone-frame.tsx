import { cn } from "@/lib/utils"

// A phone chassis for the guest arc (founder, 2026-08-06). The four beats a
// GUEST lives through — arrive, pick, pledge, reveal — all happen on a phone,
// and the browser window bar the demo used said otherwise. DemoFrame is not
// retired: it still frames the live display, which genuinely is a browser
// page an organiser casts to a screen.
//
// Sized to an iPhone 14/15 logical viewport (390 × 844) rather than a
// made-up ratio, because the DemoCard inside is the real fluid layout — at
// 390 it lays out exactly as it does on a guest's phone. Measured at that
// width: no element overflows its box, and the card's fixed 12/14px type
// renders at 10.7px once the column's fit-scale (0.765 at 1280 × 800) is
// applied — against 11.2px for the old 500px-wide card, so the change costs
// about 4%, not the quarter a naive box-width comparison suggests.
//
// The chassis is a device, so it keeps a fixed neutral in both themes — a
// phone that inverts with the page reads as a drawing, not an object.

export const PHONE_SCREEN_WIDTH = 390
export const PHONE_SCREEN_HEIGHT = 844
const BEZEL = 12

/**
 * The blank strip a page leaves for the status bar. Owned here because it is
 * device knowledge, but RENDERED by DemoCard — the real DialogOverlay is
 * `fixed inset-0`, so the pledge scrim dims the area behind the status bar
 * too, and a strip drawn by this frame would sit outside the card's scrim and
 * stay bright while everything around it dimmed.
 *
 * Blank rather than a drawn clock and battery: that is OS chrome, it
 * restyles every year, and a stale one reads as an old screenshot. Same
 * reason Safari's URL bar stays out.
 */
export const PHONE_SAFE_AREA_TOP = 48

/**
 * The one scale a phone is shown at. Lived in process-overview; hoisted
 * here 2026-08-26 so a second surface cannot pick its own and drift — the
 * homepage's guest arc and the memorial hero now show the same-sized
 * handset, which is the point of showing a handset at all.
 */
export const PHONE_SCALE = "scale-[0.52] lg:scale-[0.70] xl:scale-[0.75]"

export const PHONE_CHASSIS_WIDTH = PHONE_SCREEN_WIDTH + BEZEL * 2
export const PHONE_CHASSIS_HEIGHT = PHONE_SCREEN_HEIGHT + BEZEL * 2

export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-[3.25rem] bg-zinc-900 p-3 shadow-2xl ring-1 ring-zinc-700/60",
        className
      )}
      style={{
        width: PHONE_CHASSIS_WIDTH,
        height: PHONE_CHASSIS_HEIGHT,
      }}
      aria-hidden="true"
    >
      {/* Side buttons — the detail that stops the chassis reading as a
          plain rounded rectangle. Purely decorative. */}
      <span className="absolute top-30 -left-1 h-14 w-1 rounded-l-sm bg-zinc-700" />
      <span className="absolute top-48 -left-1 h-9 w-1 rounded-l-sm bg-zinc-700" />
      <span className="absolute top-38 -right-1 h-20 w-1 rounded-r-sm bg-zinc-700" />

      {/* flex column, matching DemoFrame: the DemoCard inside is `flex-1`,
          so it fills the screen the same way in both frames. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.5rem] bg-background">
        {children}
        {/* Dynamic island. z-30 puts it above the pledge sheet (z-20): the
            island is the DEVICE, so nothing the page opens can cover it —
            the full-screen sheet was painting straight over it. */}
        <span className="absolute top-2.5 left-1/2 z-30 h-7 w-26 -translate-x-1/2 rounded-full bg-zinc-900" />
      </div>
    </div>
  )
}
