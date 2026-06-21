"use client"

import { BaseFavpollHero } from "./heroes/base-favpoll-hero"
import type { Favpoll, Protagonist } from "@favpoll/types"

type Props = {
  event: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
}

export function FavpollHero({
  event,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
}: Props) {
  return (
    <BaseFavpollHero
      event={event}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
    />
  )
}
