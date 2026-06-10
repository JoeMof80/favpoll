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
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return
  }
  if (entry.count >= RATE_LIMIT_MAX) throw new RateLimitError()
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

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------

/**
 * Person events always use 'none' as the charity segment so a single cached
 * entry covers all charity combinations (About is charity-agnostic).
 * Cause events key on the primary charity so the reveal is charity-specific.
 */
export function buildCacheKey(
  register: Register,
  topicId: string,
  subject: "someone" | "cause",
  primaryCharityId?: string | null
): string {
  const charityPart =
    subject === "cause" ? (primaryCharityId ?? "none") : "none"
  return `${register}:${topicId}:${charityPart}:${subject}`
}
