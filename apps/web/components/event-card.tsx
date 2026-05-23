"use client"

import Link from "next/link"
import { Gift, ChartBarDecreasing } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { PickerField } from "@/components/ui/picker-field"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { FavpollCardProvider } from "./favpoll-card/favpoll-card-context"
import type { FavpollCardSize } from "./favpoll-card/types"
import { PollTitle } from "./favpoll-card/poll-title"
import { StripeCheckout } from "./stripe-checkout"
import { AmountPresets } from "./pledge-card/amount-presets"
import { useEventCardPledge } from "./event-card/use-event-card-pledge"
import { EventCardResults } from "./event-card/event-card-results"
import { EventCardCharityCarousel } from "./event-card/event-card-charity-carousel"
import type { CardResultItem } from "./event-card/use-event-card-pledge"
import type { Charity } from "@favpoll/types"

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
  initialResults?: CardResultItem[]
}

const PRESET_AMOUNTS = [5, 10, 20, 50]

function buildDisplayValue(
  label: string | null,
  amount: number | null
): string | null {
  if (!label) return null
  const base = `${label} • 100%`
  if (amount === null) return base
  return `${base} • ${formatCurrency(amount * 100)}`
}

export function EventCard({
  size = "full",
  event,
  className,
  initialResults,
}: Props) {
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
    selectItem,
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

  const pickerItems = topicItems.map((item) => ({
    id: item.id,
    label: item.label,
  }))
  const displayValue = buildDisplayValue(selectedItemLabel, amount)

  return (
    <FavpollCardProvider value={{ size }}>
      <li className={cn("list-none", className)}>
        <div className="group flex h-full flex-col rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]">
          {/* Navigable header — links to event page */}
          <Link href={`/events/${event.id}`} className="block px-5 pt-5">
            <FavpollHeader
              protagonist={{ name: event.protagonist.name }}
              eyebrow={event.occasion_label}
            />
          </Link>

          {/* PollTitle row — with pledge-again button when in pledged state */}
          {topicTitle && (
            <div className="flex items-center justify-between gap-1 px-5 pb-2">
              <div>
                <PollTitle title={topicTitle} />
                {event.description && (
                  <p className="mt-2 mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>

              {poll && topicItems.length > 0 && (
                <>
                  {step === "pledged" ? (
                    <TooltipProvider>
                      <Tooltip content="Pledge again" side="left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={resetPledge}
                          aria-label="Pledge again"
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </TooltipProvider>
                  ) : results !== null ? (
                    <TooltipProvider>
                      <Tooltip content="View results" side="left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={viewResults}
                          aria-label="View results"
                        >
                          <ChartBarDecreasing className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </TooltipProvider>
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
            <div className="px-5 pb-5">
              {step !== "pledged" ? (
                <div className="space-y-2">
                  <PickerField
                    items={pickerItems}
                    selectedIds={selectedItemId ? [selectedItemId] : []}
                    onToggle={(id) => {
                      const item = topicItems.find((i) => i.id === id)
                      if (item) selectItem(id, item.label)
                    }}
                    displayValue={displayValue}
                    placeholder="Select favourites…"
                    closeOnSelect
                    popoverLabel={topicTitle}
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
          ) : (
            <div className="px-5 pb-5">
              <Link href={`/events/${event.id}`} tabIndex={-1}>
                <Button type="button" variant="outline" className="w-full">
                  View event
                </Button>
              </Link>
            </div>
          )}

          {/* Footer — charity carousel */}
          {event.charities.length > 0 && (
            <div className="mt-auto border-t border-border px-4 py-3">
              <EventCardCharityCarousel
                charities={event.charities}
                perCharity={perCharity}
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
    </FavpollCardProvider>
  )
}
