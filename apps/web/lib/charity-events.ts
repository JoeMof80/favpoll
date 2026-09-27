import Anthropic from "@anthropic-ai/sdk"

// A charity's SIGNATURE EVENTS (founder, 2026-09-27: "it would be great
// data to know which kind of fundraising events charities already hold").
// The register never says: its activities field describes services. The
// charity's own website does — an events or fundraising page nearly
// always lists them (Coffee Morning, Light up a Life, Fish Supper, the
// Sunday tea party). Read once, at insert or backfill, never at Generate
// (the agreed pattern for website reading); stored as a SUGGESTION beside
// the perfect topic, for the outreach queue and the welcome email: "we've
// set up a favpoll for your Coffee Morning" names the occasion as well as
// the favourite.

export type SignatureEvent = {
  /** The event as the charity names it ("World's Biggest Coffee Morning"). */
  name: string
  /** Its kind in plain words ("coffee morning", "sponsored walk",
   *  "memorial service", "quiz night", "tea party", "dog show"). */
  kind: string
  /** When it runs, if the page says ("October", "every December", "Sunday
   *  afternoons"), else null. */
  when: string | null
  /** The favpoll occasion type it maps to, from the list given, or null. */
  occasionType: string | null
  /** The favpoll topic a favpoll at this event would run on, from the
   *  catalogue given, or null. */
  topic: string | null
  /** Where it was read. */
  sourceUrl: string
}

const FETCH_TIMEOUT_MS = 8000
const MAX_PAGE_CHARS = 12000
const EVENT_LINK =
  /event|fundrais|get-involved|getinvolved|support-us|supportus|take-part|takepart|whats-on|what-s-on|challenge/i

/** Plain text from HTML, without a parser: scripts, styles and tags out,
 *  whitespace folded. Good enough for a model to read a page. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim()
}

/** The site's own links that look like an events or fundraising page. */
export function eventLinks(html: string, base: URL): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(/href=["']([^"'#?]+)[^"']*["']/gi)) {
    const href = m[1]
    if (!EVENT_LINK.test(href)) continue
    try {
      const u = new URL(href, base)
      if (
        u.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")
      )
        continue
      out.add(u.toString())
    } catch {
      /* not a URL */
    }
  }
  return [...out].slice(0, 3)
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "user-agent": "favpoll (charity onboarding; hello@favpoll.com)",
      },
      redirect: "follow",
    })
    if (!res.ok) return null
    const type = res.headers.get("content-type") ?? ""
    if (!/html/i.test(type)) return null
    return await res.text()
  } catch {
    return null
  }
}

/** The charity's homepage and up to three event-ish pages, as text. */
export async function readCharityWebsite(
  website: string
): Promise<{ url: string; text: string }[]> {
  const base = (() => {
    try {
      return new URL(
        /^https?:\/\//i.test(website) ? website : `https://${website}`
      )
    } catch {
      return null
    }
  })()
  if (!base) return []
  const home = await fetchPage(base.toString())
  if (!home) return []
  const pages: { url: string; text: string }[] = [
    { url: base.toString(), text: htmlToText(home).slice(0, MAX_PAGE_CHARS) },
  ]
  for (const link of eventLinks(home, base)) {
    const html = await fetchPage(link)
    if (html)
      pages.push({ url: link, text: htmlToText(html).slice(0, MAX_PAGE_CHARS) })
  }
  return pages
}

export type SignatureEventsInput = {
  name: string
  website: string | null
  activities: string | null
  /** favpoll's occasion types, so the model maps to one it can name. */
  occasionTypes: string[]
  /** The catalogue's topic titles. */
  topicTitles: string[]
}

function buildPrompt(
  input: SignatureEventsInput,
  pages: { url: string; text: string }[]
): string {
  const body = pages.map((p) => `=== ${p.url} ===\n${p.text}`).join("\n\n")
  return `favpoll is a fundraising page for an occasion: guests pledge to a charity by picking their favourite of something (their favourite cake, hymn, beach). We are reading a charity's own website to learn which fundraising EVENTS it already holds — its signature events, the ones it runs every year or asks supporters to run (a coffee morning, a sponsored walk, a memorial service, a quiz night, a tea party, a dog show, a fish supper). Not its services, not one-off news, not events run by other organisations.

Charity: ${input.name}
What the register says it does: ${input.activities ?? "(nothing)"}

favpoll's occasion types: ${input.occasionTypes.join(", ")}.
favpoll's topics: ${input.topicTitles.join(", ")}.

The pages:
${body}

List the signature events you can actually see on these pages (none is a fine answer). For each, name it as the charity does, say its kind in plain words, when it runs if the page says, the favpoll occasion type it maps to (or null), and the one favpoll topic a favpoll at that event would run on (or null): a coffee morning runs on Cake, a memorial service on Hymn, a fish supper on Sea creature, a dog show on Dog breed. Never invent an event the pages do not show.

Answer with JSON only: {"events": [{"name": "...", "kind": "...", "when": "..." or null, "occasion_type": "..." or null, "topic": "..." or null, "source_url": "..."}]}`
}

/** The signature events read from the charity's site. Never throws; an
 *  empty list when there is no site, no page, or nothing to see. */
export async function suggestSignatureEvents(
  input: SignatureEventsInput
): Promise<SignatureEvent[]> {
  if (!process.env.ANTHROPIC_API_KEY || !input.website) return []
  const pages = await readCharityWebsite(input.website)
  if (pages.length === 0) return []
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: process.env.LLM_MODEL_ID ?? "claude-sonnet-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: buildPrompt(input, pages) }],
    })
    const text =
      message.content.find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )?.text ?? ""
    const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
    if (!raw) return []
    const parsed = JSON.parse(raw) as {
      events?: {
        name?: string
        kind?: string
        when?: string | null
        occasion_type?: string | null
        topic?: string | null
        source_url?: string
      }[]
    }
    const norm = (s: string) => s.trim().toLowerCase()
    const occasions = new Map(input.occasionTypes.map((o) => [norm(o), o]))
    const topics = new Map(input.topicTitles.map((t) => [norm(t), t]))
    const urls = new Set(pages.map((p) => p.url))
    return (parsed.events ?? [])
      .filter((e) => e.name && e.kind)
      .slice(0, 8)
      .map((e) => ({
        name: String(e.name).trim(),
        kind: String(e.kind).trim().toLowerCase(),
        when: e.when ? String(e.when).trim() : null,
        // only an occasion type and a topic favpoll actually has
        occasionType: e.occasion_type
          ? (occasions.get(norm(String(e.occasion_type))) ?? null)
          : null,
        topic: e.topic ? (topics.get(norm(String(e.topic))) ?? null) : null,
        sourceUrl:
          e.source_url && urls.has(String(e.source_url))
            ? String(e.source_url)
            : pages[0].url,
      }))
  } catch (err) {
    console.error(
      "suggestSignatureEvents failed:",
      err instanceof Error ? err.message : err
    )
    return []
  }
}
