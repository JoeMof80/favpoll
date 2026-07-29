"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareFavpollButton } from "@/components/share-favpoll-button"

type Props = {
  favpollId: string
  /** For the native share sheet title */
  favpollName: string
  isOrganiser: boolean
  isClosed?: boolean
}

// Floating action cluster, bottom right. Share is for EVERYONE — a guest
// at a wake is the favpoll's best distribution channel (the JustGiving
// borrow, 2026-07-29); organisers additionally get Edit while open.
export function FavpollSubheader({
  favpollId,
  favpollName,
  isOrganiser,
  isClosed,
}: Props) {
  return (
    <div
      // Mobile: the fixed charity bar owns the bottom edge — clear it so
      // the FABs never sit over its £ figure (founder catch, 2026-07-29).
      // Desktop (md+) has no bar; hug the corner as before.
      className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 flex flex-col items-end gap-2 md:bottom-5"
    >
      {/* Mobile only — desktop share lives in the right rail */}
      <ShareFavpollButton
        variant="fab"
        shareTitle={`${favpollName} — favpoll`}
        className="md:hidden"
      />
      {isOrganiser && !isClosed && (
        <Button
          asChild
          size="icon"
          aria-label="Edit Favpoll"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Link href={`/favpolls/${favpollId}/edit`}>
            <Pencil className="h-5 w-5" />
          </Link>
        </Button>
      )}
    </div>
  )
}
