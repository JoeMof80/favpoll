import { z } from "zod"
import { actionId } from "@/lib/action-input"
import type { FavpollGrouping, Pronoun, Register } from "@favpoll/types"
import { OCCASION_TYPES_BY_REGISTER } from "@/lib/registers"

// WHY THESE SCHEMAS ARE TIGHTER THAN THE PLEDGE PATH'S (#1109, 2026-10-20).
//
// lib/action-input.ts explains why the pledge schemas stay loose: by the
// time a money action runs the card has been charged, so a refusal there
// is somebody debited for nothing. Neither reason applies here.
//
// 1. NOTHING HAS HAPPENED YET. A refused generation costs the organiser a
//    toast and a retry, not money.
// 2. EVERY ID IS MACHINE-SUPPLIED. The topic, subset and charity ids come
//    from pickers that read them out of the database; an organiser never
//    types one. A format check cannot refuse an honest person, which on
//    the money path it could.
// 3. THE FREE TEXT GOES INTO A MODEL PROMPT. `topicTitle`, `itemLabels`
//    and `displayName` are interpolated verbatim into the Story prompt
//    (lib/story-engine.ts buildPrompt) — one of them inside a quoted
//    instruction. Bounding their length and collapsing their whitespace
//    bounds what an interpolation can do and what a generation can cost.
//    It does NOT make the prompt injection-proof: that needs the prompt
//    itself to delimit its inputs, which is its own change.

const ID_MESSAGE = "That topic, subset or charity wasn't recognised."
const id = actionId(ID_MESSAGE)

/**
 * A single-line field that ends up inside the prompt. Collapsed, not just
 * trimmed: these come from one-line inputs, so an interior newline is
 * never something an organiser meant, and a prompt is a document made of
 * lines. Length is checked AFTER collapsing, so padding alone is tidied
 * rather than refused.
 */
const oneLine = (max: number, message: string) =>
  z
    .string(message)
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .refine((s) => s.length <= max, message)

// Generous next to the form that collects them (components/favpoll-form/
// schema.ts caps a title at 50, a name at 40, a label at 50). These are
// the outer wall, not the field rule: only a crafted request or a bug
// reaches them.
const TITLE_MAX = 200
const NAME_MAX = 200
const LABEL_MAX = 200
/** A subset's members arrive here too, not just hand-typed labels, so the
 *  ceiling clears any real catalogue. It exists because the validators
 *  walk the whole array (revealNamesRealItem, stripEmDashes), which an
 *  unbounded one turns into work the request pays for. */
const LABELS_MAX = 500

const register = z.enum(
  ["remembering", "celebrating_one", "celebrating_many", "cause", "neutral"],
  "That isn't a kind of favpoll we know."
)
const subject = z.enum(
  ["someone", "cause"],
  "A favpoll is either about someone or about a cause."
)
const pronoun = z.enum(
  ["he", "she", "they", "i"],
  "That isn't a pronoun we know."
)
const grouping = z.enum(
  ["individual", "couple", "group"],
  "That isn't a grouping we know."
)

// THE ENUMS MIRROR @favpoll/types AND MUST NOT DRIFT. The pledge schemas
// derive their types from the schema; these can't, because the unions are
// the shared package's. So assert the two are the same set, both ways —
// add a Register in the package without adding it here and this stops
// compiling.
type SameSet<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
const _register: SameSet<z.infer<typeof register>, Register> = true
const _pronoun: SameSet<z.infer<typeof pronoun>, Pronoun> = true
const _grouping: SameSet<z.infer<typeof grouping>, FavpollGrouping> = true
void _register
void _pronoun
void _grouping

/** Every occasion type the registers module knows, from the module, so a
 *  new one needs no edit here. An empty string is legal and means "none":
 *  resolveOccasionType falls through it to the register's default. */
const OCCASION_TYPES = new Set(Object.values(OCCASION_TYPES_BY_REGISTER).flat())
const OCCASION_MESSAGE = "That isn't an occasion we know."
const occasionType = z
  .string(OCCASION_MESSAGE)
  .transform((s) => s.trim())
  .refine((s) => s === "" || OCCASION_TYPES.has(s), OCCASION_MESSAGE)
  .nullable()
  .optional()

/** Shared by the generator and the ghost prefetch, which differ only in
 *  what they accept as a topic id. */
const draftShape = {
  register,
  subject,
  subsetId: id.nullable().optional(),
  primaryCharityId: id.nullable().optional(),
  itemLabels: z
    .array(oneLine(LABEL_MAX, "One of those options is too long."))
    .max(LABELS_MAX, "That's more options than one favpoll can carry.")
    .optional(),
  pronoun: pronoun.optional(),
  grouping: grouping.optional(),
  displayName: oneLine(NAME_MAX, "That name is too long.")
    .nullable()
    .optional(),
  occasionType,
  enacted: z.boolean("Say whether the picks decide the night.").optional(),
  skipCache: z.boolean("skipCache must be true or false.").optional(),
}

/**
 * An empty topicId is the CUSTOM-TOPIC branch, not a missing field
 * (generate-draft.ts takes it as the signal). It then needs a title, which
 * was a bare `throw new Error("topicTitle required for custom topics")`
 * before this — a developer's sentence, shown to nobody.
 */
export const generateDraftSchema = z
  .object({
    ...draftShape,
    topicId: z.union([z.literal(""), id], ID_MESSAGE),
    topicTitle: oneLine(TITLE_MAX, "That topic name is too long.").optional(),
  })
  .refine((v) => v.topicId !== "" || Boolean(v.topicTitle), {
    message: "A topic of your own needs a name before we can write about it.",
    path: ["topicTitle"],
  })

/**
 * The ghost prefetch has NO empty-topicId branch — "Custom topics are
 * excluded by the caller (empty topicId would collide in the key)" is the
 * action's own comment, and this is that sentence as a check.
 */
export const cachedDraftGhostsSchema = z.object({
  ...draftShape,
  topicId: id,
  topicTitle: oneLine(TITLE_MAX, "That topic name is too long.").optional(),
})

/** The enacted lookup reads titles only: no charity, no name, no labels. */
export const pairingIsEnactedSchema = z.object({
  register,
  subject,
  topicId: id,
  subsetId: id.nullable().optional(),
  occasionType,
})
