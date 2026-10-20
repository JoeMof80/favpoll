import { one, type Embedded } from "@/lib/supabase/relation"

// A poll's TITLE (favpoll-topic-rules §1, ruling 4): the subset's name
// everywhere — hero, card, share text, live display, guest book, keepsake,
// print — and the parent's only on the record. Every loader that embeds
// `topics ( title )` on a poll embeds `topic_subsets ( title )` beside it
// and passes both here. PostgREST hands back an object or a one-element
// array depending on the join, so both are accepted.

type Titled = Embedded<{ title: string }>

/** This file named the pattern first; `one` is now shared (#1106). */
function title(x: Titled): string | null {
  return one<{ title: string }>(x)?.title ?? null
}

export function pollTitle(poll: {
  topics?: Titled
  topic_subsets?: Titled
}): string | null {
  return title(poll.topic_subsets) ?? title(poll.topics)
}

/** The select fragment for a poll's title, subset first. */
export const POLL_TITLE_SELECT = "topics ( title ), topic_subsets ( title )"
