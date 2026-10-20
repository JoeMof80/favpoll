import { z } from "zod"
import { actionId } from "@/lib/action-input"
import type { FavpollGrouping, Pronoun } from "@favpoll/types"

// THE WIZARD'S PUBLISH PATH (#1109, 2026-10-20).
//
// `createFavpoll` writes seven tables from one argument, so its shape is
// worth stating. The same reasoning as the generator's schemas applies
// (lib/actions/generate-draft-input.ts): nothing has been charged, every
// id is machine-supplied by a picker, and the free text is bounded well
// above anything the form collects.
//
// What the server already guarded, and keeps guarding in its own words: a
// favpoll must have a name (`subject === "someone"`) or a cause name
// (`subject === "cause"`). Those two throws stay where they are — they
// read the SUBJECT to decide, which is a rule about the favpoll rather
// than a rule about the field.

const ID_MESSAGE = "That favpoll, topic or charity wasn't recognised."
const id = actionId(ID_MESSAGE)

/** Free text, collapsed to one line and bounded. The form caps these far
 *  lower (components/favpoll-form/schema.ts); this is the outer wall. */
const text = (max: number, message: string) =>
  z
    .string(message)
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .refine((s) => s.length <= max, message)

/** The about and the note are paragraphs, so newlines survive — only the
 *  length is bounded. */
const prose = (max: number, message: string) =>
  z.string(message).max(max, message)

const TOO_LONG = "That's longer than we can store."
const grouping = z.enum(
  ["individual", "couple", "group"],
  "That isn't a grouping we know."
)
const pronoun = z.enum(
  ["he", "she", "they", "i"],
  "That isn't a pronoun we know."
)

// The enums mirror @favpoll/types both ways; tsc is what enforces it.
type SameSet<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
const _grouping: SameSet<z.infer<typeof grouping>, FavpollGrouping> = true
const _pronoun: SameSet<z.infer<typeof pronoun>, Pronoun> = true
void _grouping
void _pronoun

const customTopic = z
  .object({
    title: text(200, "That topic name is too long."),
    items: z
      .array(text(200, "One of those options is too long."))
      .max(500, "That's more options than one favpoll can carry."),
  })
  .nullable()

const infiniteItems = z
  .object({
    canonicalItemIds: z.array(id).max(1000, "That's too many options."),
    customLabels: z
      .array(text(200, "One of those options is too long."))
      .max(500, "That's more options than one favpoll can carry."),
  })
  .nullable()

const poll = z.object({
  /** The wizard sends null for a topic of the organiser's own. */
  topicId: id.nullable(),
  subsetId: id.nullable().optional(),
  customTopic,
  note: prose(2000, TOO_LONG).nullable(),
  infiniteItems,
  addedItems: z
    .array(text(200, "One of those options is too long."))
    .max(500, "That's more options than one favpoll can carry.")
    .optional(),
})

export const createFavpollSchema = z.object({
  // Empty for a cause: the wizard sends "" and the action's own guard
  // decides which of the two names is required.
  protagonistName: text(200, "That name is too long."),
  protagonistAbout: prose(2000, TOO_LONG).nullable(),
  photoUrl: text(2000, "That photo link is too long.").nullable(),
  dateLabel: text(200, TOO_LONG).nullable(),
  category: text(100, TOO_LONG).nullable(),
  grouping,
  subject: z.enum(
    ["someone", "cause"],
    "A favpoll is either about someone or about a cause."
  ),
  causeLabel: text(200, "That cause name is too long.").nullable(),
  pronoun: pronoun.nullable().optional(),
  openingLine: text(200, TOO_LONG).nullable(),
  description: prose(2000, TOO_LONG).nullable(),
  charityIds: z.array(id).max(3, "A favpoll can name at most three charities."),
  /** The client sends `date.toISOString()`. Before this, a string Date
   *  could not read reached `new Date(...).toISOString()` and threw a
   *  RangeError the organiser saw as a generic failure. */
  closesAt: z.iso.datetime({
    offset: true,
    error: "That closing date didn't make sense.",
  }),
  isPrivate: z.boolean("Say whether the favpoll is private."),
  isListed: z.boolean("Say whether the favpoll is listed."),
  allowGuestItems: z.boolean("Say whether guests may add options."),
  showGuestAmounts: z
    .boolean("Say whether guest amounts are shown.")
    .optional(),
  appealId: id.nullable().optional(),
  /**
   * MONEY, AND LEFT AS PERMISSIVE AS IT WAS. This writes
   * `favpoll_pots.total_deposited` directly, and both callers send null.
   * A nonnegative, finite bound is a strict improvement — a negative or a
   * NaN would corrupt the pot — but whether a non-zero value should be
   * refused outright is a ledger decision, not a schema one, so it is
   * raised rather than taken here.
   */
  potAmount: z
    .number("That amount isn't a number we can take.")
    .nonnegative("That amount isn't a number we can take.")
    .nullable(),
  goalAmount: z
    .number("That goal isn't a number we can take.")
    .nonnegative("That goal isn't a number we can take.")
    .nullable()
    .optional(),
  poll,
})

export const registerCharitySchema = z.object({
  /** The action strips everything but digits, so the shape is loose and
   *  its own "Invalid charity number" still answers an empty result. */
  registeredNumber: z.string("A charity number is required.").max(50, TOO_LONG),
  displayName: text(200, "That charity name is too long."),
})

// ── The photo ───────────────────────────────────────────────────────────
//
// The filename used to decide the storage key: `file.name.split(".").pop()`
// became the object's extension, so a name of "../../../etc/passwd" made a
// key of "<user>/<ts>./etc/passwd" and a name with no dot made the whole
// name the extension. The type is what the key is built from now
// (photoExtension below), and the filename is not read at all.
//
// GENEROUS ON PURPOSE. Every honest caller re-encodes through a canvas
// (components/favpoll-form/hero-photo-overlay.tsx builds `new File([blob],
// …, { type: "image/jpeg" })`), so jpeg is all that arrives today. The
// rest are here so a future raw-file path — an iPhone's HEIC, say —
// cannot be refused by this list. What it stops is a file that is not an
// image at all: the bucket is PUBLIC, so a text/html upload would be a
// page served from the project's storage domain.
const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
}

/** Vercel refuses a request body over 4.5MB before the action runs, so
 *  this is the belt to that braces rather than the only limit. */
const MAX_PHOTO_BYTES = 15 * 1024 * 1024

export const personPhotoSchema = z.object({
  photo: z
    .instanceof(File, { error: "No photo was attached." })
    .refine((f) => f.size > 0, "That photo was empty.")
    .refine((f) => f.size <= MAX_PHOTO_BYTES, "That photo is too large.")
    .refine(
      (f) => f.type in PHOTO_EXTENSIONS,
      "That file isn't an image we can use."
    ),
})

/** The extension for the storage key, from the TYPE the schema accepted. */
export function photoExtension(type: string): string {
  return PHOTO_EXTENSIONS[type] ?? "jpg"
}
