import Anthropic from "@anthropic-ai/sdk"
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
  /** The live catalogue: every active topic with a few of its items. */
  topics: { id: string; title: string; isFinite: boolean; items: string[] }[]
}

export type PerfectTopicSuggestion = {
  /** The matching catalogue topic, or null when none fits. */
  topicId: string | null
  /** One plain sentence: why it is theirs (for the welcome email), why
   *  none fits, or the new topic proposed for the topic-rules audit. */
  reason: string
}

function buildPrompt(input: PerfectTopicInput): string {
  const catalogue = input.topics
    .map(
      (t) =>
        `${t.title} (${t.isFinite ? "closed" : "open"}: ${t.items.slice(0, 6).join(", ")}${t.items.length > 6 ? ", …" : ""})`
    )
    .join("\n")
  const areas = (input.areas ?? [])
    .map((a) => a.area)
    .slice(0, 6)
    .join(", ")
  return `favpoll is a fundraising page: guests pledge to a charity by picking their favourite of something (their favourite bird, song, beach). A charity's PERFECT TOPIC is the one a guest sees the point of before pledging: "of course Dogs Trust asks my favourite dog breed", "of course a rivers charity asks my favourite river", "of course the lifeboats ask my favourite beach", "of course a dementia charity asks my favourite song, music is the last thing to go". The pick must resonate with the cause: what the charity protects or works with (rivers, dogs, gardens, the coast), what its supporters love, or what its work is known for. It must NOT be about illness, disability, need, poverty or grief themselves, and never a topic that makes a guest think about the condition. Some charities honestly have none: a hospice, a grant-maker, a general medical research charity, a charity for a condition with no natural favourite. Say so rather than force one.

The charity, from the Charity Commission register:
Name: ${input.name}
Cause family (admin-confirmed): ${input.causeFamily ?? "none"}
Objects: ${(input.objects ?? "").slice(0, 900) || "(none on the register)"}
Activities: ${(input.activities ?? "").slice(0, 700) || "(none on the register)"}
Works in: ${areas || "unknown"}
Grant-maker as main activity: ${input.grantMaking ? "yes" : "no"}

The favpoll catalogue (topic, then a few of its items):
${catalogue}

Rules for a NEW topic, if nothing in the catalogue fits: ordinary people must have a favourite of it and be able to name several without expertise; its items sit at the basic level (Falcon, not Peregrine falcon; not "bird of prey"); different guests would pick different ones. Prefer an existing topic whenever it honestly fits; propose a new one only when the cause is specific and the catalogue has no home for it.

Answer with JSON only:
{"existing": "<catalogue topic title exactly, or null>", "existing_reason": "<one plain sentence addressed to the charity, for the welcome email: why this topic is theirs>", "new_topic": "<a new topic title or null>", "new_items": ["<8 to 12 basic-level items>"] or null, "new_reason": "<why the catalogue has no home for it, or null>", "none_reason": "<if no perfect topic exists, one sentence why; else null>"}`
}

/** The model's suggestion. Never throws; null when nothing can be said. */
export async function suggestPerfectTopic(
  input: PerfectTopicInput
): Promise<PerfectTopicSuggestion | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!input.activities && !input.objects) return null
  if (input.topics.length === 0) return null
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      // The Story generator's model: the judgement is the same kind.
      model: process.env.LLM_MODEL_ID ?? "claude-sonnet-5",
      max_tokens: 800,
      messages: [{ role: "user", content: buildPrompt(input) }],
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
      return {
        topicId: match.id,
        reason:
          plain(parsed.existing_reason) ||
          `${match.title} is the favourite closest to what ${input.name} does.`,
      }
    }
    if (parsed.new_topic) {
      const items = (parsed.new_items ?? []).slice(0, 12).join(", ")
      return {
        topicId: null,
        reason: `Proposed new topic "${parsed.new_topic}"${items ? ` (${items})` : ""}: ${plain(parsed.new_reason) || "nothing in the catalogue fits"}. Needs the topic-rules audit before it exists.`,
      }
    }
    return {
      topicId: null,
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
  }[]
): PerfectTopicInput["topics"] {
  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    isFinite: t.is_finite,
    items: (t.favourites ?? [])
      .filter((f) => t.is_finite || f.is_canonical !== false)
      .map((f) => f.label),
  }))
}
