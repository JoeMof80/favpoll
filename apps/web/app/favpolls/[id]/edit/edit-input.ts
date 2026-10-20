import { z } from "zod"
import {
  TOO_LONG,
  category,
  closesAt,
  favpollScalars,
  grouping,
  id,
  infiniteItems,
  optionLabels,
  prose,
  subject,
  text,
} from "@/lib/favpoll-input"

// THE EDIT PATH (#1109, 2026-10-20).
//
// `updateFavpoll` writes the same columns as `createFavpoll` from a
// differently shaped argument — `CanvasSubmitData`, whose poll keeps the
// custom topic FLAT (topicIsCustom / customTopicTitle / customTopicItems)
// where the create path nests it. The fields are the shared ones from
// lib/favpoll-input, so the two paths cannot describe the same column
// two ways.
//
// Its own guards stay its own: a name or a cause name by subject,
// ownership, "closed and can no longer be edited", and the step locks.
// All four read the DATABASE to decide, so none of them is a schema's
// business.

const poll = z.object({
  /** Present when the favpoll already has a poll row to update. */
  id: id.optional(),
  topicId: id.nullable(),
  subsetId: id.nullable().optional(),
  topicIsCustom: z.boolean("Say whether the topic is the organiser's own."),
  customTopicTitle: text(200, "That topic name is too long."),
  customTopicItems: optionLabels,
  note: prose(2000, TOO_LONG).nullable(),
  infiniteItems,
})

const canvasSubmitSchema = z.object({
  ...favpollScalars,
  category: category.nullable(),
  grouping,
  subject,
  poll,
})

/** The three arguments as a tuple, so one parse answers for all of them —
 *  the shape `topUpFund` established in #1104. */
export const updateFavpollSchema = z.tuple([
  id,
  /** The protagonist row to update. A cause favpoll has none, and the
   *  action is called with "" for it. */
  z.union([z.literal(""), id], TOO_LONG),
  canvasSubmitSchema,
])

export const updateClosesAtSchema = z.tuple([id, closesAt])
