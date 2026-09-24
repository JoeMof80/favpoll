import Anthropic from "@anthropic-ai/sdk"
import type {
  CauseFamily,
  FavpollGrouping,
  Pronoun,
  Register,
} from "@favpoll/types"
import { lookupEdges, type Edge, type StoryEdges } from "./pairing-table"
import {
  revealNamesRealItem,
  hasFabricatedStats,
  violatesCopyRules,
  inventsCondition,
} from "./actions/generate-draft-utils"

/**
 * The Story engine — ONE generator, TWO callers (pairing table §6,
 * founder 2026-09-23): the wizard's Generate an example
 * (actions/generate-draft.ts: auth, rate limit, cache) and the seed
 * (scripts/seed-stories.ts: picks the triple from the table, judges the
 * result, writes rows). Both hand this module a triple plus its edges and
 * get a Story back — the about and the personal note that agree.
 *
 * No "use server" here on purpose: a server-action file may only export
 * async functions, and the seed imports this relatively from a root
 * script (the precedent is scripts/backfill-cause-family.ts).
 */

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

/**
 * The founder's own Stories (scripts/seed-exemplars.ts), verbatim: the bar
 * for plainness and believability. Rules produce compliance; examples
 * produce voice (founder, 2026-09-24: "many examples just aren't
 * realistic"). They predate the em dash rule; the prompt says so.
 */
const EXEMPLAR_STORIES = [
  {
    triple: "Memorial · Colour · Marie Curie",
    about:
      "A beloved mother, teacher, and friend who spent her life bringing people together. Her home was full of deliberate colour — every room had a story, and the shade she always came back to said more about her than most words could. Marie Curie nurses were with her at the end, and she would have wanted them remembered here.",
    note: "Cornflower blue. She kept a pot of cornflowers on the windowsill every summer.",
  },
  {
    triple: "Birthday · Biscuit · RNLI",
    about:
      "Sarah is forty and has never met a biscuit she didn't take seriously. She has strong opinions and is not afraid to share them, which is part of why everyone is here. She supports the RNLI because she grew up near the coast and means it.",
    note: "The Bourbon. She once ate four packets in one sitting, and she has no regrets.",
  },
  {
    triple: "Retirement · Place · British Heart Foundation",
    about:
      "After thirty-five years building the engineering team from four people to four hundred, David is finally putting down his laptop. He has a shortlist of places he's never had time to actually go to — and now he does. His charity of choice looks after the hearts of people who worked as hard as he did.",
    note: "The Dordogne. He kept a photo of it on his desk for thirty years.",
  },
  {
    triple: "Wedding · Song · Shelter",
    about:
      "Emma and James met at a rainy music festival in 2019 and haven't been apart since. Music runs through everything they do together. They asked for pledges to Shelter in lieu of gifts — because a roof over your head matters, and they wanted to share the good fortune.",
    note: "Fields of Gold. It played at their first dance and neither of them planned it.",
  },
] as const

function exemplarsBlock(): string {
  const items = EXEMPLAR_STORIES.map(
    (x) => `${x.triple}\n  about: ${x.about}\n  note: ${x.note}`
  ).join("\n")
  return `These four are the bar. Notice how ordinary the facts are (a pot on a windowsill, a photo on a desk, four packets of biscuits), how plainly they are said, and that nothing in them is invented for effect. They predate the em dash rule; keep their plainness, not their dashes.\n${items}`
}

/** A birth: the BABY is the protagonist on the card ("Welcome to the
 *  world, Mei") and the parents write on the child's behalf. The
 *  favourite is what they have chosen for the baby; the baby has no
 *  preferences or habits of its own (founder, 2026-09-24). */
export const BABY_OCCASIONS = new Set([
  "New baby",
  "Baby shower",
  "Christening",
])

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

/** "Sylvia's" from "Sylvia Cranfield", or null without a usable name.
 *  A GROUP keeps its whole name: "The Hartley family's", never "The's"
 *  (the first-word rule made "Ward 4, Spring 1994" into "Ward's";
 *  third cohort, 2026-09-24). */
function namePossessive(
  displayName?: string | null,
  grouping?: FavpollGrouping
): string | null {
  if (!displayName?.trim()) return null
  return possessive(
    grouping === "group" ? displayName.trim() : firstNames(displayName)
  )
}

/** The closing promise of the about, in one of a few founder-approved
 *  shapes. "X" is the possessive ("Joan's"). Rotated per generation. */
export const REVEAL_PROMISES = [
  "and X will be revealed",
  "to see X",
  "and we'll reveal X",
  "and find out X",
  "then see X",
] as const

export function pickRevealPromise(
  possessive: string,
  index = Math.floor(Math.random() * REVEAL_PROMISES.length)
): string {
  return REVEAL_PROMISES[index % REVEAL_PROMISES.length].replace(
    "X",
    possessive
  )
}

function revealOpener(
  register: Register,
  pronoun?: Pronoun,
  displayName?: string | null,
  grouping?: FavpollGrouping
): string {
  const tense = register === "remembering" ? "was" : "is"
  const named = namePossessive(displayName, grouping)
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
  return `Why this favpoll hangs together — the EDGES. These are the only links between the occasion, the topic and the charity that you may state; never invent another. They are notes to you, not copy: never repeat their phrasing ("sits inside", "belongs at", "the cause the effort is for"). A ★ edge already reads on the card (the cake at a birthday, a children's book at a christening), so the about must NOT explain or justify it; a pairing that needs no explanation gets none. Only a two-hop edge (marked "a step the about must say out loud") is said, in one plain clause.
${rows.join("\n")}`
}

export function buildPrompt(opts: {
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
  fiction?: boolean
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
    fiction = false,
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
Never use: "vote", "voting", "choose", "choosing", "choice", "remarkable", "meaningful", "celebrate the life", "make a difference", exclamation marks, em dashes (—) in prose, or any fundraising cliché. Join clauses with a comma, a full stop or "and". The money word is "pledge"; the selection word is "pick".`

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
- "about" (max 2 sentences): first what this favpoll is raising for${hasPurpose ? "" : " (taken from the cause name above only — the charity's own work is unknown and must not be described)"}${occasionType && occasionType !== "Fundraiser" ? `, at what event (say "${occasionType.toLowerCase()}" or its plain equivalent — a guest must know what is happening)` : ""}${edges.count > 0 ? ", with why THIS topic in a clause — say the edge listed above, in your own words" : ""}, then the mechanic in ONE clause — guests pick their favourite ${topicTitle.toLowerCase()} and pledge to ${charityName ?? "the charity"}, where the pick and the pledge are a single action (the pick is made BY pledging). Never present them as separate steps: no "first…", "then…", "tell us…". favpoll takes no platform fee. Do NOT name or hint at any particular option, and do not repeat the context subline's wording.
- "reveal" (guests see it only AFTER pledging): start with exactly "Our pick to start:" then a real option from the list, then " — " (this separator is the one place an em dash is allowed) and one short, warm clause, plain and unforced, like "They watched it every Christmas Eve without fail". It need not justify the pick; the about carries the reason. No statistics, numbers, percentages, or invented quotes.`
  } else {
    const opener = revealOpener(register, pronoun, displayName, grouping)
    // Pair/Group are structural (founder bug, 2026-09-06: the generator
    // wrote "him/his" for a pair because plurality never reached it).
    const plural = grouping === "couple" || grouping === "group"
    const pronounHint = plural
      ? ` The favpoll honours ${grouping === "couple" ? "a PAIR — two people together" : "a GROUP of people"}: use "they/them/their" and plural agreement in every sentence ("their favourite", "they have loved"), and treat the name as referring to ${grouping === "couple" ? "both of them" : "all of them"}, never one individual.`
      : pronoun
        ? ` Use "${pronoun}" pronouns for the person.`
        : ""
    const namePoss = namePossessive(displayName, grouping)
    // The reveal promise closes every about, so its shape is rotated HERE
    // rather than left to the model, which always took the first example
    // ("and Joan's will be revealed" on 24 of 24 seeded Stories; founder,
    // 2026-09-24: "appears too often"). One form per generation.
    const promise = namePoss ? pickRevealPromise(namePoss) : null
    const nameHint = promise
      ? `\nThe protagonist is called "${displayName}". In the about, use pronouns — EXCEPT the reveal promise, which names them once: end the invitation with exactly this shape: "${promise}". The reveal opener below already contains the name — never repeat it beyond these two places.`
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
    // edges the fact about the person IS the motivation, and it has to be
    // in the about, read before the pledge, not only in the reveal (the
    // Yvette case). But the fact must be ORDINARY: the first cohort's
    // demand for "a specific fact that makes the topic theirs" produced
    // talismans, quirks and places with agency (founder, 2026-09-24:
    // "one seaside town has walked every mile of it with her").
    const topicLower = topicTitle.toLowerCase()
    const edgeRule =
      edges.count === 0
        ? ` NO edge links this occasion, this charity and this topic, so the about MUST say one plain, believable thing about the person that makes a favourite ${topicLower} a natural thing to ask them, stated in the about before the invitation, not only in the reveal.`
        : edges.count === 1
          ? ` ONE edge links this favpoll (listed above). Let it stand, and say one plain, believable thing about the person that makes a favourite ${topicLower} a natural thing to ask them.`
          : edges.count === 2
            ? ` TWO edges link this favpoll (listed above). Let them stand; the about's job is the person.`
            : ` All THREE edges link this favpoll (listed above). The card already says it; the about's job is the person.`
    const ordinaryRule = ` The one thing the about says about the person must be ORDINARY: something a relative would actually say (what they do on a Sunday, what they always order, where they sit, who they go with). Never a talisman, a lucky object, a superstition, or a quirk invented for effect. Never a thing they "turn to", that "steadies" them, that "feels most like their own", or a place or object that has "walked with" or "carried" them: places and things have no agency. Never say that the favourite is being kept back, withheld, not yet revealed, or that they "won't say which": simply do not name it. The one promise of a reveal is the closing clause.`
    // The parents are the protagonists at a birth; the baby has no habits.
    const babyRule = BABY_OCCASIONS.has(occasionType ?? "")
      ? ` The occasion is a birth: the name above is the BABY'S, and the parents are writing on the baby's behalf. The favourite is what they have chosen for the baby (the book they read first, the rhyme they sing, the game they will teach), said as the baby's ("Mei's is The Gruffalo"). In the about, say only that the parents have chosen and keep the reason back. The reveal's detail is that reason, one plain fact the about did not give ("it was what her dad called his own grandmother", "her grandmother came over from Naples in 1970"). Never a preference, habit or memory of the baby's own (a newborn has none), never a ritual invented to attach the parents to the pick, and no "still" or "already" in a newborn's household.`
      : ""
    const realPersonRule = fiction
      ? ""
      : ` This is a REAL person and the organiser who knows them will read this: never invent or imply any illness, condition, disability, diagnosis, treatment, cause of death or medical history for them, and never infer one from the charity's cause (a hospice, a cancer charity, a sight-loss charity says nothing about this person). The edges above are context about the occasion and the charity, not facts about the person. If no link between the charity and the person is given, do not supply one: name the charity and leave the reason to the organiser.`
    instructions = `- "about" (max 2 sentences, under 55 words): open with the PROTAGONIST'S connection to the topic, a favourite ${topicLower} that is distinctly theirs, without naming or hinting at which option it is (the reveal is the gift).${tenseRule}${edgeRule}${ordinaryRule}${babyRule}${realPersonRule} Then one short clause inviting the READER directly, in second person: pledge to ${charityName ?? "charity"} and pick your OWN favourite (say "you"/"your", never "guests"; never say they are guessing or voting on the protagonist's). Keep the charity to a mention${edges.e2 || edges.e3 ? " plus its edge" : ", not a description"}: this is about the person.${pronounHint}${nameHint}
- "reveal" (guests see it only AFTER pledging): start with exactly "${opener}".${entityGuard} Then a plausible option from the list (you MUST use a real option, verbatim), then a full stop, then ONE short sentence with a single detail about the PROTAGONIST'S relationship to that favourite, and the detail must be something anyone could have WATCHED them do: where they sit, what they order, what they say, who they go with, how often. It pays off what the about set up, adding something the about did not say; never restate the about.${tenseRule} Never a talisman, a lucky object, a superstition, a joke, or a quirk invented for effect; never a habit for a baby or a child too young to have one. The detail must be entirely the protagonist's own and must NOT depend on any real-world fact about the favourite: no fixture dates or match traditions, no seasons, tours, episodes, eras, or biography (a claim like "watched them play on Boxing Day" fails if that favourite doesn't play then; avoid the whole category). The options may be famous real people, teams, or works: never state or invent facts about them. No preamble such as "We can't wait to reveal".

${exemplarsBlock()}`
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

export type DraftFields = {
  about: string
  reveal: string
  /** Cause favpolls only — present when the organiser hasn't named the cause. */
  causeLabel?: string
  /** Cause favpolls only. */
  context?: string
}

/** One retry when the copy breaks a hard brand rule ("choose"/"vote"). */
export async function callLLMWithCopyCheck(
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

export async function callLLM(
  prompt: string,
  modelId: string
): Promise<DraftFields> {
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
// The engine's two entry points
// ---------------------------------------------------------------------------

export type StoryCharity = {
  name: string | null
  description: string | null
  activities: string | null
  /** The admin-CONFIRMED family — never the model's suggestion (#937). */
  causeFamily: CauseFamily | null
}

export type StoryInput = {
  register: Register
  subject: "someone" | "cause"
  /** An `occasion_type` string, or null (pairs with nothing). */
  occasionType: string | null
  topicTitle: string
  itemLabels: string[]
  charity: StoryCharity
  pronoun?: Pronoun
  grouping?: FavpollGrouping
  displayName?: string | null
  /**
   * The seed writes FICTION about invented people and may give them a
   * life, an illness included, when the charity calls for it. The wizard
   * writes about a REAL person for the organiser: it must never invent a
   * medical condition, a diagnosis or a cause of death (founder,
   * 2026-09-24: "it would be insane to invent any medical condition for
   * somebody via the wizard"). Default false: real.
   */
  fiction?: boolean
}

export type Story = {
  about: string
  /** The personal note — the LLM JSON keeps its "reveal" field (the
   *  prompt is a tuned creative instrument); storage and code say note. */
  note: string
  /** Cause favpolls only — suggested cause name when none was set. */
  causeLabel: string | null
  /** Cause favpolls only — suggested context subline. */
  context: string | null
  edges: StoryEdges
}

export function storyEdges(input: StoryInput): StoryEdges {
  return lookupEdges({
    register: input.register,
    occasionType: input.occasionType,
    topicTitle: input.topicTitle,
    charityName: input.charity.name,
    causeFamily: input.charity.causeFamily,
  })
}

/**
 * The prompt bans em dashes in prose and the model still lands one in
 * about 1 in 12 Stories (2026-09-24). Enforcement: a spaced dash joins
 * two clauses, so a comma stands in; an unspaced one is a hyphen's job.
 */
/** The model wrote "The Okafors's" against a computed "The Okafors'"
 *  (third cohort, 2026-09-24): a possessive already ending in an
 *  apostrophe never takes another 's. */
export function undoubledPossessive(
  text: string,
  possessive: string | null
): string {
  if (!possessive || !/['\u2019]$/.test(possessive)) return text
  return text.split(`${possessive}s`).join(possessive)
}

/** A sentence ends with a stop: "and find out James'" lost its full stop
 *  after a possessive apostrophe (third cohort, 2026-09-24). */
export function endStop(text: string): string {
  const t = text.trimEnd()
  return /[.!?…"”')]$/.test(t) && !/['\u2019]$/.test(t) ? t : `${t}.`
}

export function stripEmDashes(text: string, keep: string[] = []): string {
  // An item label may itself carry an em dash ("Stand by Me — Ben E.
  // King"); it is catalogue data and must survive verbatim, or the
  // real-item check fails on a note that named it (third cohort,
  // 2026-09-24: two Song Stories skipped for exactly this).
  const kept = keep.filter((k) => /[—–]/.test(k) && text.includes(k))
  let out = text
  kept.forEach((k, i) => {
    out = out.split(k).join(`\u0000${i}\u0000`)
  })
  out = out.replace(/\s+[—–]\s+/g, ", ").replace(/[—–]/g, "-")
  kept.forEach((k, i) => {
    out = out.split(`\u0000${i}\u0000`).join(k)
  })
  return out
}

/**
 * Generate a Story for a triple. One model call, one guarded retry on a
 * hard-rule breach, one validator retry (a real item named / no invented
 * statistics). Throws when the model returns nothing usable twice.
 */
export async function generateStory(
  input: StoryInput,
  modelId: string
): Promise<Story> {
  const edges = storyEdges(input)
  const prompt = buildPrompt({
    register: input.register,
    subject: input.subject,
    occasionType: input.occasionType,
    topicTitle: input.topicTitle,
    itemLabels: input.itemLabels,
    charityName: input.charity.name,
    charityDescription: input.charity.description,
    charityActivities: input.charity.activities,
    edges,
    pronoun: input.subject === "someone" ? input.pronoun : undefined,
    grouping: input.subject === "someone" ? input.grouping : undefined,
    displayName: input.displayName ?? null,
    fiction: input.fiction ?? false,
  })

  let parsed = await callLLMWithCopyCheck(prompt, modelId)
  // Belt and braces for a real person: one retry when the copy names a
  // condition anyway. The charity's own name is exempt (Cancer Research
  // UK, Alzheimer's Society are named on purpose).
  if (
    !input.fiction &&
    input.subject === "someone" &&
    inventsCondition(`${parsed.about} ${parsed.reveal}`, input.charity.name)
  ) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (
      retry &&
      !inventsCondition(`${retry.about} ${retry.reveal}`, input.charity.name)
    )
      parsed = retry
  }

  // One validator retry. The item-name check needs a canonical list — a
  // custom topic with no labels has nothing to validate against.
  if (input.subject === "cause" && hasFabricatedStats(parsed.reveal)) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (retry && !hasFabricatedStats(retry.reveal)) parsed = retry
  } else if (
    input.subject === "someone" &&
    input.itemLabels.length > 0 &&
    !revealNamesRealItem(parsed.reveal, input.itemLabels)
  ) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (retry && revealNamesRealItem(retry.reveal, input.itemLabels))
      parsed = retry
  }

  const namePoss = namePossessive(input.displayName, input.grouping)
  const tidy = (text: string) =>
    endStop(
      undoubledPossessive(stripEmDashes(text, input.itemLabels), namePoss)
    )
  return {
    about: tidy(parsed.about),
    // The cause reveal's " — " separator is the one em dash allowed.
    note: input.subject === "cause" ? parsed.reveal : tidy(parsed.reveal),
    // Defensive caps match the form schema (causeLabel 60, context 40)
    causeLabel: parsed.causeLabel?.trim().slice(0, 60) || null,
    context: parsed.context?.trim().slice(0, 40) || null,
    edges,
  }
}

/**
 * A cause favpoll's bar is the charity edge plus a STATED event (pairing
 * table §4). Whether the about names the event is a lookup, not a
 * judgement — the judge kept failing abouts that plainly said "at this
 * sponsored event" (2026-09-24). Fundraiser is the register default and
 * asks nothing.
 */
export function aboutNamesEvent(
  about: string,
  occasionType: string | null
): boolean {
  if (!occasionType || occasionType === "Fundraiser") return true
  const text = about.toLowerCase()
  const cues: Record<string, string[]> = {
    "Sponsored event": [
      "sponsored",
      "marathon",
      "swim",
      "run ",
      "running",
      "walk",
      "cycle",
      "ride",
      "climb",
      "challenge",
    ],
    "Charity night": ["night", "evening", "gala", "ball", "quiz", "gig"],
    "In memoriam appeal": ["in memoriam", "memory", "remember", "appeal"],
  }
  const wanted = cues[occasionType] ?? [occasionType.toLowerCase()]
  return wanted.some((w) => text.includes(w))
}

export type StoryVerdict = {
  /** Would a relative have written this about a real person? */
  realistic: boolean
  reason: string
}

/**
 * The seed's one model judgement. It used to ask "is there a concrete
 * detail?" (A1/P2) and passed anything concrete, marmalade sandwiches in
 * coat pockets included: concreteness is not realism (founder,
 * 2026-09-24). It now asks whether a relative would have written this,
 * told the occasion and who the protagonist is, and is asked to name
 * anything a real person would not say or do. Run it on the Story model,
 * not a smaller one. Never throws: an unreadable verdict is a fail.
 */
export async function judgeStory(
  story: Pick<Story, "about" | "note">,
  input: Pick<
    StoryInput,
    "subject" | "topicTitle" | "occasionType" | "displayName" | "grouping"
  >,
  edges: StoryEdges,
  modelId: string
): Promise<StoryVerdict> {
  const isCause = input.subject === "cause"
  const who = isCause
    ? `a cause (${input.displayName ?? "unnamed"})`
    : `${input.displayName ?? "the person"}, ${input.grouping === "couple" ? "a couple" : input.grouping === "group" ? "a group" : "one person"}`
  const baby = BABY_OCCASIONS.has(input.occasionType ?? "")
    ? " The occasion is a birth: the name is the BABY'S and the parents write on the baby's behalf. The favourite is what they chose for the baby; fail it if the baby is given a preference, habit or memory of its own."
    : ""
  const edgeLines = [edges.e1, edges.e2, edges.e3]
    .filter((e): e is Edge => Boolean(e))
    .map((e) => `- ${e.text}`)
    .join("\n")
  const prompt = `You are a relative reading a favpoll page at a real event. A favpoll honours someone; guests pledge to charity and pick a favourite; after pledging they see the honoured person's own favourite. You are checking whether the copy reads as something a family member would actually have written about a real person. Answer with JSON only.

Occasion: ${input.occasionType ?? "unknown"}. Honouring: ${who}.${baby}
Topic: Favourite ${input.topicTitle}.
Links the writer was given:
${edgeLines || "(none)"}

ABOUT (read before pledging):
"""${story.about}"""

NOTE (read after pledging):
"""${story.note}"""

Fail it if ANY of these is true:
- a baby or a child too young has a favourite, a habit or a memory;
- a place, an object, a time of day or a smell is given agency ("walked every mile with her", "steadies him", "feels most like his own");
- a quirk, talisman, superstition or joke invented for effect (a sandwich kept in a coat pocket "just in case");
- the person is written as the wrong age or the wrong person for the occasion;
- a sentence that does not make sense, or that no relative would say out loud;
- ${isCause ? "the about does not say what is being raised for" : "the about and the note contradict each other"}.
Ordinary is good. Plain is good. A detail like "she kept a pot of cornflowers on the windowsill" passes.

Respond with ONLY: {"realistic": true|false, "reason": "one short sentence naming the problem, or 'reads as real'"}`
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: modelId,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })
    const text =
      message.content.find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )?.text ?? ""
    const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
    if (!raw) return { realistic: false, reason: "judge returned no JSON" }
    const parsed = JSON.parse(raw) as Partial<StoryVerdict>
    return {
      realistic: parsed.realistic === true,
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
    }
  } catch (err) {
    return {
      realistic: false,
      reason: `judge failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
