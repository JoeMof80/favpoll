"use server"

import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DEFAULT_OCCASION_TYPE } from "@/lib/registers"
import { lookupEdges, type Edge, type StoryEdges } from "@/lib/pairing-table"
import type {
  CauseFamily,
  FavpollGrouping,
  Pronoun,
  Register,
} from "@favpoll/types"
import {
  checkRateLimit,
  RateLimitError,
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
  // Already possessive — leave it. firstNames() returns one whenever the
  // protagonist is named after an event ("Ben's Channel Swim" -> "Ben's"),
  // and the bare endsWith("s") rule then produced "Ben's'"
  // (founder-caught, 2026-09-23). The s-rule is still right for "James".
  if (/['\u2019]s?$/.test(name)) return name
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

/**
 * The charity's own words from the Commission register — raw text
 * (run-together sentences, bulleted lists), so it is a prompt SOURCE and
 * never copy to display. Collapsed and capped so a long entry cannot
 * crowd the rest of the prompt.
 */
function activitiesExcerpt(activities: string | null): string | null {
  const text = activities?.replace(/\s+/g, " ").trim()
  if (!text) return null
  return text.length > 600 ? `${text.slice(0, 600).trimEnd()}…` : text
}

/**
 * The edges, as text, for the prompt (pairing table §6). Told which
 * links exist, the model writes them in; told none exist, it supplies
 * E1′ — the known fact — instead of inventing a link.
 */
function edgesBlock(edges: StoryEdges, subject: "someone" | "cause"): string {
  const line = (label: string, edge: Edge | null) =>
    `- ${label}: ${edge ? edge.text : "none."}`
  const rows = [
    line("Occasion → topic", edges.e1),
    line("Charity → topic", edges.e2),
    ...(subject === "cause" ? [] : [line("Occasion ↔ charity", edges.e3)]),
  ]
  return `Why this favpoll hangs together — the EDGES. These are the only links between the occasion, the topic and the charity that you may state; never invent another.
${rows.join("\n")}`
}

function buildPrompt(opts: {
  register: Register
  subject: "someone" | "cause"
  occasionType: string | null
  topicTitle: string
  itemLabels: string[]
  charityName: string | null
  charityDescription: string | null
  charityActivities: string | null
  edges: StoryEdges
  pronoun?: Pronoun
  grouping?: FavpollGrouping
  displayName?: string | null
}): string {
  const {
    register,
    subject,
    occasionType,
    topicTitle,
    itemLabels,
    charityName,
    charityDescription,
    edges,
    pronoun,
    grouping,
    displayName,
  } = opts
  const activities = activitiesExcerpt(opts.charityActivities)
  // Purpose data, in order of trust: the curated description, then the
  // charity's own register text. Either lets the model say what the
  // charity does; neither means it must not.
  const hasPurpose = Boolean(charityDescription || activities)

  // A register-added charity arrives with NO description (seven on prod,
  // 2026-09-23). Passing the bare name let the model guess what "MAC Bevan
  // Charitable Trust" does — on a charity platform, an invented cause is a
  // truthfulness failure, not a style one. With no purpose data the charity
  // is named and nothing more. Since #934 most register-added charities
  // carry `activities` — their own words — which the prompt quotes and
  // bounds ("only in these terms").
  const ownWords = activities
    ? ` In its own words on the Charity Commission register: "${activities}".`
    : ""
  const charityLine = charityName
    ? charityDescription
      ? `Charity receiving the pledges: ${charityName} — ${charityDescription.replace(/\.\s*$/, "")}.${ownWords}`
      : activities
        ? `Charity receiving the pledges: ${charityName}.${ownWords} Describe its work only in those terms — nothing beyond them.`
        : `Charity receiving the pledges: ${charityName}. NOTHING is known here about what this charity does. Name it exactly as given and do NOT describe, characterise, or guess at its work, its cause, or who it helps — not even from its name.`
    : 'Charity: not yet chosen — say "charity" generically.'

  const voice = `You write short copy for favpoll, a UK charitable-giving platform used at real life events. Guests pledge money to charity and share favourites; after pledging, the protagonist's own favourite is revealed to them.
Voice: warm, plain, specific, quietly dignified. Short sentences. British English.
Never use: "vote", "voting", "choose", "choosing", "choice", "remarkable", "meaningful", "celebrate the life", "make a difference", exclamation marks, or any fundraising cliché. The money word is "pledge"; the selection word is "pick".`

  const context = `Occasion: ${REGISTER_LABEL[register]}.${occasionType ? ` Occasion type: ${occasionType}.` : ""}
Poll topic: Favourite ${topicTitle}. Options include: ${itemLabels.slice(0, 12).join(", ")}.
${charityLine}

${edgesBlock(edges, subject)}`

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
- "about" (max 2 sentences): first what this favpoll is raising for${hasPurpose ? "" : " (taken from the cause name above only — the charity's own work is unknown and must not be described)"}${edges.count > 0 ? ", with why THIS topic in a clause — say the edge listed above, plainly" : ""}, then the mechanic in ONE clause — guests pick their favourite ${topicTitle.toLowerCase()} and pledge to ${charityName ?? "the charity"}, where the pick and the pledge are a single action (the pick is made BY pledging). Never present them as separate steps: no "first…", "then…", "tell us…". favpoll takes no platform fee. Do NOT name or hint at any particular option, and do not repeat the context subline's wording.
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
    // An explicitly chosen he/she is the organiser SAYING there is a
    // person, and it outranks any guess made from the name's shape. The
    // guard used to win regardless, so a favpoll named after its event
    // ("Ben's Channel Swim") got "Theirs is …" with ♂ selected
    // (founder-caught, 2026-09-23). It still earns its place for
    // "they"/unset, which is the genuine appeal/fund/organisation case.
    const namedPerson = pronoun === "he" || pronoun === "she"
    const entityGuard =
      displayName && !namedPerson
        ? ` EXCEPTION: if "${displayName}" is clearly not an individual person (an appeal, fund, organisation, or event), there is no protagonist — open with "Theirs is" instead and keep the about free of personal pronouns.`
        : ""
    // A memorial's tense is the whole register: the opener's "was" is
    // computed above, but the model also wrote "has loved" and "still
    // reaches for it" until told the rule applies to EVERY sentence
    // (founder-caught, 2026-07-31). The other branch matters just as
    // much: without it a living protagonist got past-habitual copy
    // ("always went on it twice") that read elegiac — and, with the
    // old "long held" instruction, aged every protagonist up
    // (founder-caught, 2026-09-18: a child's celebration drafted as an
    // elderly lady's).
    const tenseRule =
      register === "remembering"
        ? ` The person is being remembered: every sentence about them — in the about AND the reveal detail — must be in the past tense (loved, was, would reach for). Never "has loved", "still does", or any present-tense habit.`
        : ` The person is living: their habits are in the present tense ("always goes", "still picks first"), never the past-habitual ("always went") — past tense makes them sound gone. Do not assume their age: no whole-life idioms ("since childhood", "all her life", "long held"). When the charity or occasion suggests who they are (a children's charity, a graduation), let that shape the detail; otherwise write habits that fit any age.`
    // What the about must do, by edge count (pairing table §6). At zero
    // edges the fact about the person IS the motivation — and it has to
    // be in the about, read before the pledge, not only in the reveal
    // (the Yvette case: a payoff with nothing in front of it).
    const topicLower = topicTitle.toLowerCase()
    const edgeRule =
      edges.count === 0
        ? ` NO edge links this occasion, this charity and this topic — so the about MUST supply the link itself: one plausible, specific fact about the person that makes a favourite ${topicLower} theirs (a habit, a place, a thing they always do), stated in the about before the invitation, not only in the reveal.`
        : edges.count === 1
          ? ` ONE edge links this favpoll (listed above): state it plainly in the about, and supply the other side yourself — a plausible, specific fact about the person that makes a favourite ${topicLower} theirs.`
          : edges.count === 2
            ? ` TWO edges link this favpoll (listed above): state both plainly in the about; you may add one known fact about the person to tighten it.`
            : ` All THREE edges link this favpoll (listed above): state them plainly in the about — the occasion, the topic and the charity in one breath — then invite.`
    const resonanceRule = ` Whatever the edge count, the about must add at least one fact about the PERSON that the edges do not already carry — an edge restated is legible but nobody's. The reveal's detail must pay off what the about set up: the two halves agree.`
    instructions = `- "about" (max 2 sentences): open with the PROTAGONIST'S connection to the topic — a favourite ${topicLower} that is distinctly theirs — teased WITHOUT naming or hinting at which option it is (the reveal is the gift).${tenseRule}${edgeRule}${resonanceRule} Then one short clause inviting the READER directly, in second person: pledge to ${charityName ?? "charity"} and pick your OWN favourite (say "you"/"your", never "guests"; never say they are guessing or voting on the protagonist's). Keep the charity to a mention${edges.e2 || edges.e3 ? " plus its edge" : ", not a description"} — this is about the person.${pronounHint}${nameHint}
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
  // The FIRST call used to be unguarded, so one bad response killed the
  // whole generation and the organiser saw nothing (founder, 2026-09-23).
  const first = await callLLM(prompt, modelId).catch(() => null)
  if (!first) {
    const rescue = await callLLM(prompt, modelId)
    return rescue
  }
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
    // NOT a budget — max_tokens is a CEILING, not a spend, so a high value
    // costs nothing extra; only generated tokens are billed. 512 was two
    // orders under the documented ~16000 default for non-streaming calls,
    // and it broke generation outright: prod runs claude-sonnet-5 (its
    // LLM_MODEL_ID is unset), where OMITTING `thinking` runs ADAPTIVE
    // thinking by default. The thinking block alone spent 700–2000 tokens,
    // the JSON was cut mid-object, the `{…}` match found nothing and the
    // whole generation threw — the organiser just saw a dead button.
    // Measured 2026-09-23 against a real favpoll: 0/3 parsed at 512,
    // 4/5 at 2048, 5/5 at 16000. Dev never saw it — .env.local pins
    // claude-haiku-4-5, which does no adaptive thinking.
    max_tokens: 16000,
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
  if (!raw)
    throw new Error(
      message.stop_reason === "max_tokens"
        ? "LLM response truncated at max_tokens before the JSON closed"
        : "LLM returned non-JSON response"
    )
  const parsed = JSON.parse(raw) as DraftFields
  if (!parsed.about || !parsed.reveal)
    throw new Error("LLM response missing about or reveal")
  return parsed
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

type CharityForPrompt = {
  name: string | null
  description: string | null
  activities: string | null
  /** The admin-CONFIRMED family — never the model's suggestion (#937). */
  causeFamily: CauseFamily | null
}

async function fetchCharity(
  supabase: ReturnType<typeof createAdminClient>,
  charityId: string | null | undefined
): Promise<CharityForPrompt> {
  const none: CharityForPrompt = {
    name: null,
    description: null,
    activities: null,
    causeFamily: null,
  }
  if (!charityId) return none
  const { data } = await supabase
    .from("charities")
    .select("name, description, activities, cause_family")
    .eq("id", charityId)
    .single()
  if (!data) return none
  return {
    name: data.name ?? null,
    description: data.description ?? null,
    activities: data.activities ?? null,
    causeFamily: (data.cause_family as CauseFamily | null | undefined) ?? null,
  }
}

/** The table key for the occasion: the caller's, else the register's
 *  default (which pairs with nothing). */
function resolveOccasionType(input: GenerateDraftInput): string | null {
  return input.occasionType?.trim() || DEFAULT_OCCASION_TYPE[input.register]
}

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
  /**
   * An `occasion_type` string (OCCASION_TYPES_BY_REGISTER) — the key for
   * the occasion's edges in the pairing table. The seed passes the one it
   * chose; the wizard has none (its occasion picker retired in #605), so
   * it falls back to the register's default, which pairs with nothing —
   * the zero-edge case, where the about must supply a known fact.
   */
  occasionType?: string | null
  /**
   * Re-roll (founder, 2026-09-18): bypass the shared cache read AND
   * write — repeat clicks of Generate must produce a fresh example, and
   * the regenerated copy is this form's alone. The cache keeps its one
   * draft as the first-click accelerator and the ghosts' source.
   */
  skipCache?: boolean
}

export type GeneratedDraftResult = {
  about: string
  note: string
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
    const charity = await fetchCharity(supabase, input.primaryCharityId)
    const occasionType = resolveOccasionType(input)

    const modelId = process.env.LLM_MODEL_ID ?? "claude-sonnet-5"
    const prompt = buildPrompt({
      register: input.register,
      subject: input.subject,
      occasionType,
      topicTitle,
      itemLabels,
      charityName: charity.name,
      charityDescription: charity.description,
      charityActivities: charity.activities,
      edges: lookupEdges({
        register: input.register,
        occasionType,
        topicTitle,
        charityName: charity.name,
        causeFamily: charity.causeFamily,
      }),
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
      // Boundary map: the LLM JSON keeps its "reveal" field (the prompt
      // is a tuned creative instrument); storage and code say note.
      note: parsed.reveal,
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
    input.grouping,
    resolveOccasionType(input)
  )

  if (!input.skipCache) {
    const { data: cached } = await supabase
      .from("generated_drafts")
      .select("about, note, cause_label, context")
      .eq("cache_key", cacheKey)
      .neq("status", "rejected")
      .maybeSingle()

    if (cached?.about && cached?.note) {
      return {
        about: cached.about,
        note: cached.note,
        causeLabel: cached.cause_label ?? null,
        context: cached.context ?? null,
        fromCache: true,
      }
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

  const charity = await fetchCharity(supabase, input.primaryCharityId)
  const occasionType = resolveOccasionType(input)
  const topicTitle = topic.title as string

  const modelId = process.env.LLM_MODEL_ID ?? "claude-sonnet-5"
  const prompt = buildPrompt({
    register: input.register,
    subject: input.subject,
    occasionType,
    topicTitle,
    itemLabels,
    charityName: charity.name,
    charityDescription: charity.description,
    charityActivities: charity.activities,
    edges: lookupEdges({
      register: input.register,
      occasionType,
      topicTitle,
      charityName: charity.name,
      causeFamily: charity.causeFamily,
    }),
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

  // A re-roll never writes: the cache row may already exist (unique
  // cache_key), and a personal re-roll must not replace the vetted
  // draft other organisers' ghosts read from.
  if (!input.skipCache)
    await supabase.from("generated_drafts").insert({
      cache_key: cacheKey,
      display_name: input.displayName ?? null,
      register: input.register,
      topic_id: input.topicId,
      primary_charity_id: input.primaryCharityId ?? null,
      subject: input.subject,
      about: parsed.about,
      note: parsed.reveal,
      cause_label: causeLabel,
      context,
      model: modelId,
      status: "generated",
    })

  incrementRateLimitCount(userId)
  return {
    about: parsed.about,
    note: parsed.reveal,
    causeLabel,
    context,
    fromCache: false,
  }
}

// ---------------------------------------------------------------------------
// Safe wrapper — never throws; callers receive null on any failure
// ---------------------------------------------------------------------------

/** Why a generation failed, so the UI can say something true. */
export type GenerateDraftFailure = { error: "rate_limit" | "failed" }

/**
 * Never throws across the server-action boundary — Next replaces thrown
 * error messages with an opaque digest in production, so the reason has to
 * travel as a RETURN value or it is lost.
 *
 * This used to return plain `null` and the wizard dropped it on the floor:
 * a failed Generate looked identical to nothing happening, with no toast
 * and no message (founder hit exactly this, 2026-09-23).
 */
export async function safeGenerateDraft(
  input: GenerateDraftInput
): Promise<GeneratedDraftResult | GenerateDraftFailure> {
  try {
    return await generateDraft(input)
  } catch (err) {
    const rateLimited =
      err instanceof RateLimitError ||
      (err instanceof Error && err.name === "RateLimitError")
    console.error(
      "generateDraft failed, using fallback:",
      err instanceof Error ? err.message : String(err)
    )
    return { error: rateLimited ? "rate_limit" : "failed" }
  }
}

/**
 * CACHE-ONLY draft lookup for the Story step's ghost prefetch (founder,
 * 2026-09-17): contextual placeholders when a cached draft exists,
 * static ghosts when not — NEVER a model call. Fired as soon as the
 * calibration set is complete (the cache key needs the name, typed on
 * the Info step), so the read lands before the Story step renders.
 * Custom topics are excluded by the caller (empty topicId would collide
 * in the key).
 */
export async function getCachedDraftGhosts(
  input: GenerateDraftInput
): Promise<{ about: string; note: string } | null> {
  const { userId } = await auth()
  if (!userId) return null
  const supabase = createAdminClient()
  const cacheKey = buildCacheKey(
    input.register,
    input.topicId,
    input.subject,
    input.primaryCharityId,
    input.pronoun,
    input.displayName,
    input.grouping,
    resolveOccasionType(input)
  )
  const { data: cached } = await supabase
    .from("generated_drafts")
    .select("about, note")
    .eq("cache_key", cacheKey)
    .neq("status", "rejected")
    .maybeSingle()
  if (cached?.about && cached?.note) {
    return { about: cached.about, note: cached.note }
  }

  // NAME-AGNOSTIC FALLBACK (founder, 2026-09-18): the key's name-hash
  // siloed the cache per name, so the exact lookup almost always
  // missed. Drafts are written NAME-FREE by design, so the ghost can
  // safely borrow any name's draft for the same shape. Pronoun and
  // grouping stay in the prefix — the copy genuinely inflects on both,
  // and a wrong-pronoun ghost about YOUR person would read broken.
  // Generation keeps its strict per-name key (the model's tone
  // judgement depends on the name); only this read relaxes.
  // Drafts BAKE THE NAME IN ("Marcus' is Porridge" — the house reveal
  // pattern is name-first), so a borrowed draft must have its stored
  // name swapped for the current one. Rows without a stored name
  // (pre-2026-09-18) are skipped — the cache refreshes as people
  // generate.
  const namePrefix = cacheKey.slice(0, cacheKey.lastIndexOf(":") + 1)
  const { data: sibling } = await supabase
    .from("generated_drafts")
    .select("about, note, display_name")
    .like("cache_key", `${namePrefix}%`)
    .neq("status", "rejected")
    .not("display_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (sibling?.about && sibling?.note) {
    const from = (sibling.display_name ?? "").trim()
    const to = (input.displayName ?? "").trim()
    const swap = (text: string) =>
      from && to ? text.split(from).join(to) : text
    return { about: swap(sibling.about), note: swap(sibling.note) }
  }
  return null
}
