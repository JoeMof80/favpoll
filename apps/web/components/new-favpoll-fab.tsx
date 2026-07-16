"use client"

import { Plus } from "lucide-react"
import { NewFavpollButton } from "@/components/new-favpoll-button"

// The floating "New favpoll" action for list pages — replaces the page-header
// button. NewFavpollButton already handles the signed-out redirect.
export function NewFavpollFab() {
  return (
    <NewFavpollButton className="fixed right-6 bottom-6 z-40 size-14 rounded-full shadow-lg [&_svg]:size-6">
      <Plus aria-hidden="true" />
      <span className="sr-only">New favpoll</span>
    </NewFavpollButton>
  )
}
