// Hex mirrors of the design tokens, for the Open Graph card renderer only.
//
// WHY THIS FILE EXISTS. Every colour in the app goes through the oklch tokens
// in globals.css, and CI (scripts/check-hex-colors.mjs) blocks hex literals
// in app source. The one place that rule cannot reach is Satori — the
// rasteriser behind next/og — which draws from inline styles with no
// stylesheet, no CSS variables and no oklch support. So the share cards need
// the tokens' values as hex, and this is the single, allowlisted file that
// holds them. Change a token in globals.css → change its mirror here.
//
// The values are the brand reference hexes behind the tokens (favpoll-brand
// skill → Design tokens); the two greys are converted from their oklch.
export const OG_PALETTE = {
  /** --background */
  background: "#FFFFFF",
  /** --foreground  oklch(0.2 0.02 280) */
  foreground: "#1A1B2E",
  /** --muted-foreground  oklch(0.52 0.06 278) */
  mutedForeground: "#61668C",
  /** --primary */
  primary: "#534AB7",
  /** --primary-muted */
  primaryMuted: "#7F77DD",
  /** --secondary / --muted */
  secondary: "#EEEDFE",
  /** --border-strong */
  borderStrong: "#AFA9EC",
  /** --reveal-foreground */
  revealForeground: "#26215C",
} as const
