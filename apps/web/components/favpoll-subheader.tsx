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
      // Sits 1.5rem above the mobile charity footer, whatever its height — the
      // footer publishes --charity-footer-h (see MobileCharityFooter). The
      // fallback is the footer's no-goal height, for the paint before hydration.
      className="fixed right-5 bottom-[calc(var(--charity-footer-h,calc(env(safe-area-inset-bottom)+3.1rem))+1.5rem)] z-30 flex flex-col items-end gap-2 md:bottom-5"
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
          className="size-14 rounded-full shadow-lg [&_svg]:size-6"
        >
          <Link href={`/favpolls/${favpollId}/edit`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  )
}
