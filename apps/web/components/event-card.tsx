"use client"

import Link from "next/link"
import { Gift, ChartBarDecreasing } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { PledgePanel } from "@/components/pledge-panel"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import type { FavpollCardSize } from "./favpoll-card/types"
import { PollTitle } from "./favpoll-card/poll-title"
import { StripeCheckout } from "./stripe-checkout"
import { AmountPresets } from "./pledge-card/amount-presets"
import { useEventCardPledge } from "./event-card/use-event-card-pledge"
import { EventCardResults } from "./event-card/event-card-results"
import { EventCardCharityCarousel } from "./event-card/event-card-charity-carousel"
import type { CardResultItem } from "./event-card/use-event-card-pledge"
import type { Charity, TopicItem } from "@favpoll/types"
import { AmountInput } from "./pledge-card/amount-input"

type EventCardEvent = {
  id: string
  occasion: string
  opening_line: string
  description: string | null
  closes_at: string
  total_raised: number
  protagonist: { name: string }
  charities: { charity: Charity }[]
  poll: {
    id: string
    topic_id: string | null
    topic: {
      title: string
      topic_items: { id: string; label: string }[]
    } | null
  } | null
}

type Props = {
  size?: FavpollCardSize
  event: EventCardEvent
  className?: string
  initialResults?: CardResultItem[]
}

const PRESET_AMOUNTS = [5, 10, 20, 50]

export function EventCard({
  size = "sm",
  event,
  className,
  initialResults,
}: Props) {
  const poll = event.poll
  const topicTitle = poll?.topic?.title ?? ""
  const topicItems = (poll?.topic?.topic_items ?? []) as TopicItem[]
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  const {
    selectedIds,
    setSelectedIds,
    amount,
    step,
    clientSecret,
    results,
    error,
    selectAmount,
    initPayment,
    onPaymentSuccess,
    closePayment,
    resetPledge,
    viewResults,
  } = useEventCardPledge({
    pollId: poll?.id ?? "",
    initialResults,
  })

  return (
    <li className={cn("list-none", className)}>
      <div className="group flex h-full flex-col rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]">
        {/* Navigable header — links to event page */}
        <Link href={`/events/${event.id}`} className="block p-3">
          <FavpollHeader
            protagonist={{ name: event.protagonist.name }}
            eyebrow={event.occasion}
            size={size}
          />
        </Link>

        {/* PollTitle row — with pledge-again button when in pledged state */}
        {topicTitle && (
          <div className="flex items-center justify-between gap-1 border-t border-border px-3 pt-2">
            <div>
              <PollTitle title={topicTitle} size="md" />
              {event.description && (
                <p className="mt-2 mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              )}
            </div>

            {poll && topicItems.length > 0 && (
              <>
                {step === "pledged" ? (
                  <TooltipIconButton
                    icon={Gift}
                    label="Pledge again"
                    onClick={resetPledge}
                  />
                ) : results !== null ? (
                  <TooltipIconButton
                    icon={ChartBarDecreasing}
                    label="View results"
                    onClick={viewResults}
                  />
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Description only — when there's no topicTitle */}
        {!topicTitle && event.description && (
          <Link href={`/events/${event.id}`} className="block px-5">
            <p className="mt-2 mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </Link>
        )}

        {/* Pledge section — not inside Link */}
        {poll && topicItems.length > 0 ? (
          <div>
            {step !== "pledged" ? (
              <>
                <div className="px-3 py-2">
                  <PledgePanel
                    items={topicItems}
                    totalAmount={amount !== null ? String(amount) : ""}
                    onSelectionsChange={setSelectedIds}
                    topicTitle={topicTitle}
                    size={size}
                  />
                </div>
                <div className="space-y-2 border-t border-border px-3 py-2">
                  <AmountInput
                    id="pledge-amount"
                    value={amount !== null ? String(amount) : ""}
                    onChange={(v) => selectAmount(Number(v))}
                    size={size}
                  />

                  <AmountPresets
                    amounts={PRESET_AMOUNTS}
                    value={amount !== null ? String(amount) : ""}
                    onChange={(v) => selectAmount(Number(v))}
                  />

                  {error && (
                    <p className="text-xs text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <Button
                    type="button"
                    size={size === "lg" ? "default" : "sm"}
                    className="w-full"
                    disabled={step !== "ready"}
                    onClick={initPayment}
                  >
                    Pledge favourites
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-t border-border px-3 py-2">
                <EventCardResults results={results ?? []} />
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 pb-5">
            <Link href={`/events/${event.id}`} tabIndex={-1}>
              <Button type="button" variant="outline" className="w-full">
                View event
              </Button>
            </Link>
          </div>
        )}

        {/* Charity footer — inside the card so it doesn't overflow the grid cell */}
        {event.charities.length > 0 && (
          <div className="mt-auto border-t border-border px-4 py-3">
            <EventCardCharityCarousel
              charities={event.charities}
              perCharity={perCharity}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Stripe payment modal */}
      {step === "paying" && clientSecret && (
        <StripeCheckout
          clientSecret={clientSecret}
          chargeAmount={amount ?? 0}
          onSuccess={onPaymentSuccess}
          onClose={closePayment}
        />
      )}
    </li>
  )
}
