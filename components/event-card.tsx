"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { FavpollCardProvider } from "./favpoll-card/favpoll-card-context"
import type { FavpollCardSize } from "./favpoll-card/types"
import { PollTitle } from "./favpoll-card/poll-title"
import { CharityRow } from "./charity-row"
import { StripeCheckout } from "./stripe-checkout"
import { AmountPresets } from "./pledge-card/amount-presets"
import { useEventCardPledge } from "./event-card/use-event-card-pledge"
import { EventCardSelectionField } from "./event-card/event-card-selection-field"
import { EventCardItemPicker } from "./event-card/event-card-item-picker"
import { EventCardResults } from "./event-card/event-card-results"
import type { Charity } from "@/types"

type EventCardEvent = {
  id: string
  occasion_label: string
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
}

const PRESET_AMOUNTS = [5, 10, 20, 50]

export function EventCard({ size = "full", event, className }: Props) {
  const poll = event.poll
  const topicTitle = poll?.topic?.title ?? ""
  const topicItems = poll?.topic?.topic_items ?? []
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  const {
    selectedItemId,
    selectedItemLabel,
    amount,
    step,
    clientSecret,
    results,
    error,
    openPicker,
    closePicker,
    selectItem,
    selectAmount,
    initPayment,
    onPaymentSuccess,
    closePayment,
  } = useEventCardPledge({
    pollId: poll?.id ?? "",
    topicId: poll?.topic_id ?? null,
  })

  return (
    <FavpollCardProvider value={{ size }}>
      <li className={cn("list-none", className)}>
        <div className="group flex h-full flex-col rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]">
          {/* Navigable header — links to event page */}
          <Link href={`/events/${event.id}`} className="block px-5 pt-5">
            <FavpollHeader
              protagonistName={event.protagonist.name}
              eyebrow={event.occasion_label}
              dateLabel={event.closes_at}
            />
            {topicTitle && <PollTitle title={topicTitle} />}
          </Link>

          {/* Pledge section — not inside Link */}
          {poll && topicItems.length > 0 && (
            <div className="px-5 pb-5">
              {step !== "pledged" ? (
                <div className="space-y-2">
                  <EventCardSelectionField
                    selectedItemLabel={selectedItemLabel}
                    amount={amount}
                    isOpen={step === "picking"}
                    onClick={step === "picking" ? closePicker : openPicker}
                  />

                  {step === "picking" && (
                    <EventCardItemPicker
                      items={topicItems}
                      selectedId={selectedItemId}
                      onSelect={selectItem}
                    />
                  )}

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
                    className="w-full"
                    disabled={step !== "ready"}
                    onClick={initPayment}
                  >
                    Pledge favourites
                  </Button>
                </div>
              ) : (
                <EventCardResults results={results ?? []} />
              )}
            </div>
          )}

          {/* Footer — charity rows */}
          {event.charities.length > 0 && (
            <div className="mt-auto border-t border-border px-4 py-3">
              <div className="space-y-3">
                {event.charities.map((c) => (
                  <CharityRow
                    key={c.charity.id}
                    charity={c.charity}
                    amountRaised={perCharity}
                  />
                ))}
              </div>
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
    </FavpollCardProvider>
  )
}
