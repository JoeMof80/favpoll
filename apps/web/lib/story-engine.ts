import Anthropic from "@anthropic-ai/sdk"
import type {
  CauseFamily,
  FavpollGrouping,
  Pronoun,
  Register,
} from "@favpoll/types"
import { lookupEdges, type Edge, type StoryEdges } from "./pairing-table"
import { pickExemplars, type ExemplarQuery } from "./exemplars"
import {
  revealNamesRealItem,
  hasFabricatedStats,
  violatesCopyRules,
  inventsCondition,
  hasTics,
  slipsToSingular,
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

function exemplarsBlock(q: ExemplarQuery): string {
  const items = pickExemplars(q, 4)
    .map((x) => `${x.triple}\n  about: ${x.about}\n  note: ${x.note}`)
    .join("\n")
  return `These are the bar: the founder's own Stories, the closest to this one. Notice how ordinary the facts are, how plainly they are said, how much room they take, and that nothing in them is invented for effect. They are the standard, not a template: never reuse their phrasing, their opening move or their detail (a Story next to "Now I have Sundays to myself" must not open with Sundays being one's own). Some predate the em dash rule; keep their plainness, not their dashes.\n${items}`
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

/** A sponsored effort is fundraising: the favpoll runs in the build-up
 *  and closes on the day, so the copy is written BEFORE the effort
 *  (founder, 2026-09-24: "it doesn't make sense to fundraise after
 *  finishing a marathon"). */
export const EFFORT_OCCASIONS = new Set(["Achievement", "Sponsored event"])

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

/** The about's last sentence, whole: the founder's own shape ("Pledge to
 *  x and pick your own favourite to see x's"), with the charity named
 *  once and one "and" at most. Handing the model the sentence removes
 *  the connectives it kept adding (2026-09-24: "too many ands"). */
export function closingSentence(
  charityName: string | null,
  promise: string,
  topicTitle?: string
): string {
  // "pick your favourite song", not "pick your own favourite": the
  // founder named the topic in every one of his edits (2026-09-25).
  const what = topicTitle
    ? `your favourite ${topicTitle.toLowerCase()}`
    : "your own favourite"
  return `Pledge to ${charityName ?? "charity"}, pick ${what}, ${promise}.`
}

export function pickRevealPromise(
  possessive: string,
  index = Math.floor(Math.random() * REVEAL_PROMISES.length)
): string {
  // In the first person "we'll reveal mine" reads as two speakers.
  const forms =
    possessive === "mine" || possessive === "ours"
      ? REVEAL_PROMISES.filter((f) => !f.startsWith("and we'll"))
      : REVEAL_PROMISES
  return forms[index % forms.length].replace("X", possessive)
}

/** First person: the organiser is the protagonist. A pair or group says
 *  "we"; one person says "I". */
const firstPerson = (pronoun?: Pronoun) => pronoun === "i"
const ownPossessive = (grouping?: FavpollGrouping) =>
  grouping === "couple" || grouping === "group" ? "ours" : "mine"

function revealOpener(
  register: Register,
  pronoun?: Pronoun,
  displayName?: string | null,
  grouping?: FavpollGrouping
): string {
  const tense = register === "remembering" ? "was" : "is"
  if (firstPerson(pronoun))
    return `${ownPossessive(grouping) === "ours" ? "Ours" : "Mine"} ${tense}`
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
 * Where a charity works, as a clause the model may use and may not
 * exceed: a local charity is placed, a national one is never called
 * local (the relevance axis, 2026-09-25).
 */
export function describeAreas(
  areas: { area: string; type: string }[] | null
): string | null {
  if (!areas || areas.length === 0) return null
  const national = areas.some((a) =>
    /throughout england and wales|throughout|united kingdom/i.test(a.area)
  )
  const countries = areas
    .filter((a) => /country/i.test(a.type))
    .map((a) => a.area)
  const local = areas
    .filter((a) => /local authority/i.test(a.type))
    .map((a) => a.area)
  if (local.length > 0 && !national)
    return `It works locally, in ${local.slice(0, 5).join(", ")}${local.length > 5 ? " and nearby" : ""}: you may place it there, and must not call it national.`
  if (national || countries.length > 3)
    return `It works nationally${countries.length > 3 ? " and overseas" : ""}: never call it local or "your local" anything.`
  if (countries.length > 0) return `It works in ${countries.join(", ")}.`
  return null
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
  return `Why this favpoll hangs together — the EDGES. These are the only links between the occasion, the topic and the charity that you may state; never invent another. An edge marked "none" does not exist: an organiser may pair any charity with any topic, and when the charity has no link to the topic you say NOTHING that connects them (no "whose work reaches rivers", no "a favourite river follows the waters where that work happens"). The favourite is simply what guests are asked; the charity is simply where the money goes. They are notes to you, not copy: never repeat their phrasing ("sits inside", "belongs at", "the cause the effort is for"). A ★ edge already reads on the card (the cake at a birthday, a children's book at a christening), so the about must NOT explain or justify it; it may, and usually should, use the thing itself as part of the story. Only a two-hop edge (marked "a step the about must say out loud") is said, in one plain clause.
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
  charityObjects?: string | null
  charityAreas?: { area: string; type: string }[] | null
  edges: StoryEdges
  pronoun?: Pronoun
  grouping?: FavpollGrouping
  displayName?: string | null
  fiction?: boolean
  /** The about's fixed last sentence, computed by the caller so it can
   *  be enforced on the result. */
  closing?: string
  /** The favourite, when the caller has chosen it. */
  pick?: string | null
  /** The charity's confirmed family, for exemplar retrieval. */
  causeFamily?: CauseFamily | null
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
    closing: givenClosing,
    pick,
    causeFamily = null,
  } = opts
  const activities = activitiesExcerpt(opts.charityActivities)
  const objects = activitiesExcerpt(opts.charityObjects ?? null)
  const worksIn = describeAreas(opts.charityAreas ?? null)
  // Purpose data, in order of trust: the curated description, then the
  // charity's own register text. Either lets the model say what the
  // charity does; neither means it must not.
  const hasPurpose = Boolean(charityDescription || activities || objects)

  // A register-added charity arrives with NO description (seven on prod,
  // 2026-09-23). Passing the bare name let the model guess what "MAC Bevan
  // Charitable Trust" does — on a charity platform, an invented cause is a
  // truthfulness failure, not a style one. With no purpose data the charity
  // is named and nothing more. Since #934 most register-added charities
  // carry `activities` — their own words — which the prompt quotes and
  // bounds ("only in these terms").
  const ownWords =
    (activities
      ? ` In its own words on the Charity Commission register: "${activities}".`
      : "") +
    (objects
      ? ` Its charitable objects, from its governing document: "${objects}".`
      : "") +
    (worksIn ? ` ${worksIn}` : "")
  const charityLine = charityName
    ? charityDescription
      ? `Charity receiving the pledges: ${charityName} — ${charityDescription.replace(/\.\s*$/, "")}.${ownWords}`
      : activities || objects
        ? `Charity receiving the pledges: ${charityName}.${ownWords} Describe its work only in those terms — nothing beyond them.`
        : `Charity receiving the pledges: ${charityName}. NOTHING is known here about what this charity does. Name it exactly as given and do NOT describe, characterise, or guess at its work, its cause, or who it helps — not even from its name.`
    : 'Charity: not yet chosen — say "charity" generically.'

  const voice = `You write short copy for favpoll, a UK charitable-giving platform used at real life events. Guests pledge money to charity and share favourites; after pledging, the protagonist's own favourite is revealed to them.
Voice: warm, plain, specific, quietly dignified. Short sentences. British English. A comma before "and" only when a new subject follows it ("she cooks, and he washes up"), never between two verbs sharing a subject ("he cooks the dishes he grew up with and has picked up new ones").
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
- "about" (max 2 sentences): first what this favpoll is raising for${hasPurpose ? "" : " (taken from the cause name above only — the charity's own work is unknown and must not be described)"}${occasionType && occasionType !== "Fundraiser" ? `, at what event (say "${occasionType.toLowerCase()}" or its plain equivalent — a guest must know what is happening${EFFORT_OCCASIONS.has(occasionType) ? ", and it is still to come: pledges are gathered in the build-up, so never write it as finished" : ""})` : ""}, then the mechanic in ONE clause — guests pick their favourite ${topicTitle.toLowerCase()} and pledge to ${charityName ?? "the charity"}, where the pick and the pledge are a single action (the pick is made BY pledging). Never present them as separate steps: no "first…", "then…", "tell us…". favpoll takes no platform fee. Do NOT name or hint at any particular option, and do not repeat the context subline's wording.
- "reveal" (guests see it only AFTER pledging): start with exactly "Our pick to start:" then ${pick ? `exactly this option, verbatim: "${pick}"` : "a real option from the list"}, then " — " (this separator is the one place an em dash is allowed) and one short, warm clause, plain and unforced, like "They watched it every Christmas Eve without fail". It need not justify the pick; the about carries the reason. No statistics, numbers, percentages, or invented quotes.`
  } else {
    const opener = revealOpener(register, pronoun, displayName, grouping)
    // Pair/Group are structural (founder bug, 2026-09-06: the generator
    // wrote "him/his" for a pair because plurality never reached it).
    const plural = grouping === "couple" || grouping === "group"
    const first = firstPerson(pronoun)
    const pronounHint = first
      ? plural
        ? ` The organisers ARE the people honoured, ${grouping === "couple" ? "a pair" : "a group"}, writing in the FIRST PERSON PLURAL: "we", "our", "us" in every sentence. Never "they" for themselves; the name on the card is not used in the copy.`
        : ` The organiser IS the person honoured, writing in the FIRST PERSON: "I", "my", "me" in every sentence, the way a person writes their own page ("I'm retiring in June"). Never "he", "she" or the name: the name is on the card, not in the copy.`
      : plural
        ? ` The favpoll honours ${grouping === "couple" ? "a PAIR — two people together" : "a GROUP of people"}: use "they/them/their" and plural agreement in every sentence ("their favourite", "they have loved"), and treat the name as referring to ${grouping === "couple" ? "both of them" : "all of them"}, never one individual.`
        : pronoun
          ? ` Use "${pronoun}" pronouns for the person.`
          : ""
    const namePoss = first
      ? ownPossessive(grouping)
      : namePossessive(displayName, grouping)
    // The reveal promise closes every about, so its shape is rotated HERE
    // rather than left to the model, which always took the first example
    // ("and Joan's will be revealed" on 24 of 24 seeded Stories; founder,
    // 2026-09-24: "appears too often"). One form per generation.
    const promise = namePoss ? pickRevealPromise(namePoss) : null
    const closing =
      givenClosing ??
      (promise
        ? closingSentence(charityName, promise, topicTitle)
        : `Pledge to ${charityName ?? "charity"} and pick your favourite ${topicTitle.toLowerCase()}.`)
    const nameHint = first
      ? ""
      : promise
        ? `\nThe protagonist is called "${displayName}". In the about's first sentence use pronouns, or the first name once; the closing sentence names them in its possessive. The reveal opener below already contains the name — never repeat it beyond these places.`
        : ""
    // An explicitly chosen he/she is the organiser SAYING there is a
    // person, and it outranks any guess made from the name's shape. The
    // guard used to win regardless, so a favpoll named after its event
    // ("Ben's Channel Swim") got "Theirs is …" with ♂ selected
    // (founder-caught, 2026-09-23). It still earns its place for
    // "they"/unset, which is the genuine appeal/fund/organisation case.
    const namedPerson = pronoun === "he" || pronoun === "she" || first
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
        : ` The person is living: their habits are in the present tense ("always goes", "picks first"), never the past-habitual ("always went") — past tense makes them sound gone. Do not write "still" or "already": both imply a before that the reader has not been told. Do not assume their age: no whole-life idioms ("since childhood", "all her life", "long held"). When the charity or occasion suggests who they are (a children's charity, a graduation), let that shape the detail; otherwise write habits that fit any age.`
    // What the about must do (pairing table §6), stripped back
    // 2026-09-24 after a day of patching one example at a time left the
    // writer squeezed ("never went a week without one"). The exemplars
    // carry the form; the rules that remain are about truth, not style,
    // and the seed's judge carries realism.
    const topicLower = topicTitle.toLowerCase()
    const edgeRule =
      edges.count === 0
        ? ` No edge links this occasion, this charity and this topic, so the about itself must make a favourite ${topicLower} a natural thing to ask this person, with one plain, believable thing about them.`
        : ` The edges above are context; the card already carries them. A ★ edge means the thing itself is part of the occasion, so USE it in the story (the wedding cake they have been tasting, the first dance, the flowers at the service) but never explain why it fits ("a favourite cake belongs at a wedding" is a justification; "they have tasted eleven cakes since March" is a story). Say a two-hop one in a clause if the about needs it.`
    const truthRule = ` What you say about the person must be ordinary and believable, the kind of thing a relative would say: never a talisman, a lucky object, a superstition, a quirk invented for effect, or a place, an object or a STATE given agency ("walked every mile with her", "steadies him", "settling in has put a roast dinner on her mind"): the person is the subject of the sentence, and the link is a concrete thing they do or plan ("the first roast she'll cook for friends in the new place"). Every detail passes the HONOUR test: it is something the person would be glad to hear said about them by someone who loves them, at their own party or memorial. Gentle teasing is welcome where the occasion allows it (a leaving do, a birthday); what fails is anything that makes them look small or sad rather than fond ("fumbles for the light switches", "eats alone"). Never announce that a favourite exists ("she had a favourite cat breed"). Never say the favourite is being kept back or withheld: simply do not name or hint at it; the closing sentence is the one promise of a reveal. Never comment on the favpoll itself ("it felt right for today", "this seemed fitting"): write about the person, not about the page.`
    // A birth honours the PARENTS on behalf of the child; the favourite
    // is their own. Nobody picks a favourite for a baby (founder,
    // 2026-09-24: "Bagpuss is the parent's favourite cartoon, not the
    // child's").
    const babyRule = BABY_OCCASIONS.has(occasionType ?? "")
      ? ` The occasion is a birth. The people honoured are the PARENTS, named above, on behalf of their child, who is in the card's context line and has no favourite. The favourite is the parents' OWN (the cartoon they love, the book they read as children, the rhyme they sing), the one they will pass on. Never write a favourite, a preference or a habit as the baby's, and never say a favourite was chosen "for" the baby.`
      : ""
    const effortRule = EFFORT_OCCASIONS.has(occasionType ?? "")
      ? ` The occasion is a sponsored effort that is STILL TO COME: this favpoll gathers pledges in the build-up and closes on the day. Write it before the effort ("is swimming the Channel in June", "runs the marathon on Sunday"), never as finished, and say nothing about how it went. Do not name a month or a date: the card carries them.`
      : ""
    const noInventedPeople = ` Never invent a spouse, partner, child, sibling, parent, friend, job, home or town for them to fill a sentence: stay with what they themselves do. A relative may appear only when the occasion supplies one (a wedding has a couple; a birth has parents).`
    const realPersonRule = fiction
      ? noInventedPeople
      : noInventedPeople +
        ` This is a REAL person and the organiser who knows them will read this: never invent or imply any illness, condition, disability, diagnosis, treatment, cause of death or medical history for them, and never infer one from the charity's cause (a hospice, a cancer charity, a sight-loss charity says nothing about this person). If no link between the charity and the person is given, do not supply one: name the charity and leave the reason to the organiser.`
    const charityFit = edges.e3
      ? ` The charity's fit with the occasion is given above; you may say it in a few plain words, as the examples do ("Marie Curie nurses were with her at the end"), or leave it to the closing.`
      : ` The charity is named in the closing sentence and nowhere else.`
    instructions = `- "about": write it the way the four examples below are written: two or three sentences, 40 to 65 words in all, about the person and the occasion, in plain words, ending with the closing sentence given here exactly, nothing added after it: "${closing}"${tenseRule}${edgeRule}${truthRule}${babyRule}${effortRule}${realPersonRule}${charityFit}${pronounHint}${nameHint}
- "reveal" (guests see it only AFTER pledging): start with exactly "${opener}".${entityGuard} Then ${pick ? `exactly this option, verbatim: "${pick}"` : "a plausible option from the list (you MUST use a real option, verbatim)"}, then a full stop, then ONE short sentence with a single detail of the PROTAGONIST'S own relationship to that favourite${first ? " (in the first person)" : ""}: a plain fact will do ("her bathroom is full of dolphin pictures", "he read it during his gap year"); it need not be a habit or an action, and it must pass the honour test above. Something the about did not already say. The detail involves the favourite ITSELF (what they do with it, where, how often), not a mood, a light or a weather that stands near it. When the favourite is a KIND of thing (a breed, a cuisine, a type of holiday), the detail is about one particular one in their life, never the kind at large.${tenseRule} The detail must be entirely the protagonist's own and must NOT depend on any real-world fact about the favourite: no fixture dates or match traditions, no seasons, tours, episodes, eras, or biography (a claim like "watched them play on Boxing Day" fails if that favourite doesn't play then; avoid the whole category). The options may be famous real people, teams, or works: never state or invent facts about them. No preamble such as "We can't wait to reveal".

${exemplarsBlock({ register, occasionType, topicTitle, causeFamily, pronoun, grouping })}`
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
  const bad = (d: DraftFields) =>
    violatesCopyRules(`${d.about} ${d.reveal}`) ||
    hasTics(`${d.about} ${d.reveal}`)
  if (!bad(first)) return first
  const retry = await callLLM(prompt, modelId).catch(() => null)
  return retry && !bad(retry) ? retry : first
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
  /** The charitable objects (2026-09-25): a second purpose source. */
  objects?: string | null
  /** Where it works: local authorities or countries. */
  areas?: { area: string; type: string }[] | null
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
  /**
   * The favourite, chosen by the caller: the seed picks a random item so
   * the model stops defaulting to Camber Sands, Sissinghurst and Stand by
   * Me across cohorts (2026-09-24). The wizard leaves it to the model.
   */
  pick?: string | null
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
  const closingPoss =
    input.subject === "someone"
      ? firstPerson(input.pronoun)
        ? ownPossessive(input.grouping)
        : namePossessive(input.displayName, input.grouping)
      : null
  const closing =
    input.subject === "someone"
      ? closingPoss
        ? closingSentence(
            input.charity.name,
            pickRevealPromise(closingPoss),
            input.topicTitle
          )
        : `Pledge to ${input.charity.name ?? "charity"} and pick your favourite ${input.topicTitle.toLowerCase()}.`
      : null
  const prompt = buildPrompt({
    register: input.register,
    subject: input.subject,
    occasionType: input.occasionType,
    topicTitle: input.topicTitle,
    itemLabels: input.itemLabels,
    charityName: input.charity.name,
    charityDescription: input.charity.description,
    charityActivities: input.charity.activities,
    charityObjects: input.charity.objects ?? null,
    charityAreas: input.charity.areas ?? null,
    edges,
    pronoun: input.subject === "someone" ? input.pronoun : undefined,
    grouping: input.subject === "someone" ? input.grouping : undefined,
    displayName: input.displayName ?? null,
    fiction: input.fiction ?? false,
    closing: closing ?? undefined,
    pick: input.pick ?? null,
    causeFamily: input.charity.causeFamily,
  })

  let parsed = await callLLMWithCopyCheck(prompt, modelId)
  // A first-person couple or group keeps "we" in the note.
  if (
    firstPerson(input.pronoun) &&
    (input.grouping === "couple" || input.grouping === "group") &&
    slipsToSingular(parsed.reveal)
  ) {
    const retry = await callLLM(prompt, modelId).catch(() => null)
    if (retry && !slipsToSingular(retry.reveal)) parsed = retry
  }
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
  // The model sometimes returns the first sentence alone (Gordon, fifth
  // cohort): the closing is the invitation and the reveal promise, so it
  // is appended when missing rather than left to chance.
  // Any promise form counts as present: the model may pick a different
  // one from the rotation, and two closings would be worse than one.
  const closingPrefix = `Pledge to ${input.charity.name ?? "charity"}, pick your`
  const withClosing = (about: string) =>
    closing &&
    !about.includes(closingPrefix) &&
    !about.includes(closing.slice(0, -1))
      ? `${endStop(about)} ${closing}`
      : about
  return {
    about: withClosing(tidy(parsed.about)),
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
    | "subject"
    | "topicTitle"
    | "occasionType"
    | "displayName"
    | "grouping"
    | "pronoun"
  >,
  edges: StoryEdges,
  modelId: string
): Promise<StoryVerdict> {
  const isCause = input.subject === "cause"
  const who = isCause
    ? `a cause (${input.displayName ?? "unnamed"})`
    : `${input.displayName ?? "the person"}, ${input.grouping === "couple" ? "a couple" : input.grouping === "group" ? "a group" : "one person"}${firstPerson(input.pronoun) ? ", writing about themselves in the first person (fail it if it slips into the third person)" : ""}`
  const effort = EFFORT_OCCASIONS.has(input.occasionType ?? "")
    ? " The occasion is a sponsored effort still to come: fail it if the effort is written as already done."
    : ""
  const baby = BABY_OCCASIONS.has(input.occasionType ?? "")
    ? " The occasion is a birth: the people honoured are the PARENTS, on behalf of their child; the favourite is the parents' own. Fail it if the baby is given a favourite, a preference or a habit, or if a favourite is said to be chosen for the baby."
    : ""
  const edgeLines = [edges.e1, edges.e2, edges.e3]
    .filter((e): e is Edge => Boolean(e))
    .map((e) => `- ${e.text}`)
    .join("\n")
  const prompt = `You are a relative reading a favpoll page at a real event. A favpoll honours someone; guests pledge to charity and pick a favourite; after pledging they see the honoured person's own favourite. You are checking whether the copy reads as something a family member would actually have written about a real person. Answer with JSON only.

Occasion: ${input.occasionType ?? "unknown"}. Honouring: ${who}.${baby}${effort}
Topic: Favourite ${input.topicTitle}.
Links the writer was given:
${edgeLines || "(none)"}

ABOUT (read before pledging):
"""${story.about}"""

NOTE (read after pledging):
"""${story.note}"""

Then read it once more as someone who LOVES the person. Would they be glad to hear this said about them at their own party or memorial? Gentle teasing is fine, and normal at a leaving do or a birthday; fail only what makes them look small or sad rather than fond.
Then read it once more as a good EDITOR. Fail it if the writing is contrived, vague, forced or over-intense, or if the note's detail is not about the favourite itself. Examples that FAIL that reading, from the founder's own review:
- "always notices which way the wind is blowing" (a contrived link to the topic);
- "it felt like the right place to start something" (vague: start what?);
- "shows it to anyone who asks" (nobody asks; a tic);
- "argue kindly" (an oxymoron);
- "a favourite cuisine has settled somewhere in there" (passive and vague);
- a person made to seem obsessed with ice cream, or with cat breeds (over-intense);
- "she takes her tea onto the step when the light turns yellow" as the detail for a favourite kind of weather for a WALK (the detail is not about the walk).

Fail it if ANY of these is true:
- a baby or a child too young has a favourite, a habit or a memory;
- a place, an object, a time of day or a smell is given agency ("walked every mile with her", "steadies him", "feels most like his own");
- a quirk, talisman, superstition or joke invented for effect (a sandwich kept in a coat pocket "just in case");
- the person is written as the wrong age or the wrong person for the occasion;
- a sentence that does not make sense, or that no relative would say out loud;
- a link between the charity and the topic that the edges above do not give ("humanitarian work reaches rivers", "a favourite river follows the routes where that work happens"): when no such edge is listed, any connection drawn is invented;
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
