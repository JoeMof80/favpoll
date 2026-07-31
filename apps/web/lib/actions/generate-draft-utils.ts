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
  displayName?: string | null
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
  return `v3:${register}:${topicId}:${charityPart}:${subject}:${pronounPart}:${namePart}`
}
