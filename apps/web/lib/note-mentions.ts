import type { MentionTarget } from "@/lib/mentions"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Favourite,
} from "@favpoll/types"

// ONE BUILDER FOR THE NOTE'S MENTIONS (2026-10-22). The sheet lights the
// charity, topic and favourite names inside the note (founder, 2026-09-28:
// "the same tint in the note"), and the pledge sheet now reads that same note
// out before it leaves — so the two have to tint it identically or a guest
// sees the same sentence twice, moments apart, looking different.
//
// Favourites come from the FULL list (the picker's), not the standings' —
// those are filtered to pledged items, and a note names its favourite before
// anyone has pledged (founder, 2026-09-28: "no noticeable changes!!!" on a
// favpoll with no pledges yet).

/** The charities and the topic — lit under the name on the card, and in the
 *  About. */
export function aboutMentions(
  favpoll: FavpollWithDetails,
  pollWithItems: FavpollPollWithItems | null
): MentionTarget[] {
  return [
    ...favpoll.favpoll_charities.map((ec) => ({
      kind: "charity" as const,
      label: ec.charities.name,
      id: ec.charities.id,
    })),
    ...(pollWithItems
      ? [
          {
            kind: "topic" as const,
            label: pollWithItems.topics.title,
            id: pollWithItems.topic_id,
          },
        ]
      : []),
  ]
}

/** The About's mentions plus every favourite — what the note gets. */
export function noteMentions(
  favpoll: FavpollWithDetails,
  pollWithItems: FavpollPollWithItems | null,
  favourites: readonly Favourite[]
): MentionTarget[] {
  return [
    ...aboutMentions(favpoll, pollWithItems),
    ...favourites.map((i) => ({ kind: "item" as const, label: i.label })),
  ]
}
