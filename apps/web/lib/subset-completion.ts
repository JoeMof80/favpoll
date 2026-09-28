import Anthropic from "@anthropic-ai/sdk"

// SUBSET COMPLETION (founder, 2026-09-28: "I need an extra curry"): a
// proposed subset can be short for two reasons — a member the parent
// already lists was left out, or the parent lacks an item the subset
// plainly wants. The first is fixed by adding the join; the second is
// only ever a SUGGESTION for the catalogue, because a subset never
// justifies an item (favpoll-topic-rules §1): each addition must earn
// its place on the parent by the topic rules on its own. Subsets are a
// chance to notice what the list is missing, not a licence to pad it.

export type SubsetCompletionInput = {
  parentTitle: string
  /** Every eligible item on the parent's list, verbatim. */
  parentItems: string[]
  subsetTitle: string
  /** The subset's current members, verbatim. */
  members: string[]
}

export type SubsetCompletion = {
  /** Members the parent already lists but the subset left out. */
  missing: string[]
  /** Items the parent lacks that the subset would want — for the
   *  catalogue's judgement, never written by the completion. */
  additions: string[]
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/** The checkable part, pure: `missing` must be on the parent's list and
 *  not already a member; `additions` must NOT be on the list. */
export function validateSubsetCompletion(
  input: SubsetCompletionInput,
  raw: { missing?: unknown; additions?: unknown }
): SubsetCompletion {
  const onList = new Map(input.parentItems.map((l) => [norm(l), l]))
  const isMember = new Set(input.members.map(norm))
  const missing: string[] = []
  for (const l of Array.isArray(raw.missing) ? raw.missing : []) {
    const key = norm(String(l))
    const label = onList.get(key)
    if (label && !isMember.has(key) && !missing.includes(label))
      missing.push(label)
  }
  const additions: string[] = []
  for (const l of Array.isArray(raw.additions) ? raw.additions : []) {
    const s = String(l).trim().replace(/\s+/g, " ")
    if (!s || onList.has(norm(s)) || isMember.has(norm(s))) continue
    if (!additions.some((a) => norm(a) === norm(s))) additions.push(s)
  }
  return { missing, additions: additions.slice(0, 8) }
}

function buildPrompt(input: SubsetCompletionInput): string {
  return `You are curating the favpoll catalogue, where guests pick their favourite of a topic. A SUBSET is a named subset of one topic's items: "${input.subsetTitle}" is a subset of ${input.parentTitle}.

${input.parentTitle}'s full list, verbatim:
${input.parentItems.join(", ")}

"${input.subsetTitle}" currently holds:
${input.members.join(", ")}

Two questions.
1. MISSING: which items on ${input.parentTitle}'s list above plainly belong in "${input.subsetTitle}" but are not yet in it? Copy them EXACTLY from the list. Only clear members; if in doubt, leave it out. Empty is a fine answer.
2. ADDITIONS: which things does "${input.subsetTitle}" plainly want that ${input.parentTitle}'s list does not have at all? Each must stand as a favourite ${input.parentTitle} in its own right — something an ordinary person orders, names or reaches for by that name, at the basic level (not a variety only an expert knows). Name the strong candidates, up to six; the catalogue decides which earn a place. Leave it empty only if nothing ordinary is missing.

Answer with JSON only:
{"missing": ["<items copied from the list>"], "additions": ["<new items the list lacks>"]}`
}

/** Ask the model; validated before return. Never throws. */
export async function completeSubset(
  input: SubsetCompletionInput
): Promise<SubsetCompletion> {
  const empty = { missing: [], additions: [] }
  if (!process.env.ANTHROPIC_API_KEY) return empty
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: process.env.LLM_MODEL_ID ?? "claude-sonnet-5",
      max_tokens: 600,
      messages: [{ role: "user", content: buildPrompt(input) }],
    })
    const text =
      message.content.find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )?.text ?? ""
    const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
    if (!raw) return empty
    return validateSubsetCompletion(
      input,
      JSON.parse(raw) as { missing?: unknown; additions?: unknown }
    )
  } catch (err) {
    console.error(
      "completeSubset failed:",
      err instanceof Error ? err.message : err
    )
    return empty
  }
}
