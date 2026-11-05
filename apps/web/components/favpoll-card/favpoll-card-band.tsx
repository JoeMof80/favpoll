import { Badge } from "@/components/ui/badge"
import { ClosingLabel } from "@/components/closing-label"
import { FavpollHeader } from "./favpoll-header"
import type { FavpollCardSize } from "./types"

// THE CARD'S HEADER, shared by the list card and the summary card
// (founder, 2026-11-04 → 05, eleven mock rounds on a throwaway branch).
// It is the favpoll page's stacked header at card scale: a 40px band in
// the register's tint carrying the countdown at its left (the page's own
// placement) and the Example badge beside it, with the mark offset over
// the band's lower edge, hanging half below. Then the eyebrow, a gap, and
// the name at full width.
//
// Why the gap is unconditional: the mark hangs into the header beside the
// eyebrow, so the name starts below it and runs the whole width before it
// truncates. A card without a mark keeps the same gap so its header is the
// same height as its neighbours (Marcus Bell's was shorter in mock 13).
//
// Why 18px: the name is a step up from the topic heading's 15px — at 16px
// it read smaller than the uppercase line beneath it (founder, 2026-11-04).
//
// The band's height is fixed and short on purpose. Matching the banner's
// height was tried (mock 3) and was "too much height for cards with no
// banner" — the banner lives on the list card's story face instead.
//
// No rule between the header and the topic row (founder, 2026-11-04).

type Props = {
  closesAt: string
  isExemplar?: boolean
  /** The mark: the cause favpoll's own photo, or the protagonist's. */
  markPhoto: string | null
  name: string
  eyebrow?: string
  size?: FavpollCardSize
  linkCue?: boolean
}

export function FavpollCardBand({
  closesAt,
  isExemplar = false,
  markPhoto,
  name,
  eyebrow,
  size = "md",
  linkCue = false,
}: Props) {
  return (
    <>
      <div className="relative">
        <div className="flex h-10 items-center gap-2 rounded-t-xl bg-muted px-3 pr-20">
          <ClosingLabel closesAt={closesAt} className="whitespace-nowrap" />
          {isExemplar && (
            /* An edge, because secondary's fill is the band's own tint and
               the chip vanished into it (mock 11). */
            <Badge
              variant="secondary"
              className="pointer-events-none border border-border bg-background"
            >
              Example
            </Badge>
          )}
        </div>
        {markPhoto && (
          <div className="absolute right-3 -bottom-8 z-10 size-16 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={markPhoto}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="p-3 [&_span[title]]:text-[18px]">
        <FavpollHeader
          linkCue={linkCue}
          hideEmptyAvatar
          nameBelowMark
          protagonist={{ name, photo_url: null }}
          eyebrow={eyebrow}
          size={size}
        />
      </div>
    </>
  )
}
