"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "@/lib/supabase/client"
import { useRankingItems } from "@/components/ranking-list/use-ranking-items"
import { formatAmount } from "@/components/ranking-list/utils"
import { getFavpollHeadline } from "@/lib/display"
import { RankingBar } from "@/components/ui/ranking-bar"
import type { Favourite } from "@favpoll/types"

const BRAND = "#534AB7"
const ROW_HEIGHT = 72

type DisplayPoll = {
  id: string
  personal_reveal: string | null
  topic: {
    id: string
    title: string
  }
  items: Favourite[]
}

type Props = {
  favpollId: string
  protagonistName: string
  dateLabel: string | null
  openingLine: string | null
  description: string | null
  occasionType: string | null
  charityName: string | null
  poll: DisplayPoll | null
  initialTotalRaised: number
  pollId: string | null
  favpollUrl: string
}

function DisplayRankingRow({
  item,
  isColorTopic,
  maxPledged,
  isFirst,
  style,
}: {
  item: Favourite & { rank: number }
  isColorTopic: boolean
  maxPledged: number
  isFirst: boolean
  style?: React.CSSProperties
}) {
  const barWidth =
    maxPledged > 0 ? (item.all_time_pledged / maxPledged) * 100 : 0
  const amountStr = formatAmount(item.all_time_pledged)

  return (
    <li
      aria-label={`${item.label}, rank ${item.rank}, ${amountStr}`}
      className="absolute w-full transition-transform duration-500 ease-in-out"
      style={style}
    >
      <RankingBar
        label={item.label}
        amount={amountStr}
        widthPercent={barWidth}
        barStyle={{ background: isFirst ? BRAND : "#AFA9EC" }}
        labelSuffix={
          isColorTopic ? (
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: item.label.toLowerCase() }}
              aria-hidden="true"
            />
          ) : undefined
        }
      />
    </li>
  )
}

function DisplayPollSection({ poll }: { poll: DisplayPoll }) {
  const { items, announcement, maxValue } = useRankingItems(
    poll.items,
    poll.topic.id,
    "amount"
  )
  const isColorTopic =
    poll.topic.title.toLowerCase().includes("colour") ||
    poll.topic.title.toLowerCase().includes("color")

  return (
    <section className="mb-10" aria-labelledby={`poll-${poll.id}-heading`}>
      <h2
        id={`poll-${poll.id}-heading`}
        className="mb-1 text-lg font-medium text-foreground"
      >
        {poll.topic.title}
      </h2>
      {poll.personal_reveal && (
        <p
          className="mb-4 border-l-2 pl-3 text-sm text-muted-foreground italic"
          style={{ borderColor: "#EEEDFE" }}
        >
          {poll.personal_reveal}
        </p>
      )}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
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
            isFirst={item.rank === 1}
            style={{
              transform: `translateY(${(item.rank - 1) * ROW_HEIGHT}px)`,
            }}
          />
        ))}
      </ol>
    </section>
  )
}

export function DisplayScreen({
  favpollId,
  protagonistName,
  dateLabel,
  openingLine,
  description,
  occasionType,
  charityName,
  poll,
  initialTotalRaised,
  pollId,
  favpollUrl,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12">
      <div className="w-full max-w-3xl px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          {headline.prefix && (
            <p
              className="mb-3 text-sm font-medium tracking-widest uppercase"
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
        {poll && <DisplayPollSection poll={poll} />}

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
            value={favpollUrl}
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
