/**
 * Paints <html> in the page's ground colour for the duration of the route.
 *
 * Pages whose ground differs from the default white (e.g. the favpolls
 * list's bg-muted) paint that ground on their <main> — which ends at its
 * content. Below it the white body shows through as a seam that SHIFTS
 * when the page scrolls, reading as a layout bug (founder, 2026-09-13).
 * Painting <html> makes the ground cover the whole canvas: below the
 * main, during scroll, and in the iOS overscroll glow.
 *
 * Server-rendered <style> so the ground is painted on first paint — no
 * flash. React removes the tag on client-side navigation away.
 *
 * @media screen: the ground is a screen concern — the print surfaces
 * (keepsake, stationery) must keep printing on white.
 */
export function PageGround({ color }: { color: string }) {
  return <style>{`@media screen{html{background-color:${color}}}`}</style>
}

/**
 * bg-primary/5 as a SOLID colour — mixed over the background token, not
 * transparent: an unpainted <html> is browser-white even in dark mode, so
 * a translucent wash would compose over the wrong canvas there.
 */
export const PRIMARY_WASH =
  "color-mix(in oklab, var(--primary) 5%, var(--background))"
