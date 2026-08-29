import { ImageResponse } from "next/og"
import { BrandCard, FavpollCard, OG_SIZE } from "@/lib/og/cards"
import { favpollOgCard } from "@/lib/og/favpoll-og"
import { getFavpollOgSource } from "@/lib/og/favpoll-og-data"
import { ogFonts } from "@/lib/og/fonts"
import { ogCopy } from "@/lib/og/copy"
import { fetchPhotoDataUrl } from "@/lib/og/photo"

// A favpoll's share card: the picture WhatsApp, Slack, iMessage and the rest
// draw beside a pasted link. Distribution is the fundraising mechanic
// (ShareFavpollButton), and until this existed a favpoll link previewed as
// a bare URL — no name, no photo, no charity.
//
// PRIVATE FAVPOLLS GET THE BRAND CARD. This route is reachable by anyone
// who holds the id, with none of the page's sign-in gate in front of it, so
// it must not draw a private favpoll's name or photo. The page's
// generateMetadata makes the same call.
//
// CACHE FOR AN HOUR, NOT FOREVER. ImageResponse's production default is
// `immutable, max-age=31536000` — right for a static brand card, wrong for
// one that carries an organiser's editable name and photo. Crawlers keep
// their own copies for days anyway; the CDN need not add a year to that.
export const alt = ogCopy("og.alt")
export const size = OG_SIZE
export const contentType = "image/png"

type Props = { params: Promise<{ id: string }> }

export default async function Image({ params }: Props) {
  const { id } = await params
  const [src, fonts] = await Promise.all([getFavpollOgSource(id), ogFonts()])

  const options = {
    ...OG_SIZE,
    fonts,
    headers: {
      "cache-control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  }

  if (!src || src.is_private) {
    return new ImageResponse(<BrandCard />, options)
  }

  const card = favpollOgCard(src)
  const photo = await fetchPhotoDataUrl(card.photoUrl)

  return new ImageResponse(<FavpollCard card={card} photo={photo} />, options)
}
