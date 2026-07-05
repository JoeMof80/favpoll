import { createAdminClient } from "@/lib/supabase/admin"

// Fixed-window limits backed by the rate_limits table (shared across
// serverless instances). Limits are deliberately generous per IP: an
// entire funeral's guests share one venue NAT, and a post-eulogy rush
// must never be throttled — the numbers target card-testing bots and
// spam scripts, which run orders of magnitude hotter.
//
// FAIL-OPEN: if the limiter errors, the request is allowed. A limiter
// outage must never block a pledge.

export type RateRule = {
  /** Distinguishes windows sharing the same scope+id (e.g. "1m", "1h") */
  name: string
  max: number
  windowSeconds: number
}

export async function isRateLimited(
  scope: string,
  id: string,
  rules: RateRule[]
): Promise<boolean> {
  const supabase = createAdminClient()
  try {
    for (const rule of rules) {
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: `${scope}:${rule.name}:${id}`,
        p_max: rule.max,
        p_window_seconds: rule.windowSeconds,
      })
      if (error) {
        console.error(`[rate-limit] ${scope} check failed:`, error.message)
        return false // fail open
      }
      if (data === false) return true
    }
    return false
  } catch (err) {
    console.error(`[rate-limit] ${scope} error:`, err)
    return false // fail open
  }
}

/** First hop of x-forwarded-for; "unknown" buckets requests without one. */
export function ipFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "unknown"
}

export const RATE_LIMIT_MESSAGE =
  "Too many requests — please try again in a few minutes."
