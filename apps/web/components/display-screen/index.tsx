"use client"

import { useEffect, useState } from "react"
import { BrandedQR } from "@/components/branded-qr"
import { createClient } from "@/lib/supabase/client"
import { getFavpollHeadline } from "@/lib/display"
import { CharityBanner } from "@/components/charity-banner"
import { Countdown } from "@/components/countdown"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { useLiveWall } from "@/components/use-live-wall"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"
import type { Charity } from "@favpoll/types"

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
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
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

  const headline = getFavpollHeadline({
    occasionType,
    openingLine,
    name: protagonistName,
    dateLabel,
  })

  const isOpen = closesAt ? new Date(closesAt) > new Date() : false

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto w-full max-w-6xl px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_22.5rem]">
          {/* ── Left: hero + rankings (what the room watches) ── */}
          <div>
            <div className="relative mb-10">
              <div className={avatar ? "pr-24" : ""}>
                {headline.prefix && (
                  <p className="mb-2 text-sm font-medium tracking-widest text-primary uppercase">
                    {headline.prefix}
                  </p>
                )}
                <h1 className="text-5xl font-medium tracking-tight text-foreground">
                  {protagonistName}
                </h1>
                {headline.suffix && (
                  <p className="mt-2 text-xl text-primary">{headline.suffix}</p>
                )}
                {description && (
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {avatar && (
                <div className="absolute top-0 right-0">
                  <ProtagonistAvatar
                    name={avatar.name}
                    photoUrl={avatar.photoUrl}
                  />
                </div>
              )}
            </div>

            {poll && <DisplayPollSection poll={poll} />}
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

            {isOpen && (
              <div className="rounded-lg border border-border bg-card px-5 py-4">
                <Countdown closesAt={closesAt!} />
              </div>
            )}

            {charities.length > 0 ? (
              <CharityBanner
                charities={charities}
                totalRaised={totalRaised}
                goalAmount={goalAmount}
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
