import type { Metadata } from "next"
import type { FavpollCategory } from "@favpoll/types"
import { getFavpollHeadline } from "@/lib/display"
import { paletteForFavpoll, type RegisterPalette } from "@/lib/register-palette"
import { ogCopy } from "./copy"
import { OG_SITE } from "./site"

// What a favpoll looks like to the people it is shared with, before they
// open it: the <title>, the description and the card. Pure — the fetch is
// in favpoll-og-data.ts, the pixels in cards.tsx — so it is unit-testable.

type PollJoin = { topics: { title: string } | null }

/** The row shape favpoll-og-data.ts selects. */
export type FavpollOgSource = {
  id: string
  subject: "someone" | "cause"
  cause_label: string | null
  occasion_type: string | null
  category?: string | null
  opening_line: string | null
  is_private: boolean
  is_listed?: boolean | null
  closes_at: string
  closed_at: string | null
  /** Cause favpolls carry their own photo; person favpolls keep it on the protagonist. */
  photo_url?: string | null
  protagonists: { name: string; photo_url: string | null } | null
  favpoll_charities: { charities: { name: string } | null }[] | null
  /** PostgREST hands back an object for a one-to-one join and an array otherwise. */
  favpoll_polls: PollJoin | PollJoin[] | null
}

export type FavpollOgCard = {
  /** The hero's headline prefix — "In memory of", "Celebrating", the organiser's own line. */
  eyebrow: string
  name: string
  /** The topic title in the house phrasing's case — "dinosaur", ready for "Pick your favourite …". */
  topic: string | null
  charities: string[]
  photoUrl: string | null
  initials: string
  isCause: boolean
  /** Closed by the organiser or by the clock — the same test the page applies. */
  isClosed: boolean
  /** The register's palette for the card's hexes — null = the blue default. */
  palette: RegisterPalette | null
}

export const PRIVATE_OG = {
  title: ogCopy("og.private.title"),
  description: ogCopy("og.private.description"),
} as const

export function favpollOgCard(
  src: FavpollOgSource,
  now: Date = new Date()
): FavpollOgCard {
  const isCause = src.subject === "cause"
  const name =
    (isCause ? src.cause_label : src.protagonists?.name)?.trim() ||
    ogCopy("og.fallbackName")

  const { prefix } = getFavpollHeadline({
    occasionType: src.occasion_type,
    name,
    openingLine: src.opening_line,
    subject: src.subject,
  })

  const polls = Array.isArray(src.favpoll_polls)
    ? src.favpoll_polls
    : src.favpoll_polls
      ? [src.favpoll_polls]
      : []
  const topicTitle = polls[0]?.topics?.title?.trim()

  const charities = (src.favpoll_charities ?? [])
    .map((c) => c.charities?.name?.trim() ?? "")
    .filter(Boolean)

  return {
    eyebrow: prefix.trim(),
    name,
    // Same rule as buildMechanicSteps: the title is stored capitalised
    // ("Dinosaur") and the sentence wants it lower.
    topic: topicTitle ? topicTitle.toLowerCase() : null,
    charities,
    photoUrl: (isCause ? src.photo_url : src.protagonists?.photo_url) ?? null,
    initials: initialsOf(name),
    isCause,
    isClosed: !!src.closed_at || new Date(src.closes_at) < now,
    palette: paletteForFavpoll({
      category: (src.category ?? null) as FavpollCategory | null,
      subject: src.subject,
    }),
  }
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")
}

/** "A", "A & B", "A, B & C" — the list card's join. */
export function joinCharities(names: string[]): string {
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]!
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`
}

/** Matches the share sheet's title (ShareFavpollButton) so the two never disagree. */
export function favpollOgTitle(card: FavpollOgCard): string {
  return `${card.name} — favpoll`
}

// "In memory of Donald. Pick your favourite dinosaur, give what it's worth,
// and every pound goes to Alzheimer's Society." The second sentence is the
// home headline's arc, said as one; the last clause is #577 made literal —
// the guest covers the card fee, so every pound really does go.
//
// Once closed the invitation would be false — the keepsake inherits this
// preview, and a keepsake link is shared after the fact — so the closed
// form states what happened instead of asking for a pick.
export function favpollOgDescription(card: FavpollOgCard): string {
  const who = card.eyebrow ? `${card.eyebrow} ${card.name}.` : `${card.name}.`
  const charities =
    card.charities.length > 0
      ? joinCharities(card.charities)
      : ogCopy("og.charityFallback")
  if (card.isClosed) {
    return ogCopy("og.description.closed", { who, charities })
  }
  const pick = card.topic
    ? ogCopy("og.pick", { topic: card.topic })
    : ogCopy("og.pickNoTopic")
  return ogCopy("og.description.open", { who, pick, charities })
}

export function favpollMetadata(src: FavpollOgSource): Metadata {
  const url = `/favpolls/${src.id}`

  if (src.is_private) {
    return {
      title: PRIVATE_OG.title,
      description: PRIVATE_OG.description,
      robots: { index: false, follow: false },
      openGraph: { ...OG_SITE, url, ...PRIVATE_OG },
    }
  }

  const card = favpollOgCard(src)
  const title = favpollOgTitle(card)
  const description = favpollOgDescription(card)

  return {
    title,
    description,
    // Unlisted is the organiser saying "by link, not by browsing" — search
    // engines are browsing. The link still previews in full.
    ...(src.is_listed === false ? { robots: { index: false } } : {}),
    openGraph: { ...OG_SITE, url, title, description },
  }
}
