"use client"

import { useEffect, useState } from "react"
import { BrandedQR } from "@/components/branded-qr"
import { createClient } from "@/lib/supabase/client"
import { getFavpollHeadline } from "@/lib/display"
import { CharityBanner } from "@/components/charity-banner"
import { Countdown } from "@/components/countdown"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { BaseFavpollHero } from "@/components/heroes/base-favpoll-hero"
import { CauseHero } from "@/components/cause-hero"
import { useLiveWall } from "@/components/use-live-wall"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"
import type { Charity, Favpoll, Protagonist } from "@favpoll/types"

// The projector surface, styled like the favpoll (event) page: content left
// (hero + rankings), meta right (QR — the room's call to action — countdown,
// charities, live guest wall). Everything the room watches updates in
// realtime: rankings (useRankingItems), the raised total (pledges channel),
// and the wall (useLiveWall).

type Props = {
  favpollId: string
  protagonistName: string
  dateLabel: string | null
  openingLine: string | null
  description: string | null
  occasionType: string | null
  /** Fallback label when full charity rows aren't provided (stories) */
  charityName: string | null
  goalAmount?: number | null
  poll: DisplayPoll | null
  initialTotalRaised: number
  pollId: string | null
  favpollUrl: string
  /** Server-rendered wall entries; kept live via the wall endpoint */
  initialWallEntries?: GuestWallEntry[]
  /** The favpoll's live_slug — authorises the wall endpoint's display mode */
  liveKey?: string
  /** Full charity rows — renders the event page's CharityBanner */
  charities?: Charity[]
  /** Open favpolls: renders the event page's countdown card */
  closesAt?: string | null
  /** Person favpolls: the event page's avatar beside the hero */
  avatar?: { name: string; photoUrl: string | null } | null
  /** Closed favpolls disclose the reveal; open ones withhold it */
  isClosed?: boolean
  /** Full rows — renders the event page's own hero (BaseFavpollHero /
      CauseHero); the compact fallback below is for stories */
  heroFavpoll?: Favpoll | null
  heroProtagonist?: Protagonist | null
}

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
})

export function DisplayScreen({
  favpollId,
  protagonistName,
  dateLabel,
  openingLine,
  description,
  occasionType,
  charityName,
  goalAmount = null,
  poll,
  initialTotalRaised,
  pollId,
  favpollUrl,
  initialWallEntries = [],
  liveKey,
  charities = [],
  closesAt = null,
  avatar = null,
  isClosed = false,
  heroFavpoll = null,
  heroProtagonist = null,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
  // The close, witnessed live: when closes_at passes while the room is
  // watching, the countdown gives way and the reveal types out — the finale.
  const [localClosed, setLocalClosed] = useState(false)
  // The room's wall: names appear as pledges land. The live_slug capability
  // authorises backed-labels; anonymity still holds ("Someone").
  const wallEntries = useLiveWall(favpollId, initialWallEntries, {
    displayKey: liveKey,
  })
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`display-pledges-${favpollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pledges" },
        async () => {
          if (!pollId) return
          const { data } = await supabase
            .from("pledges")
            .select("total_amount")
            .eq("favpoll_poll_id", pollId)
            .is("withdrawn_at", null)
          const total = (data ?? []).reduce(
            (s: number, p: { total_amount: number }) => s + p.total_amount,
            0
          )
          setTotalRaised(total)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [favpollId, pollId, supabase])

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

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto w-full max-w-6xl px-8">
        {/* Pledge goal — full-width, telethon-style, on the realtime total */}
        {goalAmount ? (
          <div className="mb-8 rounded-lg border border-border bg-card px-6 py-5">
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
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
              <p
                className="text-4xl font-medium text-foreground"
                aria-live="polite"
              >
                {GBP.format(totalRaised)}
              </p>
              <p className="text-lg text-muted-foreground">
                of {GBP.format(goalAmount)}
              </p>
            </div>
            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted"
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
          </div>
        ) : null}

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_22.5rem]">
          {/* ── Left: hero + rankings (what the room watches) ── */}
          <div>
            {heroFavpoll ? (
              // The event page's own hero — identical styling by construction
              <div className="mb-8">
                {heroFavpoll.subject === "cause" || !heroProtagonist ? (
                  <CauseHero favpoll={heroFavpoll} />
                ) : (
                  <BaseFavpollHero
                    favpoll={heroFavpoll}
                    protagonist={heroProtagonist}
                  />
                )}
              </div>
            ) : (
              <div className="mb-8 flex items-center gap-4">
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
                    <p className="text-xs font-medium tracking-widest text-primary uppercase">
                      {headline.prefix}
                    </p>
                  )}
                  <h1 className="truncate text-3xl font-medium tracking-tight text-foreground">
                    {protagonistName}
                  </h1>
                  {headline.suffix && (
                    <p className="text-sm text-primary">{headline.suffix}</p>
                  )}
                </div>
              </div>
            )}

            {poll && (
              <DisplayPollSection
                poll={poll}
                isClosed={effectiveClosed}
                justClosed={localClosed && !isClosed}
                protagonistFirstName={
                  avatar ? protagonistName.split(/[\s&]+/)[0] : null
                }
              />
            )}
          </div>

          {/* ── Right: the room's meta, event-page style ── */}
          <div className="space-y-4">
            {/* QR — the call to action, promoted to the top */}
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-5 py-6">
              <BrandedQR
                value={favpollUrl}
                size={176}
                aria-label="Scan to pledge on your phone"
              />
              <p className="text-lg font-medium tracking-tight text-foreground">
                Scan to pledge
              </p>
              <p className="text-sm text-muted-foreground">
                Pick a favourite — 100% goes to charity.
              </p>
            </div>

            {isOpen ? (
              <div className="rounded-lg border border-border bg-card px-5 py-4">
                <Countdown closesAt={closesAt!} />
              </div>
            ) : localClosed ? (
              <div className="rounded-lg border border-border bg-card px-5 py-4">
                <p className="text-xs font-medium tracking-widest text-primary uppercase">
                  Poll closed
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thank you — the final standings are in.
                </p>
              </div>
            ) : null}

            {charities.length > 0 ? (
              <CharityBanner
                charities={charities}
                totalRaised={totalRaised}
                goalAmount={null}
              />
            ) : (
              charityName && (
                <div className="rounded-lg border border-border bg-card px-5 py-4 text-center">
                  <p className="mb-1 text-sm text-muted-foreground">
                    raised for {charityName}
                  </p>
                  <p
                    className="text-3xl font-medium text-foreground"
                    aria-live="polite"
                  >
                    {GBP.format(totalRaised)}
                  </p>
                </div>
              )
            )}

            <GuestWall entries={wallEntries} animate maxEntries={8} />
          </div>
        </div>
      </div>
    </div>
  )
}
