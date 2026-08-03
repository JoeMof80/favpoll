"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandedQR } from "@/components/branded-qr"
import { getFavpollHeadline, heroNameSizeClass } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { CharityRow } from "@/components/charity-row"
import { Countdown } from "@/components/countdown"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { DisplayChrome } from "./display-chrome"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"
import type { Charity } from "@favpoll/types"
import { formatPounds } from "@/lib/i18n"

// The projector surface, styled like the favpoll (event) page: content left
// (hero + rankings), meta right (QR — the room's call to action — countdown,
// charities, live guest wall). Everything the room watches stays current via
// an interval router.refresh() — see the note inside.

// The presence dial (founder, 2026-08-02): how loud the room's screen is.
// "fundraiser" is telethon theatre — the goal figure is the heading;
// "tribute" turns the volume down — the person is the heading and the
// money stays quiet. The default derives from the favpoll's register
// (memorial → tribute), and the presenter can override it live from the
// chrome menu; the override sticks per favpoll on this machine.
export type DisplayVariant = "fundraiser" | "tribute"

type Props = {
  protagonistName: string
  dateLabel: string | null
  openingLine: string | null
  occasionType: string | null
  /** Fallback label when full charity rows aren't provided (stories) */
  charityName: string | null
  goalAmount?: number | null
  poll: DisplayPoll | null
  initialTotalRaised: number
  favpollUrl: string
  /** Server-rendered wall entries; refreshed by the interval refresh */
  initialWallEntries?: GuestWallEntry[]
  /** Full charity rows — renders the event page's CharityBanner */
  charities?: Charity[]
  /** Open favpolls: renders the event page's countdown card */
  closesAt?: string | null
  /** Person favpolls: the event page's avatar beside the hero */
  avatar?: { name: string; photoUrl: string | null } | null
  /** Closed favpolls disclose the reveal; open ones withhold it */
  isClosed?: boolean
  /** Register-derived starting variant; the presenter can override live */
  defaultVariant?: DisplayVariant
  /** Keys the presenter's variant override in localStorage */
  favpollId?: string
}

export function DisplayScreen({
  protagonistName,
  dateLabel,
  openingLine,
  occasionType,
  charityName,
  goalAmount = null,
  poll,
  initialTotalRaised,
  favpollUrl,
  initialWallEntries = [],
  charities = [],
  closesAt = null,
  avatar = null,
  isClosed = false,
  defaultVariant = "fundraiser",
  favpollId,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
  const [variant, setVariant] = useState<DisplayVariant>(defaultVariant)
  const variantKey = favpollId ? `favpoll:display-variant:${favpollId}` : null

  // Adopt a previously chosen variant after mount (not in the initial
  // state: the server render knows nothing of localStorage, and a
  // mismatch would break hydration).
  useEffect(() => {
    if (!variantKey) return
    const stored = window.localStorage.getItem(variantKey)
    if (stored === "fundraiser" || stored === "tribute") setVariant(stored)
  }, [variantKey])

  function handleVariantChange(next: DisplayVariant) {
    setVariant(next)
    if (variantKey) window.localStorage.setItem(variantKey, next)
  }
  // The close, witnessed live: when closes_at passes while the room is
  // watching, the countdown gives way and the reveal types out — the finale.
  const [localClosed, setLocalClosed] = useState(false)
  // Anchored at mount: the interval refresh below re-delivers isClosed from
  // the server ~5s after the close, and "did the room witness it" must not
  // flip mid-finale — the typed reveal would be cut off.
  const [wasOpenAtMount] = useState(!isClosed)
  // Realtime postgres_changes never reach the browser here: pledges/
  // favourites have RLS enabled with no anon policies, so events are
  // silently filtered (and an anon refetch would read nothing). Instead the
  // page re-pulls its own SERVER data — service role, fully gated — on a
  // short interval: rankings re-rank via RankingList's initialItems effect,
  // the wall adopts fresh entries, and the total syncs below.
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [router])

  // Adopt the refreshed total (state, so a future push channel could also
  // set it)
  useEffect(() => {
    setTotalRaised(initialTotalRaised)
  }, [initialTotalRaised])

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

  const headline = getFavpollHeadline({
    occasionType,
    openingLine,
    name: protagonistName,
    dateLabel,
  })

  const effectiveClosed = isClosed || localClosed
  const isOpen = !effectiveClosed && !!closesAt
  const goalReached = !!goalAmount && totalRaised >= goalAmount

  const perCharity = charities.length > 0 ? totalRaised / charities.length : 0

  // The room's way in, in-banner form — hidden from 2xl, where the QR
  // moves to the gutter (below).
  const scanToPledge = (
    <div className="flex shrink-0 flex-col items-center gap-1.5 min-[1600px]:hidden">
      <BrandedQR
        value={favpollUrl}
        size={132}
        colorVar="--qr"
        aria-label="Scan to pledge on your phone"
      />
      {/* text-qr does double duty: the label matches the code's ink, and
          the generated utility is the CSS reference that stops the build
          stripping the --qr token BrandedQR reads at runtime. */}
      <p className="text-sm font-medium text-qr">Scan to pledge</p>
    </div>
  )

  return (
    // The event page's frame (tinted surround, floating card) at broadcast
    // width — max-w-6xl rather than the page's 5xl, since a projector earns
    // a wider canvas.
    <div className="min-h-screen overflow-x-clip bg-primary/5">
      {/* Outside the card: its drop-shadow filter would otherwise become the
          containing block for the chrome's fixed corner positioning */}
      <DisplayChrome
        eventUrl={favpollUrl}
        variant={variant}
        onVariantChange={handleVariantChange}
      />
      {/* The QR as chrome (founder, 2026-08-02): a standing instruction to
          the room — the telethon corner phone number — pinned in BOTH
          gutters so it survives scrolling and asymmetric occlusion (a
          speaker, a pillar — one blocked sight line still leaves the
          other; founder, 2026-08-03), and larger than the banner ever
          allowed (scans from across a room). CENTRE height, not a
          corner: the bottom band of a projected image is the part most
          often occluded in a room. The inset = half the gutter's spare
          space, so each QR centres in its gutter at any width (gutter =
          (100vw − 72rem)/2; spare = gutter − 200px). Only from 1600px,
          where the gutter (224px) fits the 200px QR; narrower viewports
          keep the in-banner QR. Fixed, so rendered OUTSIDE the card —
          its drop-shadow filter would otherwise become these boxes'
          containing block (DisplayChrome precedent). */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`pointer-events-none fixed top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 min-[1600px]:flex ${
            side === "left"
              ? "left-[calc((100vw-72rem)/4-100px)]"
              : "right-[calc((100vw-72rem)/4-100px)]"
          }`}
        >
          <BrandedQR
            value={favpollUrl}
            size={200}
            colorVar="--qr"
            aria-label="Scan to pledge on your phone"
          />
          <p className="text-sm font-medium text-qr">Scan to pledge</p>
        </div>
      ))}
      {/* pt-16 on mobile: the chrome's fixed h-14 brand bar sits over the
          full-width card, so the banner needs clearance beneath it. From md
          up the tinted gutters hold the chrome and py-8 suffices. */}
      <div className="mx-auto min-h-screen w-full max-w-6xl bg-background px-8 pt-16 pb-8 md:px-12 md:pt-8 md:drop-shadow-lg">
        {/* ── Banner: ONE row, two columns (founder, 2026-08-02). The
            variants swap which column is the heading — fundraiser leads
            with the goal figure, tribute leads with the person and keeps
            the money to the quiet charity rows. ── */}
        <div className="mb-8 border-b border-border pb-6">
          {variant === "tribute" ? (
            <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
              {/* Col 1 — the favpoll page hero's EXACT grammar (founder,
                  2026-08-02): SectionEyebrow, heroNameSizeClass name,
                  text-xl/2xl primary subtitle, 26/33 photo-gated avatar
                  at the right. The QR sits at the column's right edge;
                  mobile stacks it centred beneath the heading. */}
              <div className="flex min-w-0 flex-1 flex-col gap-6 md:flex-row md:items-center md:gap-8">
                <div className="flex min-w-0 flex-1 items-start gap-4 md:gap-6">
                  <div className="min-w-0 flex-1">
                    {headline.prefix && (
                      <SectionEyebrow
                        variant="muted"
                        className="flex h-8 items-center truncate wrap-break-word"
                      >
                        {headline.prefix}
                      </SectionEyebrow>
                    )}
                    <h1
                      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass}`}
                    >
                      {protagonistName}
                    </h1>
                    {headline.suffix && (
                      <p className="mt-2 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
                        {headline.suffix}
                      </p>
                    )}
                  </div>
                  {avatar?.photoUrl && (
                    <div className="h-26 w-26 shrink-0 md:h-33 md:w-33">
                      <ProtagonistAvatar
                        name={avatar.name}
                        photoUrl={avatar.photoUrl}
                        className="h-full w-full md:h-full md:w-full"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-center min-[1600px]:hidden">
                  {scanToPledge}
                </div>
              </div>

              {/* Col 2 — the charities; the row amounts are the only money
                  on the banner. No goal figure, no progress bar, no
                  goal-reached shout: at a wake the number climbing is not
                  the point. */}
              <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-border pt-4 md:w-90 md:self-stretch md:border-t-0 md:border-l md:pt-0 md:pl-6">
                {charities.length > 0 ? (
                  <div className="space-y-3">
                    {charities.slice(0, 3).map((charity) => (
                      <CharityRow
                        key={charity.id}
                        charity={charity}
                        amountRaised={perCharity}
                      />
                    ))}
                  </div>
                ) : charityName ? (
                  <p className="text-sm text-muted-foreground">
                    raised for {charityName}:{" "}
                    <span className="font-medium text-foreground">
                      {formatPounds(totalRaised)}
                    </span>
                  </p>
                ) : null}
                {effectiveClosed ? (
                  <p className="text-xs text-muted-foreground">
                    Poll closed — thank you.
                  </p>
                ) : (
                  isOpen &&
                  closesAt && (
                    <p className="text-xs text-muted-foreground">
                      Poll closes{" "}
                      {new Date(closesAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
              {/* Col 1 — goal progress (or closed total / countdown), QR beside */}
              <div className="flex min-w-0 flex-1 items-center gap-8">
                <div className="min-w-0 flex-1">
                  {effectiveClosed ? (
                    <div>
                      <p className="text-xs font-medium tracking-widest text-primary uppercase">
                        Poll closed
                      </p>
                      <p
                        className="mt-1 text-4xl font-medium text-foreground"
                        aria-live="polite"
                      >
                        {formatPounds(totalRaised)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Thank you — the final standings are in.
                      </p>
                    </div>
                  ) : goalAmount ? (
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs font-medium tracking-widest text-primary uppercase">
                          Pledge goal
                        </p>
                        {goalReached && (
                          <p className="text-sm font-medium text-success">
                            Goal reached — every further pledge still counts
                          </p>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                        <p
                          className="text-4xl font-medium text-foreground"
                          aria-live="polite"
                        >
                          {formatPounds(totalRaised)}
                        </p>
                        <p className="text-lg text-muted-foreground">
                          of {formatPounds(goalAmount)}
                        </p>
                      </div>
                      <div
                        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Progress towards the pledge goal"
                        aria-valuemin={0}
                        aria-valuemax={goalAmount}
                        aria-valuenow={Math.min(totalRaised, goalAmount)}
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                            goalReached ? "bg-success" : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(100, (totalRaised / goalAmount) * 100)}%`,
                          }}
                        />
                      </div>
                      {isOpen && closesAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Poll closes{" "}
                          {new Date(closesAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      )}
                    </div>
                  ) : isOpen ? (
                    /* No goal: the total still leads the hero, mirroring
                       the goal block's grammar (founder, 2026-08-03) —
                       same eyebrow ramp, same text-4xl figure — with the
                       countdown in the progress bar's slot. */
                    <div>
                      <p className="text-xs font-medium tracking-widest text-primary uppercase">
                        Raised so far
                      </p>
                      <p
                        className="mt-1 text-4xl font-medium text-foreground"
                        aria-live="polite"
                      >
                        {formatPounds(totalRaised)}
                      </p>
                      <div className="mt-3">
                        <Countdown closesAt={closesAt!} size="sm" />
                      </div>
                    </div>
                  ) : null}
                </div>

                {scanToPledge}
              </div>

              {/* Col 2 — compact identity above the charity rows */}
              <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-border pt-4 md:w-90 md:self-stretch md:border-t-0 md:border-l md:pt-0 md:pl-6">
                {/* Photo at the right, no context line (founder,
                    2026-08-02) — the identity is a byline here, not the
                    story. */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="min-w-0 flex-1">
                    {headline.prefix && (
                      <p className="truncate text-[10px] font-medium tracking-widest text-primary uppercase">
                        {headline.prefix}
                      </p>
                    )}
                    <h1 className="truncate text-lg leading-tight font-medium text-foreground">
                      {protagonistName}
                    </h1>
                  </div>
                  {avatar?.photoUrl && (
                    <ProtagonistAvatar
                      name={avatar.name}
                      photoUrl={avatar.photoUrl}
                      className="h-12 w-12 shrink-0 rounded-lg md:h-12 md:w-12"
                    />
                  )}
                </div>

                {(charities.length > 0 || charityName) && (
                  <div className="space-y-3 border-t border-border pt-3">
                    {/* No raised-so-far footer here any more — with or
                        without a goal, the hero column now carries the
                        total. */}
                    {charities.length > 0 ? (
                      charities
                        .slice(0, 3)
                        .map((charity) => (
                          <CharityRow
                            key={charity.id}
                            charity={charity}
                            amountRaised={perCharity}
                          />
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        raised for {charityName}:{" "}
                        <span className="font-medium text-foreground">
                          {formatPounds(totalRaised)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Left: rankings · Right: the guest wall ── */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_22.5rem]">
          <div>
            {poll && (
              <DisplayPollSection
                poll={poll}
                justClosed={localClosed && wasOpenAtMount}
                protagonistFirstName={
                  avatar
                    ? protagonistName.split(/[\s&]+/)[0]
                    : protagonistName || null
                }
              />
            )}
          </div>

          <GuestWall entries={initialWallEntries} animate maxEntries={12} />
        </div>
      </div>
    </div>
  )
}
