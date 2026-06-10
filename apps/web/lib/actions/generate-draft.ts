"use server"

import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Register } from "@favpoll/types"

// ---------------------------------------------------------------------------
// Rate limiter — per organiser, 5-minute window, max 5 calls
// Slots into the global rate-limiting TODO (middleware-level, not yet built).
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

const _rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded — try again in a few minutes.")
    this.name = "RateLimitError"
  }
}

function checkRateLimit(userId: string): void {
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

/**
 * True when the reveal text contains at least one real topic item label.
 * Runtime equivalent of the lint-topics.mjs item-name guard.
 */
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

/**
 * True when the text contains suspicious fabricated-statistics patterns.
 * Used as a cause-reveal guard: if it fires, trigger a retry.
 */
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

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const REGISTER_LABEL: Record<Register, string> = {
  remembering: "in memory of someone",
  celebrating_one: "celebrating a person",
  celebrating_many: "celebrating a group or couple",
  cause: "supporting a cause",
  neutral: "a general occasion",
}

function buildPrompt(opts: {
  register: Register
  subject: "someone" | "cause"
  topicTitle: string
  itemLabels: string[]
  charityName: string | null
  charityDescription: string | null
}): string {
  const {
    register,
    subject,
    topicTitle,
    itemLabels,
    charityName,
    charityDescription,
  } = opts

  const topicContext = `Poll topic: "${topicTitle}". Options: ${itemLabels.slice(0, 12).join(", ")}.`

  let instructions: string
  if (subject === "cause") {
    const charityCtx =
      charityName && charityDescription
        ? `\nCharity: ${charityName}. About them: ${charityDescription}`
        : charityName
          ? `\nCharity: ${charityName}.`
          : ""
    instructions = `Write for a charity fundraiser event (${REGISTER_LABEL[register]}).
- "about": 1–2 sentences about the spirit of gathering and giving; do NOT name any specific charity.
- "reveal": 1 sentence that connects the charity's work to the poll topic. Ground it in the charity description${charityCtx ? " below" : ""}; do not invent statistics, specific numerical claims, or quotations.${charityCtx}`
  } else {
    instructions = `Write for a person-honoured event (${REGISTER_LABEL[register]}).
- "about": 1–2 sentences evoking the warmth of coming together and giving in someone's honour; do NOT name any specific charity.
- "reveal": 1 sentence that names the person's favourite from the poll options. You MUST use a real option from the list above — do not invent one.`
  }

  return `You are writing short copy for a charitable polling event.
${topicContext}

${instructions}

Respond with ONLY valid JSON, no markdown, no explanation:
{"about":"...","reveal":"..."}`
}

// ---------------------------------------------------------------------------
// LLM call
// ---------------------------------------------------------------------------

async function callLLM(
  prompt: string,
  modelId: string
): Promise<{ about: string; reveal: string }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: modelId,
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  })
  const text =
    message.content[0]?.type === "text" ? message.content[0].text.trim() : ""
  const raw = text.startsWith("{") ? text : (text.match(/\{[\s\S]*\}/) ?? [])[0]
  if (!raw) throw new Error("LLM returned non-JSON response")
  const parsed = JSON.parse(raw) as { about: string; reveal: string }
  if (!parsed.about || !parsed.reveal)
    throw new Error("LLM response missing about or reveal")
  return parsed
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export type GenerateDraftInput = {
  register: Register
  subject: "someone" | "cause"
  topicId: string
  primaryCharityId?: string | null
}

export type GeneratedDraftResult = {
  about: string
  reveal: string
  fromCache: boolean
}

export async function generateDraft(
  input: GenerateDraftInput
): Promise<GeneratedDraftResult> {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  checkRateLimit(userId)

  const supabase = createAdminClient()
  const cacheKey = buildCacheKey(
    input.register,
    input.topicId,
    input.subject,
    input.primaryCharityId
  )

  const { data: cached } = await supabase
    .from("generated_drafts")
    .select("about, reveal")
    .eq("cache_key", cacheKey)
    .neq("status", "rejected")
    .maybeSingle()

  if (cached?.about && cached?.reveal) {
    return { about: cached.about, reveal: cached.reveal, fromCache: true }
  }

  const { data: topic, error: topicErr } = await supabase
    .from("topics")
    .select("title, topic_items(label)")
    .eq("id", input.topicId)
    .single()

  if (topicErr || !topic) throw new Error("Topic not found")
  const itemLabels: string[] = (
    (topic as { topic_items: { label: string }[] }).topic_items ?? []
  ).map((i) => i.label)

  let charityName: string | null = null
  let charityDescription: string | null = null
  if (input.subject === "cause" && input.primaryCharityId) {
    const { data: charity } = await supabase
      .from("charities")
      .select("name, description")
      .eq("id", input.primaryCharityId)
      .single()
    charityName = charity?.name ?? null
    charityDescription = charity?.description ?? null
  }

  const modelId = process.env.LLM_MODEL_ID ?? "claude-haiku-4-5-20251001"
  const prompt = buildPrompt({
    register: input.register,
    subject: input.subject,
    topicTitle: topic.title as string,
    itemLabels,
    charityName,
    charityDescription,
  })

  let parsed = await callLLM(prompt, modelId)

  // Validate and retry once if needed
  if (
    input.subject === "someone" &&
    !revealNamesRealItem(parsed.reveal, itemLabels)
  ) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (retry && revealNamesRealItem(retry.reveal, itemLabels)) parsed = retry
  } else if (input.subject === "cause" && hasFabricatedStats(parsed.reveal)) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (retry && !hasFabricatedStats(retry.reveal)) parsed = retry
  }

  await supabase.from("generated_drafts").insert({
    cache_key: cacheKey,
    register: input.register,
    topic_id: input.topicId,
    primary_charity_id: input.primaryCharityId ?? null,
    subject: input.subject,
    about: parsed.about,
    reveal: parsed.reveal,
    model: modelId,
    status: "generated",
  })

  return { about: parsed.about, reveal: parsed.reveal, fromCache: false }
}

// Exported for testing only
export { _rateLimitStore, RATE_LIMIT_MAX }
