import { fetchPage } from "@/lib/charity-events"

// THE CHARITY'S OWN IMAGE (decision 2 of
// references/charity-profiles-2026-09-27.md).
//
// A profile may show the charity's own og:image or favicon, and ONLY on
// the private page and the admin preview — the page the charity itself is
// shown at onboarding, and they are the one audience who cannot object to
// their own mark. It is stored with `image_source` so a scraped image is
// never mistaken for a given one.
//
// Two guards the founder spelled out, both enforced here or at the write:
//
//   og:image or favicon ONLY. No crawling further for a better picture:
//   an og:image is published FOR being shown elsewhere; a site's photo
//   library is not. So this reads ONE page — the homepage — and follows
//   nothing but the image URL it names.
//
//   The scraped image NEVER survives onboarding. When the charity supplies
//   a logo it is DROPPED, not kept as a fallback, or `superseded` leaks
//   and a scraped image ends up served publicly by accident. That guard
//   lives where a logo is written (apps/admin setCharityLogo /
//   updateCharity), because that is the moment it must fire.
//
// Nothing here is copied to our own storage: the stored value is the
// charity's own URL, served from the charity's own site. Taking a copy
// would be taking the image, which is the thing decision 2 avoids.

export type CharityImage = {
  url: string
  /** Which kind it is, honestly — the column's own vocabulary. */
  source: "og" | "favicon"
}

const VERIFY_TIMEOUT_MS = 6000

/** The site's own base URL, or null when the register's text is not one. */
export function websiteBase(website: string | null): URL | null {
  if (!website) return null
  try {
    const url = new URL(
      /^https?:\/\//i.test(website) ? website : `https://${website}`
    )
    return url.protocol === "http:" || url.protocol === "https:" ? url : null
  } catch {
    return null
  }
}

/** The og:image a page declares, absolute, or null. Property and content
 *  arrive in either order, and either may be single-quoted. */
export function ogImage(html: string, base: URL): string | null {
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    if (!/property\s*=\s*["']og:image["']/i.test(tag)) continue
    const content = tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]
    const absolute = toAbsolute(content, base)
    if (absolute) return absolute
  }
  return null
}

/** The best favicon a page declares, absolute, else the conventional
 *  /favicon.ico. An apple-touch-icon is preferred over a rel=icon: it is
 *  the one a site makes big enough to be a logo, and this image sits where
 *  a logo sits. */
export function faviconCandidates(html: string, base: URL): string[] {
  const apple: string[] = []
  const icons: { href: string; size: number }[] = []
  for (const tag of html.match(/<link\s[^>]*>/gi) ?? []) {
    const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    if (!rel) continue
    const href = toAbsolute(
      tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1],
      base
    )
    if (!href) continue
    if (rel.includes("apple-touch-icon")) apple.push(href)
    else if (/(^|\s)(shortcut\s+)?icon(\s|$)/.test(rel)) {
      const size = Number(
        tag.match(/sizes\s*=\s*["'](\d+)x\d+["']/i)?.[1] ?? "0"
      )
      icons.push({ href, size })
    }
  }
  icons.sort((a, b) => b.size - a.size)
  return [
    ...apple,
    ...icons.map((i) => i.href),
    new URL("/favicon.ico", base).toString(),
  ]
}

/** HTML entities out of an attribute value. Without this a Drupal-style
 *  og:image stores as "...?h=91fcda32&amp;itok=4P7S8cc" — a literal
 *  "&amp;" inside a query string, which is a different URL and, on a
 *  signed one, the wrong one. Found on the first real run. */
function decodeEntities(value: string): string {
  return value
    .replace(/&amp;|&#0*38;/gi, "&")
    .replace(/&quot;|&#0*34;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;|&#0*60;/gi, "<")
    .replace(/&gt;|&#0*62;/gi, ">")
}

function toAbsolute(rawHref: string | undefined, base: URL): string | null {
  const href = rawHref ? decodeEntities(rawHref) : rawHref
  if (!href) return null
  // A data: URL is not the charity's image on the charity's site, and it
  // would be stored in full in a text column.
  if (/^data:/i.test(href)) return null
  try {
    const url = new URL(href, base)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

/** Whether a URL really serves an image. Without this an HTML error page
 *  or a redirect to a homepage gets stored as a logo, and the private page
 *  shows a broken box. */
export async function servesAnImage(url: string): Promise<boolean> {
  const check = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, {
      method,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      headers: {
        "user-agent": "favpoll (charity onboarding; hello@favpoll.com)",
        ...(method === "GET" ? { range: "bytes=0-0" } : {}),
      },
      redirect: "follow",
    })
    if (!res.ok) return null
    return /^image\//i.test(res.headers.get("content-type") ?? "")
  }
  try {
    const head = await check("HEAD")
    // Some sites answer HEAD with 405; a one-byte GET settles it.
    return head ?? (await check("GET")) ?? false
  } catch {
    return false
  }
}

/** The charity's own image, from its homepage: og:image if it publishes
 *  one, else the best favicon it declares. One page read, one image
 *  verified, nothing crawled. */
export async function findCharityImage(
  website: string | null
): Promise<CharityImage | null> {
  const base = websiteBase(website)
  if (!base) return null
  const html = await fetchPage(base.toString())
  if (!html) return null

  const og = ogImage(html, base)
  if (og && (await servesAnImage(og))) return { url: og, source: "og" }

  for (const candidate of faviconCandidates(html, base)) {
    if (await servesAnImage(candidate))
      return { url: candidate, source: "favicon" }
  }
  return null
}
