import { t } from "@/lib/i18n"
// The site-wide Open Graph identity. Next merges metadata shallowly, key by
// key: a page that sets its own `openGraph` object replaces the layout's
// entirely, so any page-level builder spreads this in rather than relying
// on inheritance.
export const OG_SITE = {
  siteName: "favpoll",
  locale: "en_GB",
  type: "website",
} as const

export const SITE_TITLE = "favpoll"

// The brand statement — never paraphrased (favpoll-brand skill). Rendered
// ON the brand card and the auth shell, where the soul belongs.
export const SITE_DESCRIPTION = t("landing.subheader")

// THE LINK PREVIEW'S ONE SENTENCE (2026-09-23) — deliberately NOT the brand
// statement. The brand doc's own division of labour: the subheader carries
// the soul, the headline "names the arc in plain language". A stranger
// meeting favpoll in a feed needs the arc — a cold reader took the brand
// statement, found charity money, and filed favpoll next to JustGiving
// without ever working out what the poll was for.
//
// Separate from SITE_DESCRIPTION on purpose: that constant is also rendered
// as artwork on the brand card and on the auth shell, where the headline
// would duplicate HEADLINE_BEATS. Canonical strings either way — never
// paraphrase, only choose which one a surface needs.
export const SITE_META_DESCRIPTION = t("landing.headline")

// The home headline, one beat per line on the brand card — the same split
// the hero makes (the home invariant: the beats never wrap). Canonical
// string: landing.headline.
export const HEADLINE_BEATS: readonly string[] = t("landing.headline")
  .split(/(?<=\.)\s+/)
  .filter(Boolean)

export function siteBaseUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://favpoll.com")
}
