"use server"

import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Pronoun, Register } from "@favpoll/types"
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
  remembering: "a memorial — someone being remembered",
  celebrating_one: "a celebration of one person",
  celebrating_many: "a celebration of a couple or group",
  cause: "a charitable cause, no individual protagonist",
  neutral: "a general occasion",
}

// The reveal's opening words are computed HERE, not left to the model —
// the grammar is a brand rule (see the favpoll-brand skill): possessive +
// tense by register, then the favourite, then ONE concrete detail.
// When we have the protagonist's name the possessive IS the name
// ("Donald's is …") — warmer than a pronoun, and safe because the cache
// is keyed per-name (v3). Falls back to Hers/His/Theirs without one.
function firstNames(displayName: string): string {
  const words = displayName.trim().split(/\s+/)
  if (words.length <= 1) return displayName.trim()
  // "Derek & Emma Underhill" → "Derek & Emma"; "Roy Mansfield" → "Roy"
  return displayName.includes("&") ? words.slice(0, -1).join(" ") : words[0]
}

function revealOpener(
  register: Register,
  pronoun?: Pronoun,
  displayName?: string | null
): string {
  const tense = register === "remembering" ? "was" : "is"
  if (displayName?.trim()) {
    const name = firstNames(displayName)
    const poss = name.endsWith("s") ? `${name}'` : `${name}'s`
    return `${poss} ${tense}`
  }
  const poss = pronoun === "she" ? "Hers" : pronoun === "he" ? "His" : "Theirs"
  return `${poss} ${tense}`
}

function buildPrompt(opts: {
  register: Register
  subject: "someone" | "cause"
  topicTitle: string
  itemLabels: string[]
  charityName: string | null
  charityDescription: string | null
  pronoun?: Pronoun
  displayName?: string | null
}): string {
  const {
    register,
    subject,
    topicTitle,
    itemLabels,
    charityName,
    charityDescription,
    pronoun,
    displayName,
  } = opts

  const charityLine = charityName
    ? `Charity receiving the pledges: ${charityName}${charityDescription ? ` — ${charityDescription}` : ""}.`
    : 'Charity: not yet chosen — say "charity" generically.'

  const voice = `You write short copy for favpoll, a UK charitable-giving platform used at real life events. Guests pledge money to charity and share favourites; after pledging, the protagonist's own favourite is revealed to them.
Voice: warm, plain, specific, quietly dignified. Short sentences. British English.
Never use: "vote", "voting", "remarkable", "meaningful", "celebrate the life", "make a difference", exclamation marks, or any fundraising cliché. The money word is "pledge".`

  const context = `Occasion: ${REGISTER_LABEL[register]}.
Poll topic: Favourite ${topicTitle}. Options include: ${itemLabels.slice(0, 12).join(", ")}.
${charityLine}`

  let instructions: string
  if (subject === "cause") {
    instructions = `- "about" (max 2 sentences): what this favpoll is raising for and that every pledge reaches ${charityName ?? "the charity"} in full. Mention the topic ("favourite ${topicTitle.toLowerCase()}") naturally. Do NOT name or hint at any particular option.
- "reveal" (guests see it only AFTER pledging): start with exactly "Our pick to start:" then a real option from the list, then " — " and one short, warm clause. No statistics, numbers, percentages, or invented quotes.`
  } else {
    const opener = revealOpener(register, pronoun, displayName)
    const pronounHint = pronoun
      ? ` Use "${pronoun}" pronouns for the person.`
      : ""
    const nameHint = displayName
      ? `\nThe protagonist is called "${displayName}". The reveal opener below already contains the name — do not repeat it elsewhere; the about uses pronouns only (the page shows the name above it).`
      : ""
    const entityGuard = displayName
      ? ` EXCEPTION: if "${displayName}" is clearly not an individual person (an appeal, fund, organisation, or event), there is no protagonist — open with "Theirs is" instead and keep the about free of personal pronouns.`
      : ""
    instructions = `- "about" (max 2 sentences): what this gathering is and that pledges go to ${charityName ?? "charity"}. Mention the topic ("favourite ${topicTitle.toLowerCase()}") naturally. Guests pledge and pick their OWN favourite — never say they are guessing or voting on the protagonist's.${pronounHint} Do NOT name or hint at which option is the favourite — the reveal is the gift.${nameHint}
- "reveal" (guests see it only AFTER pledging): start with exactly "${opener}".${entityGuard} Then a plausible option from the list (you MUST use a real option, verbatim), then a full stop, then ONE short sentence with a single concrete detail about the PROTAGONIST'S relationship to that favourite — a habit, a memory, a ritual of theirs. The options may be famous real people or works: NEVER state or invent a biographical fact about them; the detail belongs to the protagonist, not the favourite. No preamble such as "We can't wait to reveal".`
  }

  return `${voice}

${context}

Write:
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
    // headroom for models that emit a thinking block before the text
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  })
  // The text block is not always content[0] — newer models may lead with
  // a thinking block, which used to fail this as "non-JSON"
  const textBlock = message.content.find(
    (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
      c.type === "text"
  )
  const text = textBlock?.text.trim() ?? ""
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
  pronoun?: Pronoun
  /** Protagonist name or cause label — prompt context only, never cached into copy. */
  displayName?: string | null
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

    const modelId = process.env.LLM_MODEL_ID ?? "claude-sonnet-5"
    const prompt = buildPrompt({
      register: input.register,
      subject: input.subject,
      topicTitle,
      itemLabels,
      charityName,
      charityDescription,
      pronoun: input.subject === "someone" ? input.pronoun : undefined,
      displayName: input.displayName ?? null,
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
    input.primaryCharityId,
    input.pronoun,
    input.displayName
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

  const modelId = process.env.LLM_MODEL_ID ?? "claude-sonnet-5"
  const prompt = buildPrompt({
    register: input.register,
    subject: input.subject,
    topicTitle: topic.title as string,
    itemLabels,
    charityName,
    charityDescription,
    pronoun: input.subject === "someone" ? input.pronoun : undefined,
    displayName: input.displayName ?? null,
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
