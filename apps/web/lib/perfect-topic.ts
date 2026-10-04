import Anthropic from "@anthropic-ai/sdk"
import { recordSpend, spendAvailable } from "@/lib/model-spend"

/** THE BETTER MODEL, deliberately (decision 4 of the charity-profiles
 *  note, measured 2026-10-04): over the gold set Sonnet and Haiku both
 *  score 27/33, but Haiku offered "Children's book" to the NSPCC and to
 *  Save the Children, while Sonnet refused all 21 charities that must have
 *  none. A missed topic costs a click; that costs the relationship.
 *
 *  Its OWN env var, not `LLM_MODEL_ID`. That one is the Story generator's,
 *  and it is pinned to a Haiku id on dev and set in production too — so
 *  reading it here meant a cost decision about Story copy silently
 *  reassigned this judgement to the model the measurement rejected. Model
 *  per task, not per pipeline: the saving belongs on the summarising work
 *  either side (lib/charity-events.ts), never on the none/not-none call. */
export const PERFECT_TOPIC_MODEL = () =>
  process.env.LLM_JUDGEMENT_MODEL_ID ?? "claude-sonnet-5"
import type { CauseFamily } from "@favpoll/types"

// A charity's PERFECT TOPIC (founder, 2026-09-25): the one favourite a
// guest sees the point of before pledging — "of course Dogs Trust asks my
// favourite dog breed", "of course a rivers charity asks my favourite
// river". Mined from the register's objects and activities, matched to
// the catalogue first, SUGGESTED by the model and CONFIRMED by an admin
// in the outreach queue, then offered to the charity in the welcome
// email, whose reply outranks ours. Many charities honestly have none (a
// hospice, a grant-maker, a general research charity): the suggestion is
// null and the reason says why, so the admin is not tempted to force one.
//
// The generator reads only the CONFIRMED topic (charities.perfect_topic_id),
// as a starred charity→topic edge (lib/pairing-table.ts).

export type PerfectTopicInput = {
  name: string
  activities: string | null
  objects: string | null
  causeFamily: CauseFamily | null
  grantMaking: boolean | null
  areas?: { area: string; type: string }[] | null
  /** For the spend ledger: which charity the money went on, and the
   *  outreach wave it was spent for. */
  registeredNumber?: string | null
  wave?: string | null
  /** The live catalogue: every active topic with a few of its items and
   *  its approved SUBSETS (favpoll-topic-rules §1), which the model may
   *  name instead of inventing a list. */
  topics: {
    id: string
    title: string
    isFinite: boolean
    items: string[]
    subsets?: { id: string; title: string; items: string[] }[]
  }[]
}

export type PerfectTopicSuggestion = {
  /** The matching catalogue topic, or null when none fits. */
  topicId: string | null
  /** An existing approved SUBSET of that topic, when the cause pulls for
   *  one (a city farm → Farm animal). Confirmed beside the topic. */
  subsetId: string | null
  /** When no existing subset fits but the cause plainly pulls for one:
   *  a NAMED proposal (topic grammar) with labels from the topic's list,
   *  written as a proposed `topic_subsets` row for the admin's door on
   *  /subsets (ruling 2) — never the charity's private list. Null means
   *  the whole list, or an existing subset (subsetId) fits. */
  proposedSubset: { title: string; items: string[] } | null
  /** One plain sentence: why it is theirs (for the welcome email), why
   *  none fits, or the new topic proposed for the topic-rules audit. */
  reason: string
}

function buildPrompt(input: PerfectTopicInput): string {
  const catalogue = input.topics
    .map(
      (t) =>
        `${t.title} (${t.isFinite ? "closed" : "open"}: ${t.items.slice(0, 12).join(", ")}${t.items.length > 12 ? ", …" : ""})${
          t.subsets?.length
            ? ` — subsets: ${t.subsets.map((s) => s.title).join(", ")}`
            : ""
        }`
    )
    .join("\n")
  const areas = (input.areas ?? [])
    .map((a) => a.area)
    .slice(0, 6)
    .join(", ")
  return `favpoll is a fundraising page: guests pledge to a charity by picking their favourite of something (their favourite bird, song, beach). A charity's PERFECT TOPIC is the one a guest sees the point of before pledging: "of course Dogs Trust asks my favourite dog breed", "of course a rivers charity asks my favourite river", "of course the lifeboats ask my favourite beach", "of course a comedy fundraiser asks my favourite comedian". The pick must resonate with the cause: what the charity protects or works with (rivers, dogs, gardens, the coast), what its supporters love, or what its work is known for. It must NOT be about illness, disability, need, poverty or grief themselves, and never a topic that makes a guest think about the condition. A topic reached for only because a favourite is comforting (a song for a crisis line, a saying for an older-people charity, a hobby for a mental-health charity) is not the charity's own: answer none. Some charities honestly have none: a hospice, a grant-maker, a general medical research charity, a crisis line, a charity for a condition with no natural favourite. Say so rather than force one; a dementia charity and Song ("music is the last thing to go") is the rare exception, and it does not transfer to other conditions.

The charity, from the Charity Commission register:
Name: ${input.name}
Cause family (admin-confirmed): ${input.causeFamily ?? "none"}
Objects: ${(input.objects ?? "").slice(0, 900) || "(none on the register)"}
Activities: ${(input.activities ?? "").slice(0, 700) || "(none on the register)"}
Works in: ${areas || "unknown"}
Grant-maker as main activity: ${input.grantMaking ? "yes" : "no"}

The favpoll catalogue (topic, then a few of its items):
${catalogue}

When the cause pulls for a NARROWER list than the topic's (a city farm wants Cow, Pig, Sheep and Goat from Animal, not Lion and Panda; a woodland charity wants native trees), prefer one of the topic's listed SUBSETS by name when it is the charity's corner (a city farm → Farm animal); only when none of them fits, PROPOSE one — a name in topic grammar (singular, basic level, reads after "Favourite") and its items: the items from that topic's list the charity would want to pick from, verbatim from the list, 6 to 16 of them, and only when the narrowing is the charity's own (an air ambulance flies one helicopter: no subset of military aircraft). A narrower slice is never a new topic.

Rules for a NEW topic, if nothing in the catalogue fits: ordinary people must have a favourite of it and be able to name several without expertise; its items sit at the basic level (Falcon, not Peregrine falcon; not "bird of prey"); different guests would pick different ones. Prefer an existing topic whenever it honestly fits; propose a new one only when the cause is specific and the catalogue has no home for it, and never when its items already sit in an existing topic's list.

Answer with JSON only:
{"existing": "<catalogue topic title exactly, or null>", "existing_reason": "<one plain sentence addressed to the charity, for the welcome email: why this topic is theirs>", "subset": "<one of that topic's listed subsets, exactly, when the cause pulls for it; else null>", "subset_title": "<the proposed subset's name when proposing one; else null>", "subset_items": ["<items from that topic's list, only when a narrower list fits the cause; else []>"], "new_topic": "<a new topic title or null>", "new_items": ["<8 to 12 basic-level items>"] or null, "new_reason": "<why the catalogue has no home for it, or null>", "none_reason": "<if no perfect topic exists, one sentence why; else null>"}`
}

/** The model's suggestion. Never throws; null when nothing can be said. */
export async function suggestPerfectTopic(
  input: PerfectTopicInput
): Promise<PerfectTopicSuggestion | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!input.activities && !input.objects) return null
  if (input.topics.length === 0) return null
  // THE CAP (decision 4) is checked where the model is called, so a wave
  // and an admin's click are held to the same budget.
  if (!(await spendAvailable())) {
    console.warn("[perfect-topic] the model spend cap is reached — skipped")
    return null
  }
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model = PERFECT_TOPIC_MODEL()
    const message = await client.messages.create({
      model,
      max_tokens: 800,
      messages: [{ role: "user", content: buildPrompt(input) }],
    })
    void recordSpend({
      task: "perfect_topic",
      model,
      usage: message.usage,
      registeredNumber: input.registeredNumber ?? null,
      wave: input.wave ?? null,
    })
    const text =
      message.content.find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )?.text ?? ""
    const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      existing?: string | null
      existing_reason?: string | null
      subset?: string | null
      subset_title?: string | null
      subset_items?: string[] | null
      new_topic?: string | null
      new_items?: string[] | null
      new_reason?: string | null
      none_reason?: string | null
    }
    const norm = (s: string) => s.trim().toLowerCase()
    // The reason is quoted in the welcome email and the prompt: no em
    // dashes there (the copy rule), never "aircraft—and the helicopter—".
    const plain = (s: string | null | undefined) =>
      (s ?? "")
        .replace(/\s*—\s*/g, ", ")
        .replace(/,\s*,/g, ",")
        .trim()
    const match = parsed.existing
      ? input.topics.find((t) => norm(t.title) === norm(parsed.existing!))
      : undefined
    if (match) {
      // An existing approved subset, named exactly, beats an invented list.
      const subset = parsed.subset
        ? (match.subsets ?? []).find(
            (s) => norm(s.title) === norm(parsed.subset!)
          )
        : undefined
      // Otherwise the list keeps only labels really on the topic's list —
      // a hint for the admin to propose a subset, never written as one.
      const onList = new Map(match.items.map((l) => [norm(l), l]))
      const items = subset
        ? []
        : (parsed.subset_items ?? [])
            .map((l) => onList.get(norm(String(l))))
            .filter((l): l is string => Boolean(l))
      const proposed =
        !subset &&
        parsed.subset_title &&
        items.length >= 6 &&
        items.length < match.items.length
          ? {
              title: String(parsed.subset_title).trim().replace(/\s+/g, " "),
              items,
            }
          : null
      return {
        topicId: match.id,
        subsetId: subset?.id ?? null,
        proposedSubset: proposed?.title ? proposed : null,
        reason:
          plain(parsed.existing_reason) ||
          `${match.title} is the favourite closest to what ${input.name} does.`,
      }
    }
    if (parsed.new_topic) {
      const items = (parsed.new_items ?? []).slice(0, 12).join(", ")
      return {
        topicId: null,
        subsetId: null,
        proposedSubset: null,
        reason: `Proposed new topic "${parsed.new_topic}"${items ? ` (${items})` : ""}: ${plain(parsed.new_reason) || "nothing in the catalogue fits"}. Needs the topic-rules audit before it exists.`,
      }
    }
    return {
      topicId: null,
      subsetId: null,
      proposedSubset: null,
      reason:
        plain(parsed.none_reason) || "No favourite honestly fits this cause.",
    }
  } catch (err) {
    console.error(
      "suggestPerfectTopic failed:",
      err instanceof Error ? err.message : err
    )
    return null
  }
}

/** The catalogue in the shape the suggester wants, from the rows the
 *  callers already load (topics with their favourites). */
export function catalogueForSuggestion(
  topics: {
    id: string
    title: string
    is_finite: boolean
    favourites?: { label: string; is_canonical?: boolean }[] | null
    /** Embedded `topic_subsets(...)`; only approved, listed ones count. */
    topic_subsets?:
      | {
          id: string
          title: string
          status?: string
          is_active?: boolean
          topic_subset_items?:
            | { favourites: { label: string } | { label: string }[] | null }[]
            | null
        }[]
      | null
  }[]
): PerfectTopicInput["topics"] {
  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    isFinite: t.is_finite,
    // The whole list, so a subset can name any item on it; the prompt
    // shows the first few.
    items: (t.favourites ?? []).map((f) => f.label),
    subsets: (t.topic_subsets ?? [])
      .filter(
        (s) => (s.status ?? "approved") === "approved" && s.is_active !== false
      )
      .map((s) => ({
        id: s.id,
        title: s.title,
        items: (s.topic_subset_items ?? [])
          .map((i) =>
            Array.isArray(i.favourites)
              ? i.favourites[0]?.label
              : i.favourites?.label
          )
          .filter((l): l is string => Boolean(l)),
      })),
  }))
}
