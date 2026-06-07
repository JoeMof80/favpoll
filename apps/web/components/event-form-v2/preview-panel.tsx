"use client"

import { useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { DATE_LABEL_PLACEHOLDERS } from "@/lib/registers"
import { getEventHeadline } from "@/lib/display"
import { EventHero } from "@/components/event-hero"
import { PollHeading } from "@/components/poll-heading"
import { PledgePanel } from "@/components/pledge-panel"
import { PollResults } from "@/components/favpoll-card/poll-results"
import type { PollResultItem } from "@/components/favpoll-card/types"
import { Countdown } from "@/components/countdown"
import { CharityBanner } from "@/components/charity-banner"
import { PledgeCard } from "@/components/pledge-card"
import type {
  Charity,
  TopicWithMeta,
  TopicItem,
  Event,
  Protagonist,
} from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { toast } from "sonner"
import { OnboardingPanel } from "./onboarding-panel"
import { Button } from "@/components/ui/button"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  showReveal: boolean
  previewSuffix: boolean
  previewPhoto: boolean
  isFirstTime?: boolean
}

// Placeholder charities shown before the user selects any
const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

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
  isFirstTime = false,
}: Props) {
  const [pledgeAmount, setPledgeAmount] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem("favpoll_show_onboarding") === "1"
  )

  function handleHowItWorks() {
    localStorage.setItem("favpoll_show_onboarding", "1")
    setShowOnboarding(true)
  }

  const form = useFormContext<EventFormValues>()
  const values = useWatch({ control: form.control })

  const register = values.register ?? ""
  const occasionType = (values.occasionType ?? "") || null
  const name = values.name ?? ""
  const context = values.context ?? ""
  const openingLine = values.openingLine ?? ""
  const about = values.about ?? ""
  const reveal = values.reveal ?? ""
  const photo = values.photo as File | undefined
  const photoUrl = values.photoUrl
  const closesAt = values.closesAt
  const charityIds = values.charities ?? []
  const selectedTopics = values.topics ?? []

  const firstSelectedTopicId = selectedTopics[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)

  if (!register) {
    if (isFirstTime || showOnboarding) {
      return <OnboardingPanel onHowItWorks={handleHowItWorks} />
    }
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          Select an occasion to begin.
        </p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[13px] text-muted-foreground hover:text-foreground"
          onClick={handleHowItWorks}
        >
          How favpoll works →
        </Button>
      </div>
    )
  }

  const datePlaceholder = occasionType
    ? (DATE_LABEL_PLACEHOLDERS[occasionType] ?? "")
    : ""
  const resolvedOpeningLine =
    openingLine || getEventHeadline({ register, occasionType, name: "" }).prefix

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  // Always build a fully formed fake event — real values replace placeholders
  const fakeProtagonist = {
    id: "preview",
    name: name || "",
    about: about || "",
    photo_url: previewPhoto ? resolvedPhotoUrl : null,
    context: previewSuffix ? context || datePlaceholder || null : null,
  } as unknown as Protagonist

  const fakeEvent = {
    id: "preview",
    register: register || "neutral",
    occasion_type: occasionType,
    opening_line: resolvedOpeningLine,
    closes_at:
      closesAt instanceof Date
        ? closesAt.toISOString()
        : new Date().toISOString(),
    closed_at: null,
  } as unknown as Event

  const firstTopic = selectedTopics[0]
  const firstTopicCustomLabels = firstTopic?.customLabels ?? []

  // Custom topics (not yet in DB) are always infinite
  const isInfinite = firstTopic
    ? firstTopic.isCustom
      ? true
      : !(firstTopicMeta?.is_finite ?? true)
    : false

  const topicItems: TopicItem[] = firstTopic
    ? [
        ...((firstTopic.items ?? []) as { id: string; label: string }[]).map(
          (item) =>
            ({
              id: item.id,
              label: item.label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: true,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
        ...firstTopicCustomLabels.map(
          (label, i) =>
            ({
              id: `custom-preview-${i}`,
              label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: false,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
      ]
    : []

  const pollResults: PollResultItem[] = topicItems.map((item) => ({
    label: item.label,
    amount: "£0",
    widthPercent: 0,
  }))

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  const hasTopicSelected = !!firstTopic
  const protagonistFirstName = name.split(" ")[0] || ""
  const topicTitle = firstTopic?.title ?? "Colour"
  const revealValue = showReveal ? reveal || null : null

  return (
    <div className="mx-auto min-h-full max-w-5xl bg-background p-16 drop-shadow-lg">
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — hero + poll */}
        <div>
          <EventHero
            event={fakeEvent}
            protagonist={fakeProtagonist}
            hideAvatar={!previewPhoto}
          />

          {hasTopicSelected && (
            <div className="space-y-4">
              <PollHeading
                topicTitle={topicTitle}
                reveal={revealValue}
                protagonistFirstName={protagonistFirstName}
              />
              {revealValue ? (
                <PollResults results={pollResults} />
              ) : (
                <PledgePanel
                  items={topicItems}
                  totalAmount={pledgeAmount}
                  onSelectionsChange={() => {}}
                  isInfinite={isInfinite}
                  onAddItem={
                    isInfinite
                      ? async () => {
                          toast.warning(
                            "Items added here won't be saved — add them to your event after publishing.",
                            {
                              style: {
                                background: "#fffbeb",
                                color: "#f59e0b",
                                border: "1px solid #f59e0b",
                              },
                              position: "top-center",
                            }
                          )
                        }
                      : undefined
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-20 space-y-4 self-start">
          {closesAt instanceof Date ? (
            <div className="rounded-lg border border-border bg-card px-5 py-4">
              <Countdown closesAt={closesAt.toISOString()} />
            </div>
          ) : (
            <CountdownPlaceholder />
          )}
          <CharityBanner charities={displayCharities} totalRaised={0} />
          <PledgeCard
            prePublish
            pledgeAmount={pledgeAmount}
            onPledgeAmountChange={setPledgeAmount}
            charityNames={selectedCharities.map((c) => c.name)}
          />
        </div>
      </div>
    </div>
  )
}
