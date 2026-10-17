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
  pins?: boolean
  /** The band\'s own line on the phone — the countdown or the closed date,
   *  as the old slide-in bar carried it (founder, 2026-10-16). */
  banner?: React.ReactNode
  /** The room's fundraiser dial keeps the hero but drops the About
   *  (founder, 2026-10-17: "keep the left column the same as tribute
   *  view, except remove the About"). */
  hideAbout?: boolean
}

export function FavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  mentions,
  compact,
  pins,
  banner,
  hideAbout,
}: Props) {
  return (
    <BaseFavpollHero
      favpoll={favpoll}
      protagonist={protagonist}
      hideAvatar={hideAvatar}
      aboutPlaceholder={aboutPlaceholder}
      mentions={mentions}
      compact={compact}
      pins={pins}
      banner={banner}
      hideAbout={hideAbout}
    />
  )
}
