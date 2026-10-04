// MODEL SPEND — the cap on profile work (decision 4 of
// references/charity-profiles-2026-09-27.md).
//
// The founder's framing: the batch filter is the real lever, not the model
// price (charity_outreach_candidates() takes 172k charities to 12.9k
// before a single call). But a cap is still wanted, and it has to cover
// "admin on-demand touches as well — clicking through the queue is the
// motion that spends invisibly". So the cap is not a flag the wave script
// passes: it lives where the model is CALLED, and every path pays into the
// same ledger.
//
// Two functions and one table. `recordSpend` writes a row after each call;
// `spendAvailable` refuses before one. Both are best-effort and never
// throw: a profile suggestion is worth having, and a broken ledger must
// not take the site down with it.
//
// Prices are Anthropic's published USD rates (checked 2026-06-24) and are
// here for BUDGETING, not billing — the invoice is the invoice. Cost is
// stored in USD micros so there is no floating-point money and no invented
// exchange rate.
import { createClient } from "@supabase/supabase-js"

/** USD per million tokens. Add a model when a task starts using one. */
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-opus-5": { input: 5, output: 25 },
}

/** The tasks that spend. One name per kind of call, so the ledger says
 *  where the money went — model per task, not per pipeline. */
export type SpendTask =
  | "perfect_topic"
  | "signature_events"
  | "cause_family"
  | "profile_paragraph"

export type ModelUsage = {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number | null
}

/** The cap, in USD. Not a product decision anyone has taken yet — a
 *  default that stops a loop running away, overridable per environment. */
const DEFAULT_CAP_USD = 25

function capMicros(): number {
  const raw = Number(process.env.MODEL_SPEND_CAP_USD)
  const usd = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_CAP_USD
  return Math.round(usd * 1_000_000)
}

/** Dated ids price the same as their family: `claude-haiku-4-5-20251001`
 *  is Haiku 4.5. Dev had exactly that pinned in `LLM_MODEL_ID`, and the
 *  first two ledger rows came out at zero because of it. */
function priceKey(model: string): string {
  return model.replace(/-\d{8}$/, "")
}

export function costMicros(model: string, usage: ModelUsage): number {
  const price = PRICES[priceKey(model)]
  // An unpriced model is recorded at zero rather than guessed at. The row
  // still exists, so the gap is visible in the ledger.
  if (!price) return 0
  const input = usage.input_tokens ?? 0
  const output = usage.output_tokens ?? 0
  // USD per million tokens x tokens = micro-dollars, exactly: the two
  // millionths cancel. (Cache reads are cheaper than fresh input; they are
  // recorded but not discounted, so an estimate errs upward.)
  return Math.round(input * price.input + output * price.output)
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Writes one call to the ledger. Fire and forget — the caller has already
 *  got what it paid for — so it NEVER rejects: a voided promise that
 *  throws is an unhandled rejection, and ten of those turned up in the
 *  test suite the moment this was wired in (the fakes return no `usage`).
 *  A missing usage is recorded as a zero-cost row rather than dropped: the
 *  call happened, and a row with no tokens says so. */
export async function recordSpend(entry: {
  task: SpendTask
  model: string
  usage?: ModelUsage | null
  registeredNumber?: string | null
  wave?: string | null
}): Promise<void> {
  // The test suite exercises these libs with a mocked SDK; it must not
  // write to a real ledger (it did, until this line — rows with no tokens
  // and no charity, from vitest).
  if (process.env.VITEST || process.env.NODE_ENV === "test") return
  try {
    const supabase = client()
    if (!supabase) return
    const usage = entry.usage ?? {}
    const { error } = await supabase.from("model_spend").insert({
      task: entry.task,
      model: entry.model,
      registered_number: entry.registeredNumber ?? null,
      input_tokens: usage.input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      cache_read_tokens: usage.cache_read_input_tokens ?? 0,
      cost_micros: costMicros(entry.model, usage),
      wave: entry.wave ?? null,
    })
    if (error) console.error("[model-spend] not recorded:", error.message)
  } catch (err) {
    console.error(
      "[model-spend] not recorded:",
      err instanceof Error ? err.message : String(err)
    )
  }
}

// A batch asks this before every charity, and the answer only changes when
// money is spent, so it is held briefly. Thirty seconds is short enough
// that a running wave notices its own spending and long enough that a loop
// of 12,000 charities does not ask the database 12,000 times.
let cached: { at: number; spentMicros: number } | null = null
const CACHE_MS = 30_000

/** The month's spend so far, from the ledger. */
export async function spendThisMonthMicros(): Promise<number> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.spentMicros
  const supabase = client()
  if (!supabase) return 0
  const from = new Date()
  from.setUTCDate(1)
  from.setUTCHours(0, 0, 0, 0)
  const { data, error } = await supabase.rpc("model_spend_since", {
    p_from: from.toISOString(),
  })
  if (error) {
    console.error("[model-spend] cap unreadable:", error.message)
    // A ledger we cannot read must not become a licence to spend: treat it
    // as full. The caller logs and skips the call.
    return capMicros()
  }
  const spent = Number(
    (data as { cost_micros?: number } | null)?.cost_micros ?? 0
  )
  cached = { at: Date.now(), spentMicros: spent }
  return spent
}

/** Whether there is budget left this month. Checked INSIDE each model
 *  wrapper, so a wave and an admin's click are held to the same cap.
 *  Never throws: a cap that cannot be read must not take a page down. */
export async function spendAvailable(): Promise<boolean> {
  try {
    return (await spendThisMonthMicros()) < capMicros()
  } catch (err) {
    console.error(
      "[model-spend] cap unreadable:",
      err instanceof Error ? err.message : String(err)
    )
    // Unreadable is treated as full, like an errored read: the ledger is
    // the only thing standing between a loop and the bill.
    return false
  }
}

/** For the scripts' own reporting. */
export async function spendSummary(): Promise<{
  spentUsd: number
  capUsd: number
  remainingUsd: number
}> {
  const spent = await spendThisMonthMicros()
  const cap = capMicros()
  return {
    spentUsd: spent / 1_000_000,
    capUsd: cap / 1_000_000,
    remainingUsd: Math.max(0, cap - spent) / 1_000_000,
  }
}

/** The in-process cache is cleared after a batch's own writes, so the next
 *  question gets a fresh answer. */
export function forgetSpendCache(): void {
  cached = null
}
