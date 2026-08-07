import { cn } from "@/lib/utils"

// The third chassis, beside DemoFrame and PhoneFrame (founder, 2026-08-06):
// a screen on a wall, in a room.
//
// The display beat used to wear the browser window bar, on the reasoning that
// the display route genuinely IS a browser page. True, and beside the point —
// the beat is called "In the room", and a traffic-light bar says "a tab on
// someone's laptop", which is the least evocative reading of it.
//
// The room is implied with LIGHT, not with objects. A table, chairs or
// silhouetted heads would make this the only beat with a set, while the card
// and the phone are bare objects floating on the band; a glow and a vignette
// are the same order of thing as their drop shadows. (It would also need
// scene photography, which public/demo does not have — every asset there is
// a portrait.)
//
// Why a vignette at all: a screen reads as "in a room" through its own light
// falling on something, and the band behind it is pale lavender in light mode
// and brand purple in dark. Neither gives the glow anywhere to land, so the
// TV brings its own dim pocket. This is a deliberate exception to the
// "bare, no tinted panel" note of 2026-08-04 — which was about not putting a
// brand-tinted card behind a UI screenshot, not about forbidding atmosphere.

export function TvFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)} aria-hidden="true">
      {/* NOTE the sizes here. This whole frame is rendered at full size and
          scaled down hard by the caller (~0.51 at 1280), and a transform
          scales blur radii and offsets along with everything else — the first
          attempt used -inset-8/blur-3xl, which survived the scale as about
          four invisible pixels. Atmosphere has to be authored oversized to
          exist at all once shrunk. */}
      {/* The dim pocket the screen hangs in. Elliptical and blurred far past
          its own edges, so it never resolves into a panel with corners.
          Kept LIGHT — at /45 it read as a hard grey cloud behind the set
          rather than as a room, and the point is atmosphere, not a shadow. */}
      <div className="pointer-events-none absolute -inset-28 rounded-[50%] bg-zinc-950/20 blur-[110px]" />
      {/* The light the panel throws back onto the wall — tighter than the
          pocket, so it reads as spill rather than a second shadow. */}
      <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-white/20 blur-[60px]" />

      <div className="relative rounded-2xl bg-zinc-900 p-5 shadow-2xl ring-1 ring-zinc-700/50">
        <div className="relative overflow-hidden rounded-sm bg-background">
          {children}
          {/* Glare: one broad sheen across the top corner, and nothing over
              the rankings. Those labels land near 9px once scaled, so a sheen
              through the middle would cost real legibility to buy an effect. */}
          <div className="pointer-events-none absolute -top-1/2 -right-1/4 h-full w-3/4 rotate-[24deg] bg-gradient-to-b from-white/25 to-transparent blur-[40px]" />
        </div>
        {/* Standby light, bottom bezel */}
        <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400/70" />
      </div>

      {/* Wall shadow beneath the set — mounted, not floating. */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 h-16 w-2/3 -translate-x-1/2 rounded-[50%] bg-zinc-950/15 blur-[60px]" />
    </div>
  )
}
