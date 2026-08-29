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

// The brand statement — never paraphrased (favpoll-brand skill).
export const SITE_DESCRIPTION = t("landing.subheader")

// The home headline, one beat per line on the brand card — the same split
// the hero makes (the home invariant: the beats never wrap). Canonical
// string: landing.headline.
export const HEADLINE_BEATS: readonly string[] = t("landing.headline")
  .split(/(?<=\.)\s+/)
  .filter(Boolean)

export function siteBaseUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://favpoll.com")
}
