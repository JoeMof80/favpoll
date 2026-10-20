import { z } from "zod"
import { id } from "@/lib/favpoll-input"
import type { StoryField } from "./actions"

// IN-PLACE EDITING, ONE FIELD AT A TIME (#1109, 2026-10-20).
//
// What these schemas DO NOT do is repeat the per-field rules
// `updateStoryFieldInner` already states — the length limits, "A name is
// required", "The goal must be a positive amount." Those read `isCause`
// out of the database to decide which column a field lands in, so they
// belong where they are and their sentences are good.
//
// WHAT WAS MISSING WAS THE FIELD NAME ITSELF. `field` was typed as
// StoryField and checked nowhere, and nothing downstream refused an
// unknown one: `LIMITS[field]` is undefined, so the length guard passes;
// the two required-field guards name specific fields; and the switch that
// writes has NO DEFAULT. So an unrecognised field fell through all of it,
// wrote nothing, threw nothing, and `asResult` answered { ok: true }. A
// silent success is the worst of the three possible answers.

const FIELD_MESSAGE = "That isn't a field we can change."

export const storyField = z.enum(
  [
    "opening_line",
    "name",
    "context",
    "about",
    "goal_amount",
    "photo_url",
    "note",
  ],
  FIELD_MESSAGE
)

// The enum mirrors the StoryField union both ways; tsc enforces it, so a
// field added to one and not the other stops compiling.
type SameSet<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
const _field: SameSet<z.infer<typeof storyField>, StoryField> = true
void _field

export const updateStoryFieldSchema = z.tuple([
  id,
  storyField,
  /** The value's own rules are the action's, by field. This only says it
   *  is one of the three kinds a column can take — not an object, not an
   *  array, not a function's worth of anything. */
  z.union(
    [
      z.string("That value isn't something we can store."),
      z.number("That value isn't something we can store."),
      z.null(),
    ],
    "That value isn't something we can store."
  ),
])

/** The count is the action's own rule ("Pick between one and three
 *  charities.") because it dedupes first; this says they are ids. */
export const setFavpollCharitiesSchema = z.tuple([
  id,
  z.array(id).max(10, "That's more charities than we can read."),
])

export const setFavpollTopicSchema = z.tuple([
  id,
  z.object({ topicId: id, subsetId: id.nullable() }),
])

export const setPicksSuspendedSchema = z.tuple([
  id,
  z.boolean("Say whether the picks are suspended."),
])
