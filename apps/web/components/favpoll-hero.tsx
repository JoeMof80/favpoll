"use client"

import { BaseFavpollHero } from "./heroes/base-favpoll-hero"
import type { Favpoll, Protagonist } from "@favpoll/types"
import type { MentionTarget } from "@/lib/mentions"

type Props = {
  favpoll: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
  mentions?: MentionTarget[]
  compact?: boolean
  /** Off for the screen in the room: a static band (HeroLayout). */
  animate?: boolean
}

export function FavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  mentions,
  compact,
  animate,
}: Props) {
  return (
    <BaseFavpollHero
      favpoll={favpoll}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
      mentions={mentions}
      compact={compact}
      animate={animate}
    />
  )
}
