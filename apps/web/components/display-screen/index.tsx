"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandedQR } from "@/components/branded-qr"
import { getFavpollHeadline, roomTypeScale } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { CharityRow } from "@/components/charity-row"
import { Countdown } from "@/components/countdown"
import {
  WallOfFavourites,
  type WallEntry,
} from "@/components/wall-of-favourites"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { DisplayChrome } from "./display-chrome"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"
import type { Charity } from "@favpoll/types"
import { formatPounds } from "@/lib/i18n"

// The projector surface, styled like the favpoll (event) page: content left
// (hero + rankings), meta right (QR — the room's call to action — countdown,
// charities, live wall of favourites). Everything the room watches stays current via
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
  /**
   * What the two QR codes encode — the SHORT form (/p/<code>). Separate from
   * favpollUrl because that one is also a NAVIGATION target (DisplayChrome
   * router.push), and pushing a redirecting route would bounce the projector
   * through an extra hop. QR-only: see app/p/[code]/page.tsx.
   */
  qrUrl: string
  /** Server-rendered wall entries; refreshed by the interval refresh */
  initialWallEntries?: WallEntry[]
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
  /**
   * False renders the display as a STILL — same markup, none of the
   * behaviour that only makes sense on a screen someone is presenting from:
   * no interval refetch, no localStorage variant, no close countdown, no
   * presenter chrome, and no min-h-screen (a still is as tall as its
   * content).
   *
   * Added 2026-08-06 for the landing page's "In the room" beat, which had
   * been a hand-built reduction of this component. A homepage that refreshed
   * the route every five seconds would be a bug, but so is maintaining a
   * second definition of a surface — the four defects of that day were all
   * two things claiming to be the same and quietly differing. This way the
   * marketing still IS the display.
   */
  live?: boolean
}

// The event heroes and the display agree on the figure size right up to
// the point a projector is involved, so the display keeps the small-screen
// half of the shared heroNameSizeClass and swaps only the upper step.
const figureSizeClass =
  "text-3xl @min-[40rem]:text-[length:var(--display-figure,2.25rem)]"

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
  qrUrl,
  initialWallEntries = [],
  charities = [],
  closesAt = null,
  avatar = null,
  isClosed = false,
  defaultVariant = "fundraiser",
  favpollId,
  live = true,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
  const [variant, setVariant] = useState<DisplayVariant>(defaultVariant)
  const variantKey = favpollId ? `favpoll:display-variant:${favpollId}` : null

  // Adopt a previously chosen variant after mount (not in the initial
  // state: the server render knows nothing of localStorage, and a
  // mismatch would break hydration).
  useEffect(() => {
    if (!live || !variantKey) return
    const stored = window.localStorage.getItem(variantKey)
    if (stored === "fundraiser" || stored === "tribute") setVariant(stored)
  }, [live, variantKey])

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
    if (!live) return
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [live, router])

  // Adopt the refreshed total (state, so a future push channel could also
  // set it)
  useEffect(() => {
    setTotalRaised(initialTotalRaised)
  }, [initialTotalRaised])

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

  // The room's way in. It sits at the TOP OF THE RIGHT COLUMN, above the
  // wall of favourites (founder, 2026-08-07).
  //
  // It used to live in the banner, which made a two-column design carry
  // three things and left the goal figure crowded. The obvious alternative
  // — under the wall of favourites, where there is space — is the one place it must
  // not go: that wall grows to twelve entries, so the code would sit lowest
  // exactly when the room is busiest and scanning matters most. Its height
  // here does not depend on how many people have pledged.
  //
  // Hidden from 1600px ONLY WHEN LIVE, because that is the only case where the
  // gutter pair takes over (founder, 2026-08-21: "why is the QR code not
  // visible?"). The pair is rendered behind `live &&`, so on a still — the
  // /features artefact and the homepage walkthrough, both live={false} — this
  // was hiding the inline code above 1600 and nothing was replacing it. A
  // display with no QR on any monitor wider than 1600, which is most of them.
  //
  // Measured before and after: at 1280 and 1512 the code rendered at 86px; at
  // 1700 and 1920 the node existed and measured 0x0.
  const scanToPledge = (
    <div
      className={`flex flex-col items-center gap-1.5 ${
        live ? "min-[1600px]:hidden" : ""
      }`}
    >
      <BrandedQR
        value={qrUrl}
        size={160}
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
    // @container, and every breakpoint below is a CONTAINER query (2026-08-18).
    // This layout describes its own box, not the window: the landing page
    // renders it at a fixed 900px inside whatever viewport the visitor has, and
    // with viewport md: rules a phone collapsed it to the stacked one-column
    // form INSIDE that 900px box — 900 x 1176 portrait against 900 x 657
    // landscape on a desktop. The homepage's "watch it live" beat is meant to
    // show a screen in a room, and it was showing a tall slab.
    //
    // @3xl is 48rem, which is exactly what md was, so on the live route — where
    // this fills the page and its box tracks the viewport — the breakpoint
    // lands where it always did.
    <div
      className={`@container overflow-x-clip bg-primary/5 ${live ? "min-h-screen" : ""}`}
      // The ramp is opt-in and live-only: it is vw-relative, and the
      // landing page renders a still at a fixed width inside the
      // visitor's viewport, where vw-scaled type would burst the layout.
      style={live ? (roomTypeScale as React.CSSProperties) : undefined}
    >
      {/* Outside the card: its drop-shadow filter would otherwise become the
          containing block for the chrome's fixed corner positioning */}
      {/* Presenter controls only exist for a presenter — a still has nobody
          to drive them, and the bar is `fixed`, which inside the landing
          page's scaled frame would anchor to that frame rather than a room. */}
      {live && (
        <DisplayChrome
          eventUrl={favpollUrl}
          variant={variant}
          onVariantChange={handleVariantChange}
        />
      )}
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
          containing block (DisplayChrome precedent).

          Live only. A still has no gutters to pin them in, and `fixed`
          resolves against the nearest TRANSFORMED ancestor — so inside the
          landing page's scaled frame these two 200px codes landed in the
          middle of the rankings. Same trap as DisplayChrome above. */}
      {live &&
        (["left", "right"] as const).map((side) => (
          <div
            key={side}
            className={`pointer-events-none fixed top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 min-[1600px]:flex ${
              side === "left"
                ? "left-[calc((100vw-72rem)/4-100px)]"
                : "right-[calc((100vw-72rem)/4-100px)]"
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
      {/* pt-16 on mobile: the chrome's fixed h-14 brand bar sits over the
          full-width card, so the banner needs clearance beneath it. From md
          up the tinted gutters hold the chrome and py-8 suffices. */}
      <div
        className={`mx-auto w-full max-w-6xl bg-background px-8 pb-8 @3xl:px-12 @3xl:pt-8 @3xl:drop-shadow-lg ${
          live ? "min-h-screen pt-16" : "pt-8"
        }`}
      >
        {/* ── Banner: ONE row, two columns (founder, 2026-08-02). The
            variants swap which column is the heading — fundraiser leads
            with the goal figure, tribute leads with the person and keeps
            the money to the quiet charity rows. ── */}
        <div className="mb-8 border-b border-border pb-6">
          {variant === "tribute" ? (
            /* @3xl:min-h-33 on BOTH variant rows = the avatar's height, the
               banner's tallest natural content — so switching views (or a
               missing photo) never shifts the rankings below. */
            <div className="flex flex-col gap-6 @3xl:min-h-33 @3xl:flex-row @3xl:items-stretch">
              {/* Col 1 — the favpoll page hero's EXACT grammar (founder,
                  2026-08-02): SectionEyebrow, hero-sized name,
                  text-xl/2xl primary subtitle, 26/33 photo-gated avatar
                  at the right. The QR sits at the column's right edge;
                  mobile stacks it centred beneath the heading. */}
              {/* @3xl:items-start (both variants' col 1): within the shared
                  min-h envelope the columns top-align, so the eyebrow sits
                  on the same line in every view — centring drifted by half
                  the height slack (founder, 2026-08-03). */}
              <div className="flex min-w-0 flex-1 flex-col gap-6 @3xl:flex-row @3xl:items-start @3xl:gap-8">
                <div className="flex min-w-0 flex-1 items-start gap-4 @3xl:gap-6">
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
                      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${figureSizeClass}`}
                    >
                      {protagonistName}
                    </h1>
                    {headline.suffix && (
                      <p className="mt-2 truncate text-xl font-normal whitespace-normal text-primary @3xl:text-2xl">
                        {headline.suffix}
                      </p>
                    )}
                  </div>
                  {avatar?.photoUrl && (
                    <div className="h-26 w-26 shrink-0 @3xl:h-33 @3xl:w-33">
                      <ProtagonistAvatar
                        name={avatar.name}
                        photoUrl={avatar.photoUrl}
                        className="h-full w-full @3xl:h-full @3xl:w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2 — the charities; the row amounts are the only money
                  on the banner. No goal figure, no progress bar, no
                  goal-reached shout: at a wake the number climbing is not
                  the point. */}
              <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-border pt-4 @3xl:w-90 @3xl:self-stretch @3xl:border-t-0 @3xl:border-l @3xl:pt-0 @3xl:pl-6">
                {/* Countdown above the charities (founder, 2026-08-03) —
                    the favpoll page's exact ramp (default md), not the
                    subtitle: this column is the banner's quiet side. */}
                {/* min-h-14 here and on the fundraiser identity: the two
                    upper blocks pin to one height so the charity card
                    below sits identically in both views. */}
                {isOpen && closesAt && (
                  <div className="@3xl:min-h-14">
                    <Countdown closesAt={closesAt} />
                  </div>
                )}
                {charities.length > 0 ? (
                  /* Hairline between the countdown and the charities
                     (founder) — the fundraiser column's same idiom. */
                  <div
                    className={
                      isOpen && closesAt
                        ? "space-y-3 border-t border-border pt-3"
                        : "space-y-3"
                    }
                  >
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
                {effectiveClosed && (
                  <p className="text-xs text-muted-foreground">
                    Poll closed — thank you.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 @3xl:min-h-33 @3xl:flex-row @3xl:items-stretch">
              {/* Col 1 — goal progress (or closed total / countdown), QR beside */}
              <div className="flex min-w-0 flex-1 items-center gap-8 @3xl:items-start">
                <div className="min-w-0 flex-1">
                  {effectiveClosed ? (
                    <div>
                      <SectionEyebrow
                        variant="muted"
                        className="flex h-8 items-center"
                      >
                        Poll closed
                      </SectionEyebrow>
                      <p
                        className={`leading-tight font-medium tracking-tight text-foreground ${figureSizeClass}`}
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
                      <div className="flex h-8 flex-wrap items-center justify-between gap-2">
                        <SectionEyebrow variant="muted">
                          Pledge goal
                        </SectionEyebrow>
                        {goalReached && (
                          <p className="text-sm font-medium text-success">
                            Goal reached — every further pledge still counts
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <p
                          className={`leading-tight font-medium tracking-tight text-foreground ${figureSizeClass}`}
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
                  ) : (
                    /* No goal: the hero's exact three-line silhouette
                       (founder, 2026-08-03) — eyebrow, headline figure,
                       and the countdown as the subtitle line, where the
                       tribute hero carries its dates.

                       The countdown is the only optional part. This used to
                       be `isOpen ? ... : null`, so a favpoll with NO goal and
                       NO close date — both optional — projected an entirely
                       empty column with the QR alone beside it, and the money
                       survived only as a charity row. The fundraiser variant
                       exists to make the total the heading; it should say so
                       whether or not a clock is running. Found 2026-08-06 by
                       rendering the real display on the landing page, where
                       neither field is set. */
                    <div>
                      <SectionEyebrow
                        variant="muted"
                        className="flex h-8 items-center"
                      >
                        Raised so far
                      </SectionEyebrow>
                      <p
                        className={`leading-tight font-medium tracking-tight text-foreground ${figureSizeClass}`}
                        aria-live="polite"
                      >
                        {formatPounds(totalRaised)}
                      </p>
                      {isOpen && closesAt && (
                        <div className="mt-2">
                          <Countdown closesAt={closesAt} variant="subtitle" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Col 2 — compact identity above the charity rows */}
              <div className="flex w-full shrink-0 flex-col justify-center gap-3 border-t border-border pt-4 @3xl:w-90 @3xl:self-stretch @3xl:border-t-0 @3xl:border-l @3xl:pt-0 @3xl:pl-6">
                {/* Photo at the right, no context line (founder,
                    2026-08-02) — the identity is a byline here, not the
                    story. */}
                <div className="flex min-w-0 items-center gap-2.5 @3xl:min-h-14">
                  <div className="min-w-0 flex-1">
                    {headline.prefix && (
                      /* mb-2 = the countdown label's rhythm, so this block
                         and the tribute column's countdown match heights
                         and the charity card below holds its position
                         across variant switches (founder, 2026-08-03). */
                      <p className="mb-2 truncate text-[10px] font-medium tracking-widest text-primary uppercase">
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
                      className="h-12 w-12 shrink-0 rounded-lg @3xl:h-12 @3xl:w-12"
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

        {/* ── Left: rankings · Right: the wall of favourites ── */}
        <div className="grid items-start gap-10 @5xl:grid-cols-[1fr_22.5rem]">
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

          <div className="flex flex-col gap-8">
            {scanToPledge}
            <WallOfFavourites
              entries={initialWallEntries}
              animate
              maxEntries={12}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
