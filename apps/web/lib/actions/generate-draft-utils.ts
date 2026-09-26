import type { Register } from "@favpoll/types"

// ---------------------------------------------------------------------------
// Rate limiter — per organiser, 5-minute window, max 5 calls
// ---------------------------------------------------------------------------
export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

export const _rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>()

export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded — try again in a few minutes.")
    this.name = "RateLimitError"
  }
}

export function checkRateLimit(userId: string): void {
  const now = Date.now()
  const entry = _rateLimitStore.get(userId)
  if (!entry || entry.resetAt <= now) {
    _rateLimitStore.set(userId, {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return
  }
  if (entry.count >= RATE_LIMIT_MAX) throw new RateLimitError()
}

export function incrementRateLimitCount(userId: string): void {
  const entry = _rateLimitStore.get(userId)
  if (!entry || entry.resetAt <= Date.now()) return
  entry.count++
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/** True when the reveal text contains at least one real topic item label. */
export function revealNamesRealItem(
  reveal: string,
  itemLabels: string[]
): boolean {
  const lower = reveal.toLowerCase()
  return itemLabels.some((label) => {
    const full = label.toLowerCase().replace(/\s*&\s*/g, " and ")
    if (lower.includes(full)) return true
    // Strip parenthetical qualifiers: "Monster Munch (pickled onion)" → "monster munch"
    const noParens = full.replace(/\s*\([^)]*\)/g, "").trim()
    return noParens.length > 2 && lower.includes(noParens)
  })
}

/** True when the text contains suspicious fabricated-statistics patterns. */
export function hasFabricatedStats(text: string): boolean {
  return /\d+\s*%|\d+\s+in\s+\d+|\$\s*\d[\d,.]*\s*(?:million|billion|\bk\b)|(?:over|nearly|almost|more than)\s+\d[\d,]+\s+(?:people|patients|children|families|animals|lives)/i.test(
    text
  )
}

/**
 * True when generated copy breaks a hard brand rule the prompt already
 * bans — "choose" (the selection word is "pick", founder rule) or
 * "vote". Cheap belt-and-braces: the prompt is instruction, this is
 * enforcement (one retry).
 */
export function violatesCopyRules(text: string): boolean {
  return /\bchoos(?:e|es|ing)\b|\bchoice\b|\bvot(?:e|es|ing)\b/i.test(text)
}

/**
 * The model's tics, caught in code because a rule only moves them along
 * ("still" became "always" became "anyone who asks"; founder, 2026-09-24).
 * "always" is allowed once per Story.
 */
export function hasTics(text: string): boolean {
  if (/anyone who (ask|look|will listen|cares)/i.test(text)) return true
  // Every regenerated reunion opened a sentence with it (2026-09-26).
  if (/\bsomeone always\b/i.test(text)) return true
  return (text.match(/\balways\b/gi) ?? []).length > 1
}

/**
 * A couple or group writing in the first person plural must stay "we"
 * in the note too; the model dropped to "I keep a small model of it on
 * my desk" twice (founder, 2026-09-24).
 */
export function slipsToSingular(text: string): boolean {
  // Sentence-initial too: "My ticket stubs sit in a shoebox" slipped past
  // a case-sensitive match (2026-09-26).
  return /\b(I|I'm|I've|[Mm]y|[Mm]e|[Mm]ine)\b/.test(text)
}

/**
 * True when copy about a REAL person states or implies a medical
 * condition, a diagnosis, a treatment or a cause of death (founder,
 * 2026-09-24). The charity's own name is stripped first: "Cancer Research
 * UK" is named on purpose, "her cancer" is not. "Recovery" alone is an
 * occasion and passes; "recovered from a stroke" does not.
 */
export function inventsCondition(
  text: string,
  charityName?: string | null
): boolean {
  const scrubbed = charityName ? text.split(charityName).join(" ") : text
  return /\b(diagnos\w*|illness|disease|dementia|alzheimer|cancer|tumou?r|stroke|heart attack|diabet\w*|sight loss|lost (?:his|her|their) sight|blind|deaf|hospice|palliative|terminal|chemo\w*|surgery|operation|disabilit\w*|wheelchair|depression|anxiety|addiction|sober|recover(?:ed|ing) from|passed away from|died of|took (?:him|her|them))\b/i.test(
    scrubbed
  )
}

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------

/**
 * Person favpolls key on pronoun so each pronoun yields distinct copy.
 * Cause favpolls key on the primary charity; pronoun is always 'none'.
 */
export function buildCacheKey(
  register: Register,
  topicId: string,
  subject: "someone" | "cause",
  primaryCharityId?: string | null,
  pronoun?: string | null,
  displayName?: string | null,
  grouping?: string | null,
  occasionType?: string | null
): string {
  // v3: charity ALWAYS keys the cache (the About names it) and the display
  // name is hashed in — the model's is-this-actually-a-person judgement
  // depends on the name, so drafts must not be shared across names. The
  // version prefix retires all earlier cached drafts.
  const charityPart = primaryCharityId ?? "none"
  const pronounPart = subject === "someone" ? (pronoun ?? "none") : "none"
  let nameHash = 0
  for (const ch of displayName ?? "") {
    nameHash = (nameHash * 31 + ch.charCodeAt(0)) >>> 0
  }
  const namePart = displayName ? nameHash.toString(36) : "none"
  // v6: the occasion type keys the cache and the prompt carries the
  // pairing table's edges (2026-09-24) — a retirement's draft states a
  // different link from a birthday's, and every pre-edge draft retires.
  // The name stays LAST: the ghost prefetch borrows siblings by prefix.
  // v5: the prompt's fee clause changed (2026-09-07, "in full" claim
  // retired estate-wide) — cached drafts carrying the old claim retire.
  // v4: grouping keys the cache — a pair's plural draft must never be
  // served from a singular one (founder bug, 2026-09-06).
  const groupPart = subject === "someone" ? (grouping ?? "individual") : "none"
  const occasionPart = occasionType
    ? occasionType
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
    : "none"
  return `v6:${register}:${topicId}:${charityPart}:${subject}:${pronounPart}:${groupPart}:${occasionPart}:${namePart}`
}
