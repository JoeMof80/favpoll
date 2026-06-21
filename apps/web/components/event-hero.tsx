"use client"

import { BaseEventHero } from "./heroes/base-event-hero"
import type { Favpoll, Protagonist } from "@favpoll/types"

type Props = {
  event: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
}

export function EventHero({
  event,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
}: Props) {
  return (
    <BaseEventHero
      event={event}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
    />
  )
}
