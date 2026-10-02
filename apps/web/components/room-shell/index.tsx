"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandedQR } from "@/components/branded-qr"
import { DisplayChrome } from "@/components/display-screen/display-chrome"
import type { DisplayVariant } from "@/components/display-screen"
import { FavpollSheet } from "@/components/favpoll-sheet"
import type { WallEntry } from "@/components/guest-book"
import type { FavpollWithDetails, FavpollPollWithItems } from "@favpoll/types"

// THE ROOM LAYER (2026-09-30): the live display is the favpoll page's
// sheet on the screen in the room, wrapped in what only a presented
// screen has — the presenter's chrome (brand mark, the dial, manage,
// theme, full screen), the two gutter QR codes, the refresh loop, and
// the finale. Everything the room WATCHES is the sheet, so a redesign of
// the page is a redesign of the display; DisplayScreen, a second tree
// of the same layout, fell behind every time (founder, 2026-09-30).

type Props = {
  favpoll: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  totalRaised: number
  wallEntries: WallEntry[]
  organiser?: { name: string; avatarUrl: string | null } | null
  isClosed: boolean
  /** Where the chrome's menu leads — the manage hub, the room the
   *  presenter came from (founder, 2026-09-03). */
  manageUrl: string
  /** What the QR codes encode — the SHORT form (/p/<code>), so a scan
   *  lands on the guest page without an extra hop. */
  qrUrl: string
  /** The presence dial's starting position: derived from the register
   *  upstream (remembering → tribute), overridable from the chrome and
   *  remembered per favpoll on this machine. */
  defaultVariant?: DisplayVariant
}

export function RoomShell({
  favpoll,
  pollWithItems,
  totalRaised,
  wallEntries,
  organiser,
  isClosed,
  manageUrl,
  qrUrl,
  defaultVariant = "fundraiser",
}: Props) {
  const [variant, setVariant] = useState<DisplayVariant>(defaultVariant)
  const variantKey = `favpoll:display-variant:${favpoll.id}`

  // Adopt a previously chosen variant after mount (not in the initial
  // state: the server render knows nothing of localStorage, and a
  // mismatch would break hydration).
  useEffect(() => {
    const stored = window.localStorage.getItem(variantKey)
    if (stored === "fundraiser" || stored === "tribute") setVariant(stored)
  }, [variantKey])

  function handleVariantChange(next: DisplayVariant) {
    setVariant(next)
    window.localStorage.setItem(variantKey, next)
  }

  // Realtime postgres_changes never reach the browser here: pledges/
  // favourites have RLS enabled with no anon policies, so events are
  // silently filtered (and an anon refetch would read nothing). Instead
  // the page re-pulls its own SERVER data — service role, fully gated —
  // on a short interval: the standings re-rank, the guest book adopts
  // fresh entries, the totals sync.
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [router])

  // The close, witnessed live: when closes_at passes while the room is
  // watching, the countdown gives way and the reveal types out — the
  // finale. Anchored at mount: the interval refresh re-delivers isClosed
  // from the server ~5s after the close, and "did the room witness it"
  // must not flip mid-finale — the typed reveal would be cut off.
  const [localClosed, setLocalClosed] = useState(false)
  const [wasOpenAtMount] = useState(!isClosed)
  const closesAt = favpoll.closed_at ? null : (favpoll.closes_at ?? null)
  useEffect(() => {
    if (isClosed || !closesAt) return
    const delta = new Date(closesAt).getTime() - Date.now()
    if (delta <= 0) {
      setLocalClosed(true)
      return
    }
    if (delta > 2 ** 31 - 1) return // beyond setTimeout range; irrelevant live
    const id = setTimeout(() => setLocalClosed(true), delta)
    return () => clearTimeout(id)
  }, [closesAt, isClosed])
  const effectiveClosed = isClosed || localClosed

  return (
    <>
      {/* The presenter's chrome: the app header is suppressed on this
          route (header-mount), and this bar takes its geometry — fixed,
          h-14 — so the sheet below sits exactly where it does under the
          app header. The spacer is the header's own height. */}
      <DisplayChrome
        eventUrl={manageUrl}
        variant={variant}
        onVariantChange={handleVariantChange}
      />
      <div className="h-14" aria-hidden="true" />

      {/* The QR as chrome (founder, 2026-08-02): a standing instruction to
          the room — the telethon corner phone number — pinned in BOTH
          gutters so it survives scrolling and asymmetric occlusion (a
          speaker, a pillar — one blocked sight line still leaves the
          other; founder, 2026-08-03), and larger than a banner ever
          allowed (scans from across a room). CENTRE height, not a
          corner: the bottom band of a projected image is the part most
          often occluded in a room. The inset = half the gutter's spare
          space, so each QR centres in its gutter at any width (gutter =
          (100vw − 64rem)/2, the sheet's max-w-5xl; spare = gutter −
          200px). Only from 1440px, where the gutter (208px) fits the
          200px code. Gone once the poll has closed: nothing to scan for. */}
      {!effectiveClosed &&
        (["left", "right"] as const).map((side) => (
          <div
            key={side}
            className={`pointer-events-none fixed top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 min-[1440px]:flex ${
              side === "left"
                ? "left-[calc((100vw-64rem)/4-100px)]"
                : "right-[calc((100vw-64rem)/4-100px)]"
            }`}
          >
            <BrandedQR
              value={qrUrl}
              size={200}
              colorVar="--qr"
              aria-label="Scan to pledge on your phone"
            />
            <p className="text-sm font-medium text-qr">Scan to pledge</p>
          </div>
        ))}

      <FavpollSheet
        favpoll={favpoll}
        pollWithItems={pollWithItems}
        totalRaised={totalRaised}
        isClosed={effectiveClosed}
        isOrganiser={false}
        wallEntries={wallEntries}
        rankHistory={null}
        organiser={organiser}
        presentation="room"
        heroVariant={variant}
        reveal={localClosed && wasOpenAtMount}
      />
    </>
  )
}
