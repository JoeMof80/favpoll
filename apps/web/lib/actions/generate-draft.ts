"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DEFAULT_OCCASION_TYPE } from "@/lib/registers"
import { generateStory, type StoryCharity } from "@/lib/story-engine"
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
  buildCacheKey,
} from "./generate-draft-utils"

// The prompt, the model call and the validators live in lib/story-engine
// — the ONE generator the wizard and the seed share (pairing table §6).
// This file is the wizard's caller: auth, rate limit, cache.
// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

async function fetchCharity(
  supabase: ReturnType<typeof createAdminClient>,
  charityId: string | null | undefined
): Promise<StoryCharity> {
  const none: StoryCharity = {
    name: null,
    description: null,
    activities: null,
    causeFamily: null,
  }
  if (!charityId) return none
  const { data } = await supabase
    .from("charities")
    .select("name, description, activities, cause_family, objects, areas")
    .eq("id", charityId)
    .single()
  if (!data) return none
  return {
    name: data.name ?? null,
    description: data.description ?? null,
    activities: data.activities ?? null,
    causeFamily: (data.cause_family as CauseFamily | null | undefined) ?? null,
    objects: (data.objects as string | null | undefined) ?? null,
    areas:
      (data.areas as { area: string; type: string }[] | null | undefined) ??
      null,
  }
}

const modelId = () => process.env.LLM_MODEL_ID ?? "claude-sonnet-5"

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

    const story = await generateStory(
      {
        register: input.register,
        subject: input.subject,
        occasionType,
        topicTitle,
        itemLabels,
        charity,
        pronoun: input.pronoun,
        grouping: input.grouping,
        displayName: input.displayName ?? null,
      },
      modelId()
    )

    incrementRateLimitCount(userId)
    return {
      about: story.about,
      note: story.note,
      causeLabel: story.causeLabel,
      context: story.context,
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

  const story = await generateStory(
    {
      register: input.register,
      subject: input.subject,
      occasionType,
      topicTitle,
      itemLabels,
      charity,
      pronoun: input.pronoun,
      grouping: input.grouping,
      displayName: input.displayName ?? null,
    },
    modelId()
  )
  const { causeLabel, context } = story

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
      about: story.about,
      note: story.note,
      cause_label: causeLabel,
      context,
      model: modelId,
      status: "generated",
    })

  incrementRateLimitCount(userId)
  return {
    about: story.about,
    note: story.note,
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
