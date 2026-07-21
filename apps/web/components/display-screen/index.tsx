"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandedQR } from "@/components/branded-qr"
import { getFavpollHeadline } from "@/lib/display"
import { CharityRow } from "@/components/charity-row"
import { Countdown } from "@/components/countdown"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { RevealLockPill, revealLockLabel } from "@/components/reveal-lock"
import { DisplayChrome } from "./display-chrome"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"
import type { Charity } from "@favpoll/types"
import { formatPounds } from "@/lib/i18n"

// The projector surface, styled like the favpoll (event) page: content left
// (hero + rankings), meta right (QR — the room's call to action — countdown,
// charities, live guest wall). Everything the room watches stays current via
// an interval router.refresh() — see the note inside.

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
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
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

  return (
    // The event page's frame (tinted surround, floating card) at broadcast
    // width — max-w-6xl rather than the page's 5xl, since a projector earns
    // a wider canvas.
    <div className="min-h-screen overflow-x-clip bg-primary/5">
      {/* Outside the card: its drop-shadow filter would otherwise become the
          containing block for the chrome's fixed corner positioning */}
      <DisplayChrome eventUrl={favpollUrl} />
      <div className="mx-auto min-h-screen w-full max-w-6xl bg-background px-8 py-8 md:px-12 md:drop-shadow-lg">
        {/* ── Telethon banner, two rows: the identity line (a lower-third
            title), then the action row — QR · goal-or-countdown · charities.
            A section of the framed card (hairline-delimited, the event
            page's convention) rather than a nested card. ── */}
        <div className="mb-8 border-b border-border pb-6">
          {/* Who it's for — the opening line + name, in place of a hero.
              The reveal's lock hint sits beside the name while the poll is
              open: intrigue without the blurred-decoy noise. */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-3">
              {avatar && (
                <div className="origin-left scale-75">
                  <ProtagonistAvatar
                    name={avatar.name}
                    photoUrl={avatar.photoUrl}
                  />
                </div>
              )}
              <div className="min-w-0">
                {headline.prefix && (
                  <p className="truncate text-xs font-medium tracking-widest text-primary uppercase">
                    {headline.prefix}
                  </p>
                )}
                <h1 className="truncate text-3xl font-medium tracking-tight text-foreground">
                  {protagonistName}
                </h1>
                {headline.suffix && (
                  <p className="truncate text-sm text-primary">
                    {headline.suffix}
                  </p>
                )}
              </div>
            </div>
            {!effectiveClosed && poll?.personal_reveal && (
              <RevealLockPill
                size="sm"
                label={revealLockLabel(
                  avatar
                    ? protagonistName.split(/[\s&]+/)[0]
                    : protagonistName || null
                )}
              />
            )}
          </div>

          {/* Action row */}
          <div className="flex flex-col gap-6 pt-4 md:flex-row md:items-stretch">
            {/* Centre: goal progress, or the countdown when no goal is set */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
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
                <Countdown closesAt={closesAt!} />
              ) : null}
            </div>

            {/* The way in */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
              <BrandedQR
                value={favpollUrl}
                size={132}
                aria-label="Scan to pledge on your phone"
              />
              <p className="text-sm font-medium text-foreground">
                Scan to pledge
              </p>
            </div>

            {/* Charities — the event page's rows, with the live total */}
            {(charities.length > 0 || charityName) && (
              <div className="flex w-full shrink-0 flex-col justify-center space-y-3 border-t border-border pt-4 md:w-90 md:self-stretch md:border-t-0 md:border-l md:pt-0 md:pl-6">
                {charities.length > 0 ? (
                  <>
                    {charities.slice(0, 3).map((charity) => (
                      <CharityRow
                        key={charity.id}
                        charity={charity}
                        amountRaised={perCharity}
                      />
                    ))}
                    {!goalAmount && (
                      <p className="text-right text-xs text-muted-foreground">
                        <span
                          className="text-base font-medium text-primary"
                          aria-live="polite"
                        >
                          {formatPounds(totalRaised)}
                        </span>{" "}
                        raised so far
                      </p>
                    )}
                  </>
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

        {/* ── Left: rankings · Right: the guest wall ── */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_22.5rem]">
          <div>
            {poll && (
              <DisplayPollSection
                poll={poll}
                isClosed={effectiveClosed}
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
