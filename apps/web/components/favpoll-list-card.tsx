"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { favpollEyebrow } from "@/lib/favpoll-eyebrow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PledgeDialog } from "@/components/pledge-dialog"
import { ChevronLeft, ChevronRight, Gift } from "lucide-react"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { PollHeading } from "@/components/poll-heading"
import { ClosingLabel } from "@/components/closing-label"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import type { FavpollCardSize } from "./favpoll-card/types"
import { FavpollListCardResults } from "./favpoll-list-card/favpoll-list-card-results"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import type { CardResultItem } from "./favpoll-list-card/use-favpoll-list-card-pledge"
import type {
  Charity,
  FavpollCategory,
  FavpollPollWithItems,
  FavpollSubject,
} from "@favpoll/types"
import { decoyWidth } from "@/lib/decoys"
import { paletteForFavpoll } from "@/lib/register-palette"
import { buildMechanicSteps } from "@/lib/mechanic-steps"
import { joinCharities } from "@/lib/og/favpoll-og"
import { LockCardContent } from "@/components/lock-card-content"

type FavpollListCardFavpoll = {
  id: string
  subject?: string
  cause_label?: string | null
  category?: string | null
  occasion_type: string | null
  opening_line: string
  description: string | null
  closes_at: string
  closed_at?: string | null
  total_raised: number
  is_exemplar?: boolean
  /** Cause favpolls carry their own photo; person favpolls keep it on the protagonist. */
  photo_url?: string | null
  /** Content-free reveal flags (the page derives them server-side) —
   *  they shape the lock card's step 3, never its content. */
  hasReveal?: boolean
  revealIsQuote?: boolean
  revealIsMessage?: boolean
  protagonist: {
    name: string
    photo_url?: string | null
    about?: string | null
  } | null
  charities: { charity: Charity }[]
  poll: {
    id: string
    topic_id: string | null
    topic: {
      title: string
      is_finite: boolean
      favourites: { id: string; label: string }[]
    } | null
  } | null
}

type Props = {
  size?: FavpollCardSize
  favpoll: FavpollListCardFavpoll
  className?: string
  clerkUserId?: string | null
  initialResults?: CardResultItem[]
}

export function FavpollListCard({
  size = "sm",
  favpoll,
  className,
  clerkUserId = null,
  initialResults,
}: Props) {
  const poll = favpoll.poll
  const topicItems = poll?.topic?.favourites ?? []
  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  const [hasPledged, setHasPledged] = useState(!!initialResults)
  const [results, setResults] = useState<CardResultItem[] | null>(
    initialResults ?? null
  )
  // The dialog is controlled so both the topic banner and the lock overlay
  // can open it (uncontrolled mode ties opening to the banner alone).
  const [pledgeOpen, setPledgeOpen] = useState(false)
  // THE SHOP WINDOW FLIPS (founder, 2026-09-01: /favpolls is a shop window
  // — the front sells THIS favpoll, the back sells what's behind it: the
  // mechanic while locked, the standings once entitled). Locked cards
  // open on the story; entitled cards open on the standings — the payoff
  // face — with "Back to the story" one tap away (founder, 2026-09-01:
  // the story must not vanish at the moment someone pledges).
  const [flipped, setFlipped] = useState(
    !!initialResults || !!favpoll.closed_at
  )

  const isClosed = !!favpoll.closed_at
  const entitled = hasPledged || isClosed

  const decoyResults: CardResultItem[] = [...topicItems]
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 4)
    .map((item, i) => ({
      label: item.label,
      amountPence: 0,
      widthPercent: decoyWidth(i),
    }))

  async function handlePledgeSuccess(guestToken?: string) {
    setHasPledged(true)
    // The back body swaps from mechanic to standings — stay on it.
    setFlipped(true)
    if (!poll) return
    try {
      // The results API is entitlement-gated (same gate as the reveal):
      // signed-in pledgers pass via cookie auth; guests pass the token
      // their pledge just minted.
      const query = guestToken
        ? `?guest_token=${encodeURIComponent(guestToken)}`
        : ""
      const res = await fetch(`/api/polls/${poll.id}/results${query}`)
      if (res.ok) {
        const { results: fetched } = (await res.json()) as {
          results: CardResultItem[]
        }
        if (fetched.length > 0) setResults(fetched)
      }
    } catch {
      // Non-fatal — pledged state shown without results
    }
  }

  const pollWithItems: FavpollPollWithItems | null =
    poll && poll.topic
      ? ({
          id: poll.id,
          favpoll_id: favpoll.id,
          topic_id: poll.topic_id ?? "",
          personal_reveal: null,
          created_at: "",
          topics: {
            id: poll.topic_id ?? "",
            title: poll.topic.title,
            is_finite: poll.topic.is_finite,
            is_active: true,
            description: null,
            created_by: null,
            created_at: "",
            favourites: topicItems,
          },
        } as unknown as FavpollPollWithItems)
      : null

  const isCause = favpoll.subject === "cause"
  const displayName = isCause
    ? (favpoll.cause_label ?? "")
    : (favpoll.protagonist?.name ?? "")
  const aboutText =
    (isCause
      ? favpoll.description
      : (favpoll.protagonist?.about ?? favpoll.description)) ?? null
  const frontPhoto = isCause
    ? (favpoll.photo_url ?? null)
    : (favpoll.protagonist?.photo_url ?? null)

  // The card wears its own register's palette — one element on a mixed
  // surface, so the attribute scopes the subtree (see RegisterScope notes).
  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  const charityFooter = favpoll.charities.length > 0 && (
    <div className="mt-auto border-t border-border px-4 py-3">
      <FavpollListCardCharityCarousel
        charities={favpoll.charities}
        perCharity={perCharity}
        size="sm"
      />
    </div>
  )

  // withPhoto: the flip card's front already carries the large avatar, so
  // its header goes without one (founder, 2026-09-01); entitled cards keep
  // the header thumb — it is their only picture.
  const headerFor = (withPhoto: boolean) => (
    <div className="p-3">
      <FavpollHeader
        linkCue
        hideEmptyAvatar
        protagonist={{
          name: displayName,
          photo_url:
            withPhoto && !isCause
              ? (favpoll.protagonist?.photo_url ?? null)
              : null,
        }}
        eyebrow={favpollEyebrow(favpoll)}
        size={size}
      />
    </div>
  )

  const canFlip = !!pollWithItems && topicItems.length > 0

  return (
    <li className={cn("list-none", className)}>
      {/* Interaction matches FavpollSummaryCard: the whole card navigates
          (stretched link below), with the same hover lift + shadow. The
          interactive pieces sit above the link (relative/z) so pledging
          and flipping still work. */}
      <div
        data-register={palette ?? undefined}
        className={cn(
          "group relative flex h-full flex-col rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:border-border-strong hover:shadow-lg motion-safe:hover:-translate-y-1",
          // Your pledge, visible at a glance: a thicker purple border
          // (strip + badge tried and rejected — founder call 2026-07-23)
          hasPledged && "border-2 border-primary/50 hover:border-primary/70"
        )}
      >
        {/* Stretched link — covers the card; positioned siblings paint and
            hit-test above it. */}
        <Link
          href={`/favpolls/${favpoll.id}`}
          aria-label={`View favpoll: ${displayName}`}
          className="absolute inset-0 rounded-xl"
        />
        {favpoll.is_exemplar && (
          <Badge
            variant="secondary"
            className="pointer-events-none absolute top-3 right-3 z-10"
          >
            Example
          </Badge>
        )}

        {canFlip ? (
          /* The established card shape holds (founder, 2026-09-01, v3):
             header, topic row and charity footer are STATIC — only the
             body between them flips. The flip is presented as a two-step
             JOURNEY, not a lock: each body ends in a step row — two dots
             and a quiet named action ("How to pledge" / "Back to the
             story"). The lock pill and CTA button auditions both lost. */
          <>
            {headerFor(false)}
            {/* items-start: the closing label sits level with the
                FAVOURITE eyebrow line, not centred against the two-line
                header (founder, 2026-09-01). */}
            <div className="flex items-start justify-between gap-2 border-t border-border px-3 py-2">
              <div className="min-w-0 flex-1">
                <PollHeading
                  topicTitle={pollWithItems!.topics.title}
                  size="md"
                  inert
                />
              </div>
              {/* The countdown always lives here; the pledge-again gift
                  moved into the step row's second panel (founder,
                  2026-09-01, third placement). */}
              <ClosingLabel
                closesAt={favpoll.closes_at}
                className="mt-0.5 shrink-0 whitespace-nowrap"
              />
            </div>
            {/* ONE FIXED BODY HEIGHT for every card (founder, 2026-09-01:
               "the favpoll height varies" — content-driven heights read
               ragged, worst in the phone's single column). The faces are
               ABSOLUTE inside it, so no face's content can size the card:
               the story clamps, the standings scroll, the teaching card
               fits. h-72 holds the tallest face with room. */}
            <div className="h-72 [perspective:1200px]">
              <div
                className={cn(
                  "relative h-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
                  flipped && "[transform:rotateY(180deg)]"
                )}
              >
                {/* ── Front body: step 1, the story ── */}
                {/* pointer-events-none on the hidden body, not just inert:
                    inert DISCARDS clicks rather than passing them through,
                    and the rotated body's transform traps its z-10 inside
                    its own stacking context — so the hidden face's step
                    row was swallowing taps meant for the visible one. */}
                <div
                  inert={flipped || undefined}
                  className={cn(
                    "absolute inset-0 flex min-w-0 flex-col [backface-visibility:hidden]",
                    flipped && "pointer-events-none"
                  )}
                >
                  {/* The avatar floats and the whole about wraps around it
                      — no truncation (founder, 2026-09-01). */}
                  <div className="px-3 pt-2 pb-1">
                    <ProtagonistAvatar
                      name={displayName}
                      photoUrl={frontPhoto}
                      className="float-right mb-1 ml-3 h-24 w-24 md:h-24 md:w-24"
                    />
                    {aboutText && (
                      /* Clamped as a ceiling, not a squeeze (founder,
                         2026-09-01: a max-length about may cut — the full
                         page is one tap away). */
                      <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
                        {aboutText}
                      </p>
                    )}
                  </div>
                  {/* The step row shows only the way FORWARD (founder,
                      2026-09-01: no inert labels — links or nothing). */}
                  <div className="relative z-10 mt-auto flex items-center justify-end px-3 pb-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFlipped(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {entitled ? "Standings" : "Pledge"}
                      <ChevronRight data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {/* ── Back body: the mechanic while locked, the standings
                    once entitled ── */}
                <div
                  inert={!flipped || undefined}
                  className={cn(
                    "absolute inset-0 flex min-w-0 [transform:rotateY(180deg)] flex-col [backface-visibility:hidden]",
                    !flipped && "pointer-events-none"
                  )}
                >
                  {entitled ? (
                    /* fill: the standings grow into whatever height the
                       story face earned — the old 120px cap left a void
                       under three bars (founder, 2026-09-01). */
                    <div className="relative flex min-h-0 flex-1 flex-col px-3 py-2">
                      <FavpollListCardResults results={results ?? []} fill />
                    </div>
                  ) : (
                    /* min-h holds room for the compact lock card — the decoy
                       alone caps at 120px and the card wants ~170. */
                    <div className="relative min-h-44 px-3 py-2">
                      <div
                        className="pointer-events-none blur-xs select-none"
                        aria-hidden="true"
                        data-testid="list-card-decoy"
                      >
                        <FavpollListCardResults results={decoyResults} />
                      </div>
                      {/* Full-area unlock, the poll section's idiom — the
                        page's own teaching card (lock-card-content,
                        compact), so the shelf and the favpoll page speak
                        the same instructions. */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setPledgeOpen(true)}
                        aria-label="Pledge your favourite"
                        className="absolute inset-0 z-10 h-auto w-full items-start justify-center rounded-none p-0 pt-1.5 whitespace-normal hover:bg-transparent"
                      >
                        <span className="pointer-events-none flex w-full max-w-72 flex-col items-stretch overflow-hidden rounded-xl bg-background/95 text-left shadow-lg ring-1 ring-border">
                          <LockCardContent
                            compact
                            steps={buildMechanicSteps({
                              topicTitle: pollWithItems!.topics.title,
                              charityLine:
                                favpoll.charities.length > 0
                                  ? joinCharities(
                                      favpoll.charities.map(
                                        (c) => c.charity.name
                                      )
                                    )
                                  : null,
                              firstName: isCause
                                ? null
                                : displayName.trim().split(/\s+/)[0] || null,
                              isCause,
                              hasReveal: favpoll.hasReveal ?? false,
                              revealIsQuote: favpoll.revealIsQuote,
                              revealIsMessage: favpoll.revealIsMessage,
                            })}
                            topicTitle={pollWithItems!.topics.title}
                          />
                        </span>
                      </Button>
                    </div>
                  )}
                  {/* The mirrored row: the way back, and a pledged card's
                      gift on this step only (founder, 2026-09-01 — links
                      or nothing, no inert labels). */}
                  <div className="relative z-10 mt-auto flex items-center justify-between px-3 pb-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFlipped(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      Story
                    </Button>
                    {hasPledged && !isClosed && (
                      <TooltipProvider>
                        <Tooltip content="Pledge again" side="left">
                          <Button
                            type="button"
                            size="icon-sm"
                            aria-label="Pledge again"
                            onClick={() => setPledgeOpen(true)}
                            className="transition-none"
                          >
                            <Gift aria-hidden="true" />
                          </Button>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {charityFooter}
          </>
        ) : (
          /* No poll body at all — header and charities only. */
          <>
            {headerFor(true)}
            {charityFooter}
          </>
        )}

        {pollWithItems && (
          <PledgeDialog
            favpollId={favpoll.id}
            clerkUserId={clerkUserId}
            charityNames={favpoll.charities.map((c) => c.charity.name)}
            pollWithItems={pollWithItems}
            pot={null}
            userPotAllocation={null}
            onPledgeSuccess={handlePledgeSuccess}
            isListed
            open={pledgeOpen}
            onOpenChange={setPledgeOpen}
          />
        )}
      </div>
    </li>
  )
}
