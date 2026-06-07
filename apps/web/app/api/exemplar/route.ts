import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { PollResultItem } from "@/components/favpoll-card/types"

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

const EXEMPLAR_SELECT = `
  id, register, occasion_type, opening_line, total_raised,
  protagonist:protagonists!events_protagonist_id_fkey(name, about, context, photo_url),
  charities:event_charities(charity:charities(id, name, logo_url, registered_number)),
  event_polls(
    id, personal_reveal,
    topics!event_polls_topic_id_fkey(title, is_finite, topic_items(id, label)),
    event_poll_items(topic_items(id, label))
  )
`

type RawTopicItem = { id: string; label: string }
type RawEpi = { topic_items: RawTopicItem }
type RawPoll = {
  id: string
  personal_reveal: string | null
  topics: {
    title: string
    is_finite: boolean
    topic_items: RawTopicItem[]
  } | null
  event_poll_items: RawEpi[]
}
type RawCharity = {
  charity: {
    id: string
    name: string
    logo_url: string | null
    registered_number: string | null
  }
}
type RawEvent = {
  id: string
  register: string
  occasion_type: string | null
  opening_line: string | null
  total_raised: number
  protagonist: {
    name: string
    about: string | null
    context: string | null
    photo_url: string | null
  }
  charities: RawCharity[]
  event_polls: RawPoll | null
}

async function findExemplar(
  supabase: ReturnType<typeof createAdminClient>,
  register: string,
  occasionType: string | null
): Promise<RawEvent | null> {
  let q = supabase
    .from("events")
    .select(EXEMPLAR_SELECT)
    .eq("is_exemplar", true)
    .eq("is_private", false)
    .not("closed_at", "is", null)
    .eq("register", register)

  if (occasionType) {
    q = q.eq("occasion_type", occasionType)
  }

  const { data } = await q
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as unknown as RawEvent) ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const register = searchParams.get("register")
  const occasionType = searchParams.get("occasion_type") || null

  if (!register) return NextResponse.json(null)

  const supabase = createAdminClient()

  // Try occasion_type match first, fall back to register-only
  let event = await findExemplar(supabase, register, occasionType)
  if (!event && occasionType) {
    event = await findExemplar(supabase, register, null)
  }

  if (!event) return NextResponse.json(null)

  const poll = event.event_polls ?? null
  let pollResult: {
    topicTitle: string
    personalReveal: string | null
    results: PollResultItem[]
  } | null = null

  if (poll) {
    const isFinite = poll.topics?.is_finite ?? false

    const items: RawTopicItem[] = isFinite
      ? (poll.topics?.topic_items ?? [])
      : (poll.event_poll_items ?? [])
          .map((epi) => epi.topic_items)
          .filter(Boolean)

    // Fetch pledge totals
    const { data: pledges } = await supabase
      .from("pledges")
      .select("id")
      .eq("event_poll_id", poll.id)
      .is("withdrawn_at", null)

    const pledgeIds = (pledges ?? []).map((p) => p.id)
    const totals = new Map<string, number>()

    if (pledgeIds.length > 0) {
      const { data: allocations } = await supabase
        .from("pledge_allocations")
        .select("topic_item_id, amount")
        .in("pledge_id", pledgeIds)

      for (const row of allocations ?? []) {
        totals.set(
          row.topic_item_id,
          (totals.get(row.topic_item_id) ?? 0) + (row.amount ?? 0)
        )
      }
    }

    const merged = items.map((item) => ({
      label: item.label,
      total: totals.get(item.id) ?? 0,
    }))

    const sorted = merged.sort(
      (a, b) => b.total - a.total || a.label.localeCompare(b.label)
    )
    const max = sorted[0]?.total ?? 0

    const results: PollResultItem[] = sorted
      .filter((r) => r.total > 0)
      .map((r) => ({
        label: r.label,
        amount: GBP.format(r.total),
        widthPercent: max > 0 ? Math.round((r.total / max) * 100) : 0,
      }))

    pollResult = {
      topicTitle: poll.topics?.title ?? "",
      personalReveal: poll.personal_reveal,
      results,
    }
  }

  return NextResponse.json({
    id: event.id,
    register: event.register,
    occasion_type: event.occasion_type,
    opening_line: event.opening_line,
    total_raised: event.total_raised,
    protagonist: event.protagonist,
    charities: event.charities.map((c) => c.charity),
    poll: pollResult,
  })
}
