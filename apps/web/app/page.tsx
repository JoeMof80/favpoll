import { createAdminClient } from "@/lib/supabase/admin"
// PROTOTYPE — landing redesign variants, switchable via ?variant= (dev only).
// See components/landing/prototype/NOTES.md. When the prototype resolves,
// the winning variant's JSX moves back here and the prototype dir is deleted.
import { PrototypeSwitcher } from "@/components/landing/prototype/prototype-switcher"
import { VariantCurrent } from "@/components/landing/prototype/variant-current"
import { VariantStage } from "@/components/landing/prototype/variant-stage"
import { VariantEditorial } from "@/components/landing/prototype/variant-editorial"
import { VariantSplit } from "@/components/landing/prototype/variant-split"

// Minimum total pledged (in £) before the record section is shown.
// Keeps the section from appearing with thin or misleading figures.
// Coupled to the same threshold problem as /rankings (see TODO in PROJECT.md).
const RECORD_THRESHOLD_GBP = 500

const PROTOTYPE_VARIANTS = ["current", "stage", "editorial", "split"] as const

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>
}) {
  const supabase = createAdminClient()

  const [{ data: favpolls }, { data: topFavourites }, { data: charities }] =
    await Promise.all([
      supabase
        .from("favpolls")
        .select(
          `
          id,
          opening_line,
          description,
          closes_at,
          occasion_type,
          total_raised,
          subject,
          cause_label,
          protagonist:protagonists ( name ),
          charities:favpoll_charities (
            charity:charities ( id, name, logo_url, registered_number )
          ),
          favpoll_polls (
            id,
            topic_id,
            topics (
              title,
              is_finite,
              favourites ( id, label )
            ),
            favpoll_poll_favourites (
              favourites ( id, label )
            )
          )
        `
        )
        .eq("is_private", false)
        .eq("is_listed", true)
        .is("closed_at", null)
        .gt("closes_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(6),

      // Top favourites for the record section
      supabase
        .from("favourites")
        .select("id, label, all_time_pledged, all_time_count, topics(title)")
        .gt("all_time_pledged", 0)
        .order("all_time_pledged", { ascending: false })
        .limit(6),

      // A small set of active charities for Section 5
      supabase
        .from("charities")
        .select("id, name")
        .eq("is_active", true)
        .limit(3),
    ])

  type RawFavourite = { id: string; label: string }
  type RawEpf = { favourites: RawFavourite }
  type RawPoll = {
    id: string
    topic_id: string | null
    topics: {
      title: string
      is_finite: boolean
      favourites: RawFavourite[]
    } | null
    favpoll_poll_favourites: RawEpf[]
  }
  type RawFavpoll = {
    id: string
    opening_line: string
    description: string | null
    closes_at: string
    occasion_type: string | null
    total_raised: number
    subject: string | null
    cause_label: string | null
    protagonist: { name: string }
    charities: { charity: import("@favpoll/types").Charity }[]
    favpoll_polls: RawPoll | null
  }

  const normalised = ((favpolls ?? []) as unknown as RawFavpoll[]).map((ev) => {
    const rawPoll = ev.favpoll_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: { title: string; favourites: RawFavourite[] } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const favourites = isFinite
        ? (rawPoll.topics?.favourites ?? [])
        : (rawPoll.favpoll_poll_favourites ?? [])
            .map((epf) => epf.favourites)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? { title: rawPoll.topics.title, favourites }
          : null,
      }
    }
    return { ...ev, poll }
  })

  // Record section: only shown when the total pledged meets the threshold
  type TopFavourite = {
    id: string
    label: string
    all_time_pledged: number
    all_time_count: number
    topics: { title: string } | null
  }
  const recordItems = (topFavourites ?? []) as unknown as TopFavourite[]
  const recordTotal = recordItems.reduce(
    (sum, f) => sum + f.all_time_pledged,
    0
  )
  const showRecord =
    recordTotal >= RECORD_THRESHOLD_GBP && recordItems.length >= 3
  const recordMax = recordItems[0]?.all_time_pledged ?? 1

  const data = {
    favpolls: normalised,
    recordItems,
    showRecord,
    recordMax,
    charities: (charities ?? []) as { id: string; name: string }[],
  }

  const { variant: rawVariant } = await searchParams
  const variant =
    process.env.NODE_ENV !== "production" &&
    rawVariant &&
    (PROTOTYPE_VARIANTS as readonly string[]).includes(rawVariant)
      ? rawVariant
      : "current"

  return (
    <>
      {variant === "current" && <VariantCurrent {...data} />}
      {variant === "stage" && <VariantStage {...data} />}
      {variant === "editorial" && <VariantEditorial {...data} />}
      {variant === "split" && <VariantSplit {...data} />}
      <PrototypeSwitcher variants={[...PROTOTYPE_VARIANTS]} current={variant} />
    </>
  )
}
