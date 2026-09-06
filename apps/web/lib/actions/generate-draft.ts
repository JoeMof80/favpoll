"use server"

import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { FavpollGrouping, Pronoun, Register } from "@favpoll/types"
import {
  checkRateLimit,
  incrementRateLimitCount,
  revealNamesRealItem,
  hasFabricatedStats,
  violatesCopyRules,
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
  // "Derek & Emma Underhill" → "Derek & Emma"; "Joan & Arthur" stays
  // whole (no surname to drop); "Roy Mansfield" → "Roy"
  if (displayName.includes("&")) {
    return words.length >= 4 ? words.slice(0, -1).join(" ") : displayName.trim()
  }
  return words[0]
}

function possessive(name: string): string {
  return name.endsWith("s") ? `${name}'` : `${name}'s`
}

/** "Sylvia's" from "Sylvia Cranfield", or null without a usable name. */
function namePossessive(displayName?: string | null): string | null {
  if (!displayName?.trim()) return null
  return possessive(firstNames(displayName))
}

function revealOpener(
  register: Register,
  pronoun?: Pronoun,
  displayName?: string | null
): string {
  const tense = register === "remembering" ? "was" : "is"
  const named = namePossessive(displayName)
  if (named) return `${named} ${tense}`
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
  grouping?: FavpollGrouping
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
    grouping,
    displayName,
  } = opts

  const charityLine = charityName
    ? `Charity receiving the pledges: ${charityName}${charityDescription ? ` — ${charityDescription}` : ""}.`
    : 'Charity: not yet chosen — say "charity" generically.'

  const voice = `You write short copy for favpoll, a UK charitable-giving platform used at real life events. Guests pledge money to charity and share favourites; after pledging, the protagonist's own favourite is revealed to them.
Voice: warm, plain, specific, quietly dignified. Short sentences. British English.
Never use: "vote", "voting", "choose", "choosing", "choice", "remarkable", "meaningful", "celebrate the life", "make a difference", exclamation marks, or any fundraising cliché. The money word is "pledge"; the selection word is "pick".`

  const context = `Occasion: ${REGISTER_LABEL[register]}.
Poll topic: Favourite ${topicTitle}. Options include: ${itemLabels.slice(0, 12).join(", ")}.
${charityLine}`

  let instructions: string
  if (subject === "cause") {
    // Causes have no protagonist, so the generator also fills the hero's
    // empty fields: a cause name (only when the organiser hasn't set one)
    // and a short context line (normalised structure, 2026-07-30).
    const hasLabel = Boolean(displayName?.trim())
    // The cause name renders directly beneath a deterministic opening line
    // ("In support of", "Raising for", …) the model never sees — so the
    // name must read naturally after such words and must not echo them
    // (founder-caught, 2026-07-30: "In support of / Support for Dogs in
    // Need").
    const causeLabelInstruction = hasLabel
      ? ""
      : `- "causeLabel": a short name for what is being raised for — 2 to 5 plain words, no charity name, no punctuation (like "Help the Homeless" or "Warm Plates This Winter"). It appears directly BELOW a heading such as "In support of" or "Raising for", so it must read naturally after those words and must NOT contain "support", "supporting", "raising", or "aid of".\n`
    const labelContext = hasLabel
      ? `The organiser calls this cause "${displayName!.trim()}" — write around that name; do not rename it.\n`
      : ""
    instructions = `${labelContext}${causeLabelInstruction}- "context" (max 40 characters): one short subline for under the cause name, giving a timeframe or who it helps — like "Winter 2026 appeal" or "For families facing hardship". It must NOT contain the charity's name in any form (the charity is already shown beside it), and must NOT mention pledges, money, or where the money goes — the about owns that. No full stop.
- "about" (max 2 sentences): first what this favpoll is raising for, then the mechanic in ONE clause — guests pick their favourite ${topicTitle.toLowerCase()} and pledge to ${charityName ?? "the charity"}, where the pick and the pledge are a single action (the pick is made BY pledging). Never present them as separate steps: no "first…", "then…", "tell us…". favpoll takes no platform fee. Do NOT name or hint at any particular option, and do not repeat the context subline's wording.
- "reveal" (guests see it only AFTER pledging): start with exactly "Our pick to start:" then a real option from the list, then " — " and one short, warm clause. No statistics, numbers, percentages, or invented quotes.`
  } else {
    const opener = revealOpener(register, pronoun, displayName)
    // Pair/Group are structural (founder bug, 2026-09-06: the generator
    // wrote "him/his" for a pair because plurality never reached it).
    const plural = grouping === "couple" || grouping === "group"
    const pronounHint = plural
      ? ` The favpoll honours ${grouping === "couple" ? "a PAIR — two people together" : "a GROUP of people"}: use "they/them/their" and plural agreement in every sentence ("their favourite", "they have loved"), and treat the name as referring to ${grouping === "couple" ? "both of them" : "all of them"}, never one individual.`
      : pronoun
        ? ` Use "${pronoun}" pronouns for the person.`
        : ""
    const namePoss = namePossessive(displayName)
    const nameHint = namePoss
      ? `\nThe protagonist is called "${displayName}". In the about, use pronouns — EXCEPT the reveal promise, which names them once: end the invitation with a clause like "and ${namePoss} will be revealed" or "and we'll reveal ${namePoss}". The reveal opener below already contains the name — never repeat it beyond these two places.`
      : ""
    const entityGuard = displayName
      ? ` EXCEPTION: if "${displayName}" is clearly not an individual person (an appeal, fund, organisation, or event), there is no protagonist — open with "Theirs is" instead and keep the about free of personal pronouns.`
      : ""
    // A memorial's tense is the whole register: the opener's "was" is
    // computed above, but the model also wrote "has loved" and "still
    // reaches for it" until told the rule applies to EVERY sentence
    // (founder-caught, 2026-07-31).
    const tenseRule =
      register === "remembering"
        ? ` The person is being remembered: every sentence about them — in the about AND the reveal detail — must be in the past tense (loved, was, would reach for). Never "has loved", "still does", or any present-tense habit.`
        : ""
    instructions = `- "about" (max 2 sentences): open with the PROTAGONIST'S connection to the topic — a favourite ${topicTitle.toLowerCase()}, long held, part of who they are — teased WITHOUT naming or hinting at which option it is (the reveal is the gift).${tenseRule} Then one short clause inviting the READER directly, in second person: pledge to ${charityName ?? "charity"} and pick your OWN favourite (say "you"/"your", never "guests"; never say they are guessing or voting on the protagonist's). Keep the charity to a mention, not a description — this is about the person.${pronounHint}${nameHint}
- "reveal" (guests see it only AFTER pledging): start with exactly "${opener}".${entityGuard} Then a plausible option from the list (you MUST use a real option, verbatim), then a full stop, then ONE short sentence with a single concrete detail about the PROTAGONIST'S relationship to that favourite — a habit, a memory, a ritual of theirs.${tenseRule} The detail must be entirely the protagonist's own and must NOT depend on any real-world fact about the favourite: no fixture dates or match traditions, no seasons, tours, episodes, eras, or biography (a claim like "watched them play on Boxing Day" fails if that favourite doesn't play then — avoid the whole category). The options may be famous real people, teams, or works: never state or invent facts about them. No preamble such as "We can't wait to reveal".`
  }

  const responseShape =
    subject === "cause"
      ? displayName?.trim()
        ? '{"context":"...","about":"...","reveal":"..."}'
        : '{"causeLabel":"...","context":"...","about":"...","reveal":"..."}'
      : '{"about":"...","reveal":"..."}'

  return `${voice}

${context}

Write:
${instructions}

Respond with ONLY valid JSON, no markdown, no explanation:
${responseShape}`
}

// ---------------------------------------------------------------------------
// LLM call
// ---------------------------------------------------------------------------

type DraftFields = {
  about: string
  reveal: string
  /** Cause favpolls only — present when the organiser hasn't named the cause. */
  causeLabel?: string
  /** Cause favpolls only. */
  context?: string
}

/** One retry when the copy breaks a hard brand rule ("choose"/"vote"). */
async function callLLMWithCopyCheck(
  prompt: string,
  modelId: string
): Promise<DraftFields> {
  const first = await callLLM(prompt, modelId)
  if (!violatesCopyRules(`${first.about} ${first.reveal}`)) return first
  const retry = await callLLM(prompt, modelId).catch(() => null)
  return retry && !violatesCopyRules(`${retry.about} ${retry.reveal}`)
    ? retry
    : first
}

async function callLLM(prompt: string, modelId: string): Promise<DraftFields> {
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
  const parsed = JSON.parse(raw) as DraftFields
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
  /** Pair/Group plurality — structural for the copy's agreement. */
  grouping?: FavpollGrouping
  /** Protagonist name or cause label — prompt context only, never cached into copy. */
  displayName?: string | null
}

export type GeneratedDraftResult = {
  about: string
  reveal: string
  /** Cause favpolls only — suggested cause name when none was set. */
  causeLabel?: string | null
  /** Cause favpolls only — suggested context subline. */
  context?: string | null
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
      grouping: input.subject === "someone" ? input.grouping : undefined,
      displayName: input.displayName ?? null,
    })

    let parsed = await callLLMWithCopyCheck(prompt, modelId)

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
    return {
      about: parsed.about,
      reveal: parsed.reveal,
      // Defensive caps match the form schema (causeLabel 60, context 40)
      causeLabel: parsed.causeLabel?.trim().slice(0, 60) || null,
      context: parsed.context?.trim().slice(0, 40) || null,
      fromCache: false,
    }
  }

  // ── Canonical topic: cache lookup → DB fetch → generate → cache write ──────
  const supabase = createAdminClient()
  const cacheKey = buildCacheKey(
    input.register,
    input.topicId,
    input.subject,
    input.primaryCharityId,
    input.pronoun,
    input.displayName,
    input.grouping
  )

  const { data: cached } = await supabase
    .from("generated_drafts")
    .select("about, reveal, cause_label, context")
    .eq("cache_key", cacheKey)
    .neq("status", "rejected")
    .maybeSingle()

  if (cached?.about && cached?.reveal) {
    return {
      about: cached.about,
      reveal: cached.reveal,
      causeLabel: cached.cause_label ?? null,
      context: cached.context ?? null,
      fromCache: true,
    }
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
    grouping: input.subject === "someone" ? input.grouping : undefined,
    displayName: input.displayName ?? null,
  })

  let parsed = await callLLMWithCopyCheck(prompt, modelId)

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

  // Defensive caps match the form schema (causeLabel 60, context 40)
  const causeLabel = parsed.causeLabel?.trim().slice(0, 60) || null
  const context = parsed.context?.trim().slice(0, 40) || null

  await supabase.from("generated_drafts").insert({
    cache_key: cacheKey,
    register: input.register,
    topic_id: input.topicId,
    primary_charity_id: input.primaryCharityId ?? null,
    subject: input.subject,
    about: parsed.about,
    reveal: parsed.reveal,
    cause_label: causeLabel,
    context,
    model: modelId,
    status: "generated",
  })

  incrementRateLimitCount(userId)
  return {
    about: parsed.about,
    reveal: parsed.reveal,
    causeLabel,
    context,
    fromCache: false,
  }
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
