import { z } from "zod"
import {
  OPTION_TOO_LONG,
  TOO_LONG,
  TOO_MANY_OPTIONS,
  category,
  favpollScalars,
  grouping,
  id,
  infiniteItems,
  optionLabels,
  prose,
  subject,
  text,
} from "@/lib/favpoll-input"

// THE WIZARD'S PUBLISH PATH (#1109, 2026-10-20).
//
// `createFavpoll` writes seven tables from one argument, so its shape is
// worth stating. The fields themselves live in lib/favpoll-input, shared
// with the edit path, which writes the same columns from a differently
// shaped argument; only the poll's shape and the two extras differ.
//
// What the server already guarded, and keeps guarding in its own words: a
// favpoll must have a name (`subject === "someone"`) or a cause name
// (`subject === "cause"`). Those two throws stay where they are — they
// read the SUBJECT to decide, which is a rule about the favpoll rather
// than a rule about the field.

const customTopic = z
  .object({
    title: text(200, "That topic name is too long."),
    items: z.array(text(200, OPTION_TOO_LONG)).max(500, TOO_MANY_OPTIONS),
  })
  .nullable()

const poll = z.object({
  /** The wizard sends null for a topic of the organiser's own. */
  topicId: id.nullable(),
  subsetId: id.nullable().optional(),
  customTopic,
  note: prose(2000, TOO_LONG).nullable(),
  infiniteItems,
  addedItems: optionLabels.optional(),
})

export const createFavpollSchema = z.object({
  ...favpollScalars,
  category: category.nullable(),
  grouping,
  subject,
  appealId: id.nullable().optional(),
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
