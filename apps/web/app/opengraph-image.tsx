import { ImageResponse } from "next/og"
import { BrandCard, OG_SIZE } from "@/lib/og/cards"
import { ogFonts } from "@/lib/og/fonts"
import { HEADLINE_BEATS, SITE_TITLE } from "@/lib/og/site"

// The site's share card — what a link to any page without its own card
// (home, the registers, /about, /favpolls, /record) shows in a chat.
// Static: rendered once at build.
export const alt = `${SITE_TITLE} — ${HEADLINE_BEATS.join(" ")}`
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(<BrandCard />, {
    ...OG_SIZE,
    fonts: await ogFonts(),
  })
}
