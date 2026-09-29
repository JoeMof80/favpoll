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
}

export function FavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  mentions,
  compact,
}: Props) {
  return (
    <BaseFavpollHero
      favpoll={favpoll}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
      mentions={mentions}
      compact={compact}
    />
  )
}
