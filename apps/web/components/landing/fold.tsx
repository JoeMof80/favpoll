// THE FIRST SCREEN IS THE HERO PLUS HOW-IT-WORKS (founder, 2026-10-15).
//
// With the register hero compact, how-it-works rose into the fold — and
// then the next section's top edge showed beneath it, a strip of the shelf
// peeking under the steps at the bottom of the screen. The founder's ask:
// vary the hero's height slightly so the two together match the screen.
//
// So the pair is one grid, as tall as the viewport below the h-14 nav, with
// how-it-works taking its own height and the hero taking the rest. The
// hero's band is `flex items-center` with no height of its own in compact
// mode, so it stretches to fill the 1fr row and centres its content in it.
// min-h, not h: where the two outgrow a short screen (every phone), this is
// a floor and the page simply flows.
export function Fold({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-rows-[1fr_auto]">
      {children}
    </div>
  )
}
