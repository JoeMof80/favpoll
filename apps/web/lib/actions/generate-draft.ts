"use server"

import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Register } from "@favpoll/types"
import {
  checkRateLimit,
  incrementRateLimitCount,
  revealNamesRealItem,
  hasFabricatedStats,
  buildCacheKey,
} from "./generate-draft-utils"

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
    instructions = `Write for a charity fundraiser favpoll (${REGISTER_LABEL[register]}).
- "about": 1–2 sentences about the spirit of gathering and giving; do NOT name any specific charity.
- "reveal": 1 sentence that connects the charity's work to the poll topic. Ground it in the charity description${charityCtx ? " below" : ""}; do not invent statistics, specific numerical claims, or quotations.${charityCtx}`
  } else {
    const charityHint = charityName
      ? `\nThis favpoll raises funds for charity (do not name the charity).`
      : ""
    instructions = `Write for a person-honoured favpoll (${REGISTER_LABEL[register]}).
- "about": 1–2 sentences evoking the warmth of coming together and giving in someone's honour; do NOT name any specific charity.${charityHint}
- "reveal": 1 sentence that names the person's favourite from the poll options. You MUST use a real option from the list above — do not invent one.`
  }

  return `You are writing short copy for a charitable polling favpoll.
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
  /** Empty string for custom (organiser-created) topics. */
  topicId: string
  primaryCharityId?: string | null
  /** Required when topicId is empty — the organiser's custom topic title. */
  topicTitle?: string
  /** Required when topicId is empty — the organiser's custom item labels. */
  itemLabels?: string[]
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

  const isCustomTopic = !input.topicId

  // ── Custom topic: skip cache + DB fetch, call Claude directly ──────────────
  if (isCustomTopic) {
    const topicTitle = input.topicTitle
    if (!topicTitle) throw new Error("topicTitle required for custom topics")
    const itemLabels = input.itemLabels ?? []

    const supabase = createAdminClient()
    let charityName: string | null = null
    let charityDescription: string | null = null
    if (input.primaryCharityId) {
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
      topicTitle,
      itemLabels,
      charityName,
      charityDescription,
    })

    let parsed = await callLLM(prompt, modelId)

    // Only retry fabricated-stats check; skip item-name check when labels are
    // empty (no canonical list to validate against).
    if (input.subject === "cause" && hasFabricatedStats(parsed.reveal)) {
      const retry = await callLLM(prompt, modelId).catch(() => null)
      if (retry && !hasFabricatedStats(retry.reveal)) parsed = retry
    } else if (
      input.subject === "someone" &&
      itemLabels.length > 0 &&
      !revealNamesRealItem(parsed.reveal, itemLabels)
    ) {
      const retry = await callLLM(prompt, modelId).catch(() => null)
      if (retry && revealNamesRealItem(retry.reveal, itemLabels)) parsed = retry
    }

    incrementRateLimitCount(userId)
    return { about: parsed.about, reveal: parsed.reveal, fromCache: false }
  }

  // ── Canonical topic: cache lookup → DB fetch → generate → cache write ──────
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
    .select("title, favourites(label)")
    .eq("id", input.topicId)
    .single()

  if (topicErr || !topic) throw new Error("Topic not found")
  const itemLabels: string[] = (
    (topic as { favourites: { label: string }[] }).favourites ?? []
  ).map((i) => i.label)

  let charityName: string | null = null
  let charityDescription: string | null = null
  if (input.primaryCharityId) {
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

  incrementRateLimitCount(userId)
  return { about: parsed.about, reveal: parsed.reveal, fromCache: false }
}

// ---------------------------------------------------------------------------
// Safe wrapper — never throws; callers receive null on any failure
// ---------------------------------------------------------------------------

export async function safeGenerateDraft(
  input: GenerateDraftInput
): Promise<GeneratedDraftResult | null> {
  try {
    return await generateDraft(input)
  } catch (err) {
    console.error(
      "generateDraft failed, using fallback:",
      err instanceof Error ? err.message : String(err)
    )
    return null
  }
}
