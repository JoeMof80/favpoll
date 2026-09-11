"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Gift, Settings2 } from "lucide-react"
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
// borrow, 2026-07-29); organisers additionally get the MANAGE door
// (founder, 2026-09-06 — manage is the one door; the old pencil went
// straight to edit, a pre-hub relic). Open or closed: a closed
// favpoll's manage page is where the keepsake lives.
export function FavpollSubheader({
  favpollId,
  favpollName,
  isOrganiser,
  isClosed,
}: Props) {
  // Mark this favpoll as the list's return target (founder, 2026-09-06
  // v3): the outbound click-capture save proved unverifiable on the
  // founder's phone, so the favpoll page itself arms the return — any
  // route in (card tap, step row, share link) counts, and the All
  // favpolls list scrolls this card into view on its next mount.
  useEffect(() => {
    try {
      sessionStorage.setItem("favpolls:return", `/favpolls/${favpollId}`)
      sessionStorage.setItem("favpolls:return-t", String(Date.now()))
    } catch {
      // best effort
    }
  }, [favpollId])
  return (
    <div
      // Mobile: the fixed charity bar owns the bottom edge — clear it so
      // the FABs never sit over its £ figure (founder catch, 2026-07-29).
      // The FABs ride --charity-footer-visible-h (see MobileCharityFooter):
      // when the footer tucks away on scroll-down it drops to 0px, so they
      // GLIDE down into the corner, X-style, floored at the safe-area
      // (founder, 2026-09-09 — "move down too but stay visible, slightly
      // further into the corner"). Fallback is the footer's no-goal height,
      // for the paint before hydration. Desktop (md+) has no bar.
      className="fixed right-4 bottom-[calc(max(var(--charity-footer-visible-h,calc(env(safe-area-inset-bottom)+3.1rem)),env(safe-area-inset-bottom))+1rem)] z-30 flex flex-col items-end gap-2 transition-[bottom] duration-300 md:right-5 md:bottom-5"
    >
      {/* Mobile: Pledge FAB — the primary action. Share moves to the
          topic heading's overflow menu. The FAB dispatches a custom
          event that FavpollContent listens for to open the dialog. */}
      {!isClosed && (
        <Button
          type="button"
          size="icon"
          aria-label="Pledge"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("favpoll:pledge"))
          }
          className="size-14 rounded-full shadow-lg md:hidden [&_svg]:size-6"
        >
          <Gift aria-hidden="true" />
        </Button>
      )}
      {isOrganiser && (
        <Button
          asChild
          size="icon"
          aria-label="Manage favpoll"
          className="size-14 rounded-full shadow-lg [&_svg]:size-6"
        >
          <Link href={`/favpolls/${favpollId}/manage`}>
            <Settings2 aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  )
}
