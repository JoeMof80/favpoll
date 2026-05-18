"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "@/lib/supabase/client"
import { useRankingItems } from "@/components/ranking-list/use-ranking-items"
import { formatAmount } from "@/components/ranking-list/utils"
import { getEventHeadline } from "@/lib/display"
import type { TopicItem } from "@/types"

const BRAND = "#534AB7"
const ROW_HEIGHT = 72

type DisplayPoll = {
  id: string
  personal_framing: string | null
  personal_reveal: string | null
  topic: {
    id: string
    title: string
  }
  items: TopicItem[]
}

type Props = {
  eventId: string
  protagonistName: string
  dateLabel: string | null
  occasionLabel: string | null
  description: string | null
  occasion: string
  charityName: string | null
  polls: DisplayPoll[]
  initialTotalRaised: number
  pollIds: string[]
  eventUrl: string
}

function DisplayRankingRow({
  item,
  isColorTopic,
  maxPledged,
  style,
}: {
  item: TopicItem & { rank: number }
  isColorTopic: boolean
  maxPledged: number
  style?: React.CSSProperties
}) {
  const barWidth = maxPledged > 0 ? (item.all_time_pledged / maxPledged) * 100 : 0
  const amountStr = formatAmount(item.all_time_pledged)
  const pledgeStr = `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`

  return (
    <li
      aria-label={`${item.label}, rank ${item.rank}, ${amountStr} · ${pledgeStr}`}
      className="absolute w-full transition-transform duration-500 ease-in-out"
      style={style}
    >
      <div className="flex items-center gap-3 pb-1">
        <span
          className="w-5 shrink-0 text-right text-sm font-medium tabular-nums"
          style={{ color: item.rank === 1 ? "#C09B2E" : undefined }}
          aria-hidden="true"
        >
          {item.rank}
        </span>
        {isColorTopic && (
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: item.label.toLowerCase() }}
            aria-hidden="true"
          />
        )}
        <span className="flex-1 truncate text-base text-foreground">
          {item.label}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {amountStr} · {pledgeStr}
        </span>
      </div>
      <div
        className="ml-8 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="presentation"
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%`, backgroundColor: BRAND }}
          aria-hidden="true"
        />
      </div>
    </li>
  )
}

function DisplayPollSection({ poll }: { poll: DisplayPoll }) {
  const { items, announcement, maxValue } = useRankingItems(
    poll.items,
    poll.topic.id,
    "amount"
  )
  const isColorTopic = poll.topic.title.toLowerCase().includes("colour") ||
    poll.topic.title.toLowerCase().includes("color")

  return (
    <section className="mb-10" aria-labelledby={`poll-${poll.id}-heading`}>
      <h2
        id={`poll-${poll.id}-heading`}
        className="mb-1 text-lg font-medium text-foreground"
      >
        {poll.personal_framing ?? poll.topic.title}
      </h2>
      {poll.personal_reveal && (
        <p className="mb-4 border-l-2 pl-3 text-sm italic text-muted-foreground"
          style={{ borderColor: "#EEEDFE" }}
        >
          {poll.personal_reveal}
        </p>
      )}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
      <ol
        aria-label={`${poll.topic.title} rankings`}
        aria-live="polite"
        className="relative"
        style={{ height: items.length * ROW_HEIGHT }}
      >
        {items.map((item) => (
          <DisplayRankingRow
            key={item.id}
            item={item}
            isColorTopic={isColorTopic}
            maxPledged={maxValue}
            style={{ transform: `translateY(${(item.rank - 1) * ROW_HEIGHT}px)` }}
          />
        ))}
      </ol>
    </section>
  )
}

export function DisplayScreen({
  eventId,
  protagonistName,
  dateLabel,
  occasionLabel,
  description,
  occasion,
  charityName,
  polls,
  initialTotalRaised,
  pollIds,
  eventUrl,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`display-pledges-${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pledges" },
        async () => {
          if (pollIds.length === 0) return
          const { data } = await supabase
            .from("pledges")
            .select("total_amount")
            .in("event_poll_id", pollIds)
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
  }, [eventId, pollIds, supabase])

  const headline = getEventHeadline({
    occasion,
    occasionLabel,
    name: protagonistName,
    dateLabel,
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="w-full max-w-3xl px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          {headline.prefix && (
            <p
              className="mb-3 text-sm font-medium uppercase tracking-widest"
              style={{ color: BRAND }}
            >
              {headline.prefix}
            </p>
          )}
          <h1 className="mb-4 text-5xl font-medium tracking-tight text-foreground">
            {protagonistName}
          </h1>
          {headline.suffix && (
            <p className="text-lg" style={{ color: BRAND }}>
              {headline.suffix}
            </p>
          )}
          {description && (
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Rankings */}
        {polls.map((poll) => (
          <DisplayPollSection key={poll.id} poll={poll} />
        ))}

        {/* Charity total */}
        {charityName && (
          <div className="my-8 text-center">
            <p className="mb-1 text-sm text-muted-foreground">
              raised for {charityName}
            </p>
            <p
              className="text-4xl font-medium text-foreground"
              aria-live="polite"
            >
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
                minimumFractionDigits: 2,
              }).format(totalRaised)}
            </p>
          </div>
        )}

        {/* QR code */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-8">
          <QRCodeSVG
            value={eventUrl}
            size={120}
            fgColor={BRAND}
            bgColor="transparent"
            aria-label="Scan to pledge on your phone"
          />
          <p className="text-sm text-muted-foreground">scan to pledge</p>
        </div>
      </div>
    </div>
  )
}
