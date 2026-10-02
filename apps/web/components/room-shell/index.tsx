"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandedQR } from "@/components/branded-qr"
import { FavpollLogo } from "@/components/favpoll-logo"
import { DisplayChrome } from "./display-chrome"
import { FavpollSheet } from "@/components/favpoll-sheet"
import type { WallEntry } from "@/components/guest-book"
import { DISPLAY_ROOM } from "@/lib/display"
import type { FavpollWithDetails, FavpollPollWithItems } from "@favpoll/types"

// THE ROOM LAYER (2026-09-30): the live display is the favpoll page's
// sheet on the screen in the room, wrapped in what only a presented
// screen has — the presenter's chrome (brand mark, the dial, manage,
// theme, full screen), the two gutter QR codes, the refresh loop, and
// the finale. Everything the room WATCHES is the sheet, so a redesign of
// the page is a redesign of the display; DisplayScreen, a second tree
// of the same layout, fell behind every time (founder, 2026-09-30).

// The presence dial (founder, 2026-08-02): how loud the room's screen is.
// "fundraiser" is telethon theatre — the money is the heading; "tribute"
// turns the volume down — the person is the heading and the money stays
// quiet. The default derives from the favpoll's register (memorial →
// tribute), and the presenter can override it live from the chrome
// menu; the override sticks per favpoll on this machine.
export type DisplayVariant = "fundraiser" | "tribute"

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
  /**
   * THE DISPLAY AS A ROOM SEES IT, on a still (founder, 2026-08-27: "Why
   * don't we make it an exact match of the real thing including the
   * logo?"). A still is a DISPLAY_ROOM-sized box the caller scales down:
   * it keeps the room's own furniture — the brand mark in the corner and
   * the two gutter codes — anchored to that box rather than the viewport
   * (`fixed` resolves against the nearest transformed ancestor, so inside
   * the landing page's scaled frame the codes landed in the middle of the
   * rankings). It drops what only a presenter drives: the menu (a
   * dropdown that opens nothing is worse than an absent one), the refresh
   * loop, the finale timer, the remembered dial.
   */
  still?: boolean
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
  still = false,
}: Props) {
  const live = !still
  const [variant, setVariant] = useState<DisplayVariant>(defaultVariant)
  const variantKey = `favpoll:display-variant:${favpoll.id}`

  // Adopt a previously chosen variant after mount (not in the initial
  // state: the server render knows nothing of localStorage, and a
  // mismatch would break hydration).
  useEffect(() => {
    if (!live) return
    const stored = window.localStorage.getItem(variantKey)
    if (stored === "fundraiser" || stored === "tribute") setVariant(stored)
  }, [live, variantKey])

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
    if (!live) return
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [live, router])

  // The close, witnessed live: when closes_at passes while the room is
  // watching, the countdown gives way and the reveal types out — the
  // finale. Anchored at mount: the interval refresh re-delivers isClosed
  // from the server ~5s after the close, and "did the room witness it"
  // must not flip mid-finale — the typed reveal would be cut off.
  const [localClosed, setLocalClosed] = useState(false)
  const [wasOpenAtMount] = useState(!isClosed)
  const closesAt = favpoll.closed_at ? null : (favpoll.closes_at ?? null)
  useEffect(() => {
    if (!live || isClosed || !closesAt) return
    const delta = new Date(closesAt).getTime() - Date.now()
    if (delta <= 0) {
      setLocalClosed(true)
      return
    }
    if (delta > 2 ** 31 - 1) return // beyond setTimeout range; irrelevant live
    const id = setTimeout(() => setLocalClosed(true), delta)
    return () => clearTimeout(id)
  }, [live, closesAt, isClosed])
  const effectiveClosed = isClosed || localClosed

  return (
    <>
      {/* The presenter's chrome: the app header is suppressed on this
          route (header-mount) and NOTHING takes its place — no band, no
          spacer (founder, 2026-09-30: "remove the header, like the
          original live page"). The chrome floats over the tinted
          gutters at the viewport's corners, fixed, pointer-events-none
          but for its two controls, so the sheet pays no height and runs
          from the top of the screen. A still keeps only the brand mark,
          at the chrome's own geometry (the h-14 row, items-center,
          px-6), anchored to its box. */}
      {live ? (
        <DisplayChrome
          eventUrl={manageUrl}
          variant={variant}
          onVariantChange={handleVariantChange}
        />
      ) : (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex h-14 items-center px-6">
          <FavpollLogo />
        </div>
      )}
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
          200px). Live: only from 1440px, where the gutter (208px) fits
          the 200px code. A still: anchored to its box (100%, not 100vw —
          the still's width IS the screen it depicts) and always shown,
          the caller guaranteeing the gutters exist. Gone once the poll
          has closed: nothing to scan for. */}
      {!effectiveClosed &&
        (["left", "right"] as const).map((side) => (
          <div
            key={side}
            className={`pointer-events-none top-1/2 z-20 -translate-y-1/2 flex-col items-center gap-2 ${
              live ? "fixed hidden min-[1440px]:flex" : "absolute flex"
            } ${
              side === "left"
                ? live
                  ? "left-[calc((100vw-64rem)/4-100px)]"
                  : "left-[calc((100%-64rem)/4-100px)]"
                : live
                  ? "right-[calc((100vw-64rem)/4-100px)]"
                  : "right-[calc((100%-64rem)/4-100px)]"
            }`}
          >
            <BrandedQR
              value={qrUrl}
              size={200}
              colorVar="--qr"
              aria-label="Scan to pledge on your phone"
            />
            {/* text-qr: the generated utility is the CSS reference that
                stops the build stripping the --qr token BrandedQR reads
                at runtime. */}
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
        // The whole screen: no header above the sheet on this surface.
        shellHeight={still ? `${DISPLAY_ROOM.h}px` : "100vh"}
      />
    </>
  )
}
