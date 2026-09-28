import Anthropic from "@anthropic-ai/sdk"

// SUBSETS, proposed per topic (favpoll-topic-rules §1, ruling 7): a
// subset is a phrase an ordinary person puts after "favourite" without
// thinking — farm animal, pet, big cat, garden bird, Sunday roast —
// never a textbook grouping or a cut by letter or decade. Six to
// sixteen items ALREADY on the parent's list; subsets of one parent may
// overlap but one may not contain another whole; names follow topic
// grammar (singular, basic level, reads after "Favourite"). The model
// proposes against that rule; `validateSubsetProposals` enforces the
// parts that can be checked; an admin approves on /subsets (ruling 2).
// None is a fine answer — most topics have no subset anyone asks for.

export type SubsetTopicInput = {
  title: string
  isFinite: boolean
  /** Every eligible item on the parent's list, verbatim. */
  items: string[]
}

export type SubsetProposal = {
  title: string
  /** Labels exactly as they appear on the parent's list. */
  items: string[]
  reason: string
}

export const SUBSET_MIN_ITEMS = 6
export const SUBSET_MAX_ITEMS = 16

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/** Sentence-case a title without touching the rest ("big cat" → "Big
 *  cat"; "TV theme tune" stays). */
function titleCase(t: string): string {
  const s = t.trim().replace(/\s+/g, " ")
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** The checkable parts of ruling 7, applied to whatever the model (or
 *  anyone) proposes. Pure: no model, no database. */
export function validateSubsetProposals(
  topic: SubsetTopicInput,
  raw: { title?: unknown; items?: unknown; reason?: unknown }[]
): SubsetProposal[] {
  const onList = new Map(topic.items.map((l) => [norm(l), l]))
  const topicKey = norm(topic.title)
  const seenTitles = new Set<string>()
  const candidates: SubsetProposal[] = []
  for (const r of raw) {
    const title = titleCase(typeof r.title === "string" ? r.title : "")
    if (!title || norm(title) === topicKey || seenTitles.has(norm(title)))
      continue
    const items: string[] = []
    const seen = new Set<string>()
    for (const l of Array.isArray(r.items) ? r.items : []) {
      const label = onList.get(norm(String(l)))
      if (!label || seen.has(label)) continue
      seen.add(label)
      items.push(label)
    }
    // Fewer than six on the list is not a subset; more than sixteen is
    // a list, not a corner of one.
    if (items.length < SUBSET_MIN_ITEMS) continue
    if (items.length > SUBSET_MAX_ITEMS) items.length = SUBSET_MAX_ITEMS
    seenTitles.add(norm(title))
    candidates.push({
      title,
      items,
      reason: typeof r.reason === "string" ? r.reason.trim() : "",
    })
  }
  // One subset may not contain another whole: the container goes, the
  // specific one stays (Zoo animal may not swallow Big cat).
  const sets = candidates.map((c) => new Set(c.items))
  return candidates.filter((c, i) => {
    return !candidates.some(
      (other, j) =>
        j !== i &&
        other.items.length < c.items.length &&
        other.items.every((l) => sets[i].has(l))
    )
  })
}

function buildPrompt(topic: SubsetTopicInput): string {
  return `You are curating the favpoll catalogue, where guests at an event pick their favourite of a topic. A SUBSET is a named subset of ONE topic's items that a cause or an occasion pulls for: "Farm animal" on Animal (Cow, Pig, Sheep, Goat, Chicken, Donkey…), "Garden bird" on Bird, "Sunday roast" on Comfort food.

The topic: ${topic.title} (${topic.isFinite ? "a closed list" : "an open list"})
Its items, verbatim:
${topic.items.join(", ")}

Propose the subsets of this topic that ordinary people already ask for, if any. The test for each:
- Its name is a phrase an ordinary person would put after "favourite" without thinking. Never a textbook grouping (not "bird of prey", not "ungulate"), never a cut by letter, decade or region that nobody says aloud.
- Singular, basic level, reads after "Favourite" ("Farm animal", not "Farm animals", not "Animals of the farm").
- Six to sixteen items, copied EXACTLY from the list above. Never invent an item; if the list lacks the items a subset would need, the subset does not exist yet.
- Subsets may overlap (Pet and Farm animal both hold Goat) but one may not contain another whole.
- A subset is defined by what an item is or where it is, never by a status that changes with the season or the year: "Scottish team" stands, "Premier League team" and "Current F1 driver" do not.
- None is a fine answer. Most topics have no subset anyone asks for; do not manufacture one. Propose at most six.

Answer with JSON only:
{"subsets": [{"title": "<name>", "items": ["<items from the list>"], "reason": "<one plain sentence: who asks for this cut and why>"}]}`
}

/** Ask the model for a topic's subsets; validated before return. Never
 *  throws; empty when nothing can be said. */
export async function proposeSubsets(
  topic: SubsetTopicInput
): Promise<SubsetProposal[]> {
  if (!process.env.ANTHROPIC_API_KEY) return []
  if (topic.items.length < SUBSET_MIN_ITEMS) return []
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: process.env.LLM_MODEL_ID ?? "claude-sonnet-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: buildPrompt(topic) }],
    })
    const text =
      message.content.find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )?.text ?? ""
    const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
    if (!raw) return []
    const parsed = JSON.parse(raw) as {
      subsets?: { title?: unknown; items?: unknown; reason?: unknown }[]
    }
    return validateSubsetProposals(
      topic,
      Array.isArray(parsed.subsets) ? parsed.subsets : []
    )
  } catch (err) {
    console.error(
      "proposeSubsets failed:",
      err instanceof Error ? err.message : err
    )
    return []
  }
}
