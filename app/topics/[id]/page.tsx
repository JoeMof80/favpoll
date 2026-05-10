import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Topic, TopicItem } from "@/types"

type Props = {
  params: Promise<{ id: string }>
}

function formatAmount(amount: number): string {
  if (amount === 0) return "—"
  if (amount >= 1000) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: topic } = await supabase
    .from("topics")
    .select("*, topic_items(*)")
    .eq("id", id)
    .single()

  if (!topic) notFound()

  const items: TopicItem[] = [
    ...((topic.topic_items ?? []) as TopicItem[]),
  ].sort((a, b) => b.all_time_pledged - a.all_time_pledged)

  const typedTopic = topic as Topic
  const maxPledged = items[0]?.all_time_pledged ?? 0
  const hasActivity = maxPledged > 0
  const totalPledged = items.reduce((s, i) => s + i.all_time_pledged, 0)
  const totalVotes = items.reduce((s, i) => s + i.all_time_count, 0)
  const topItem = items[0]

  return (
    <main className="mx-auto max-w-330 px-4 pt-10 pb-16">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/rankings" className="hover:text-foreground">
          Rankings
        </Link>
        <span aria-hidden="true">›</span>
        <span>{typedTopic.title}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — rankings */}
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            {typedTopic.title}
          </h1>
          {typedTopic.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {typedTopic.description}
            </p>
          )}

          <ol
            aria-label={`${typedTopic.title} — all-time rankings`}
            className="mt-6 space-y-2"
          >
            {items.map((item, i) => {
              const barWidth = hasActivity
                ? (item.all_time_pledged / maxPledged) * 100
                : 0

              return (
                <li
                  key={item.id}
                  className={`rounded-lg border bg-card px-4 py-3 ${i === 0 && hasActivity ? "border-primary/30" : "border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums"
                      aria-label={`Rank ${i + 1}`}
                    >
                      {i + 1}
                    </span>

                    {typedTopic.title.toLowerCase().includes('colour') && (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-border/50"
                        style={{ backgroundColor: item.label.toLowerCase() }}
                        aria-hidden="true"
                      />
                    )}

                    <span
                      className={`flex-1 text-sm ${i === 0 && hasActivity ? "font-medium text-foreground" : "text-foreground"}`}
                    >
                      {item.label}
                    </span>

                    <div className="text-right">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatAmount(item.all_time_pledged)}
                      </span>
                      {item.all_time_count > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.all_time_count} pledge
                          {item.all_time_count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ol>

          {items.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No pledges have been made on this topic yet.
            </p>
          )}
        </div>

        {/* Right — sticky sidebar */}
        <div className="sticky top-20 space-y-4 self-start">
          {hasActivity && (
            <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                All-time
              </p>
              <div className="space-y-3">
                {topItem && (
                  <div>
                    <p className="text-xs text-muted-foreground">Leading</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {typedTopic.title.toLowerCase().includes('colour') && (
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-border/50"
                          style={{ backgroundColor: topItem.label.toLowerCase() }}
                          aria-hidden="true"
                        />
                      )}
                      <p className="text-sm font-medium text-foreground">
                        {topItem.label}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Total raised</p>
                  <p className="mt-0.5 text-sm font-medium text-primary">
                    {formatAmount(totalPledged)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total pledges</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {totalVotes.toLocaleString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <p className="text-sm font-medium text-foreground">
              Use this topic in an event
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Ask your guests what their favourite{" "}
              {typedTopic.title.toLowerCase().replace("favourite ", "")} is —
              and turn their answers into donations for a charity you care
              about.
            </p>
            <Link
              href={`/events/new?topic=${id}`}
              className="mt-4 block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              Create an event
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
