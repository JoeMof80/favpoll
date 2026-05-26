"use client"

import { useWatch, useFormContext } from "react-hook-form"
import {
  OCCASION_LABELS,
  OCCASION_PLACEHOLDERS,
  DATE_LABEL_PLACEHOLDERS,
  DEFAULT_PLACEHOLDERS,
  TOPIC_REVEAL_PLACEHOLDERS,
} from "@/lib/occasions"
import { EventHero } from "@/components/event-hero"
import { PollHeading } from "@/components/poll-heading"
import { PledgePanel } from "@/components/pledge-panel"
import { PollResults } from "@/components/favpoll-card/poll-results"
import type { PollResultItem } from "@/components/favpoll-card/types"
import { Countdown } from "@/components/countdown"
import { CharityBanner } from "@/components/charity-banner"
import { InfoIcon } from "lucide-react"
import type {
  Charity,
  TopicWithMeta,
  TopicItem,
  Event,
  Protagonist,
} from "@favpoll/types"
import type { EventFormValues } from "./schema"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  showReveal: boolean
  previewSuffix: boolean
  previewPhoto: boolean
}

// Static placeholder poll options when no topic is selected yet
const PLACEHOLDER_ITEMS: TopicItem[] = [
  "Option one",
  "Option two",
  "Option three",
  "Option four",
  "Option five",
  "Option six",
].map(
  (label, i) =>
    ({
      id: `placeholder-${i}`,
      label,
      topic_id: "placeholder",
      all_time_pledged: 0,
      all_time_count: 0,
      is_canonical: false,
      is_active: true,
      created_at: "",
    }) as unknown as TopicItem
)

// Placeholder charities shown before the user selects any
const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

function PledgeCardPreview() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-4">
      {/* Amount input — mirrors AmountInput */}
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Your pledge
          </p>
          <InfoIcon className="h-3 w-3 text-muted-foreground/40" aria-hidden />
        </div>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xl text-muted-foreground">
            £
          </span>
          <div className="w-full rounded-md border border-input bg-background py-3 pr-3 pl-8 text-2xl font-medium text-foreground/25">
            0
          </div>
        </div>
        {/* Presets — mirrors AmountPresets ghost+bg-muted style */}
        <div className="mt-2 flex gap-1.5">
          {[5, 10, 20, 50].map((n) => (
            <div
              key={n}
              className="flex-1 rounded-md bg-muted py-1.5 text-center text-sm text-muted-foreground"
            >
              £{n}
            </div>
          ))}
        </div>
      </div>

      {/* Pot top-up — mirrors the rounded bg-muted p-3 block */}
      <div className="rounded bg-muted p-3">
        <p className="text-xs text-muted-foreground">Add to the shared fund</p>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            £
          </span>
          <div className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-7 text-sm text-foreground/25">
            0
          </div>
        </div>
      </div>

      {/* Confirm + fund toggle */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground opacity-60">
          Pledge favourites
        </div>
        <div className="my-1 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-sm text-muted-foreground">Use the shared fund</p>
      </div>
    </div>
  )
}

function CountdownPlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <p className="mb-2 text-xs text-muted-foreground">Poll closes in</p>
      <div className="flex items-end gap-3">
        {(["days", "hrs", "min", "sec"] as const).map((label) => (
          <div key={label} className="text-center">
            <p className="text-2xl leading-none font-medium text-foreground/25 tabular-nums">
              00
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PreviewPanel({
  charities,
  topics,
  showReveal,
  previewSuffix,
  previewPhoto,
}: Props) {
  const form = useFormContext<EventFormValues>()
  const values = useWatch({ control: form.control })

  const occasion = values.occasion ?? ""
  const name = values.name ?? ""
  const suffix = values.suffix ?? ""
  const about = values.about ?? ""
  const reveal = values.reveal ?? ""
  const photo = values.photo as File | undefined
  const photoUrl = values.photoUrl
  const closesAt = values.closesAt
  const charityIds = values.charities ?? []
  const selectedTopics = values.topics ?? []

  if (!occasion)
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Preview your event here. Select an occasion to begin.
        </p>
      </div>
    )

  // Resolve occasion-specific placeholders
  const placeholders = OCCASION_PLACEHOLDERS[occasion] ?? DEFAULT_PLACEHOLDERS
  const datePlaceholder = DATE_LABEL_PLACEHOLDERS[occasion] ?? ""
  const firstSelectedTopicId = selectedTopics[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)
  const topicAbout =
    firstTopicMeta?.placeholders?.[occasion]?.about ??
    firstTopicMeta?.placeholders?.["default"]?.about
  const aboutPlaceholder = topicAbout ?? placeholders.about
  const occasionLabel = occasion
    ? (OCCASION_LABELS[occasion] ?? "A tribute to")
    : "A tribute to"

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  // Always build a fully formed fake event — real values replace placeholders
  const fakeProtagonist = {
    id: "preview",
    name: name || placeholders.name,
    about: about || aboutPlaceholder,
    photo_url: previewPhoto ? resolvedPhotoUrl : null,
    date_label: previewSuffix ? suffix || datePlaceholder || null : null,
  } as unknown as Protagonist

  const fakeEvent = {
    id: "preview",
    occasion: occasion || "tribute",
    occasion_label: occasionLabel,
    closes_at:
      closesAt instanceof Date
        ? closesAt.toISOString()
        : new Date().toISOString(),
    closed_at: null,
  } as unknown as Event

  const firstTopic = selectedTopics[0]

  const topicItems: TopicItem[] =
    firstTopic && (firstTopic.items ?? []).length > 0
      ? ((firstTopic.items ?? []) as { id: string; label: string }[]).map(
          (item) =>
            ({
              id: item.id,
              label: item.label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: false,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        )
      : PLACEHOLDER_ITEMS

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  const protagonistFirstName = (name || placeholders.name).split(" ")[0]
  const topicTitle = firstTopic?.title ?? "Colour"
  const topicRevealPlaceholder = topicTitle
    ? (
        TOPIC_REVEAL_PLACEHOLDERS[topicTitle]?.reveal ?? placeholders.reveal
      ).replace("{name}", protagonistFirstName)
    : placeholders.reveal
  // Show reveal when the reveal field is focused; otherwise hide it
  const revealValue = showReveal ? reveal || topicRevealPlaceholder : null

  const pollResults: PollResultItem[] = topicItems.map((item) => ({
    label: item.label,
    amount: "£0",
    widthPercent: 0,
  }))

  return (
    <div className="mx-auto max-w-330 px-6 pt-8 pb-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — hero + poll */}
        <div>
          <EventHero
            event={fakeEvent}
            protagonist={fakeProtagonist}
            hideAvatar={!previewPhoto}
          />

          <div className="space-y-4">
            <PollHeading
              pollId="preview"
              topicTitle={topicTitle}
              reveal={revealValue}
              protagonistFirstName={protagonistFirstName}
            />
            {showReveal ? (
              <PollResults results={pollResults} />
            ) : (
              <PledgePanel
                items={topicItems}
                totalAmount="0"
                onSelectionsChange={() => {}}
              />
            )}
          </div>
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-20 space-y-4 self-start">
          {closesAt instanceof Date ? (
            <Countdown closesAt={closesAt.toISOString()} />
          ) : (
            <CountdownPlaceholder />
          )}
          <CharityBanner charities={displayCharities} totalRaised={0} />
          <PledgeCardPreview />
        </div>
      </div>
    </div>
  )
}
