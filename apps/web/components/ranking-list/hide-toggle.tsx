"use client"

import { useTransition } from "react"
import {
  hideFavpollPollFavourite,
  showFavpollPollFavourite,
} from "@/lib/actions/favpoll-poll-favourites"

type Props = {
  isHidden: boolean
  favouriteId: string
}

export function HideToggle({ isHidden, favouriteId }: Props) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      if (isHidden) {
        await showFavpollPollFavourite(favouriteId)
      } else {
        await hideFavpollPollFavourite(favouriteId)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="ml-2 shrink-0 rounded border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      {isPending ? "…" : isHidden ? "Show" : "Hide"}
    </button>
  )
}
