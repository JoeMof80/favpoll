"use client"

import { useWatch, useFormContext } from "react-hook-form"
import { deriveRegister } from "@/lib/registers"
import { CharityBanner } from "@/components/charity-banner"
import { PledgeCard } from "@/components/pledge-card"
import { EditableHero } from "./editable-hero"
import { EditablePollArea } from "./editable-poll-area"
import { EditableCountdown } from "./editable-countdown"
import type { Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"

// Shown in the sidebar before any charities are selected
const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  showReveal: boolean
  onToggleReveal: () => void
  isGenerating?: boolean
  onRegenerate?: () => void
  /** ISO string; when provided shows a live countdown with an edit affordance (edit mode) */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function PreviewPanel({
  charities,
  topics,
  showReveal,
  onToggleReveal,
  isGenerating,
  onRegenerate,
  closesAt,
  onClosesAtChange,
}: Props) {
  const form = useFormContext<EventFormValues>()
  const category = useWatch({ control: form.control, name: "category" })
  const charityIds =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const selectedTopics =
    useWatch({ control: form.control, name: "topics" }) ?? []
  const grouping =
    useWatch({ control: form.control, name: "grouping" }) ?? "individual"

  // Don't render until an occasion is chosen — nothing meaningful to preview
  if (!category) return null

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  const firstTopicMeta = topics.find((t) => t.id === selectedTopics[0]?.topicId)
  const effReg = deriveRegister(category ?? null, grouping)
  const aboutPlaceholder = firstTopicMeta?.placeholders?.[effReg]?.about ?? ""
  const topicRevealPlaceholder =
    firstTopicMeta?.placeholders?.[effReg]?.reveal ?? ""

  return (
    <div className="mx-auto min-h-full max-w-5xl bg-background p-16 pb-52 drop-shadow-lg md:pb-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — hero + poll */}
        <div>
          <EditableHero
            isGenerating={isGenerating}
            onRegenerate={onRegenerate}
            aboutPlaceholder={aboutPlaceholder}
          />
          <EditablePollArea
            topics={topics}
            showReveal={showReveal}
            onToggleReveal={onToggleReveal}
            isGenerating={isGenerating}
            onRegenerate={onRegenerate}
            topicRevealPlaceholder={topicRevealPlaceholder}
          />
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-20 space-y-4 self-start">
          <EditableCountdown
            closesAt={closesAt}
            onClosesAtChange={onClosesAtChange}
          />
          <CharityBanner charities={displayCharities} totalRaised={0} />
          <div className="pointer-events-none opacity-40">
            <PledgeCard
              prePublish
              pledgeAmount=""
              onPledgeAmountChange={() => {}}
              charityNames={selectedCharities.map((c) => c.name)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
