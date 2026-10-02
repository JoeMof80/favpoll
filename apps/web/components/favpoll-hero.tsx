"use client"

import { BaseFavpollHero } from "./heroes/base-favpoll-hero"
import type { Favpoll, Protagonist } from "@favpoll/types"
import type { MentionTarget } from "@/lib/mentions"
import type { HeroFundraiser } from "./heroes/fundraiser-slots"

type Props = {
  favpoll: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
  mentions?: MentionTarget[]
  compact?: boolean
  fundraiser?: HeroFundraiser
}

export function FavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  mentions,
  compact,
  fundraiser,
}: Props) {
  return (
    <BaseFavpollHero
      favpoll={favpoll}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
      mentions={mentions}
      compact={compact}
      fundraiser={fundraiser}
    />
  )
}
