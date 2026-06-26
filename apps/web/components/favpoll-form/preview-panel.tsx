"use client"

import { useWatch, useFormContext } from "react-hook-form"
import { deriveRegister } from "@/lib/registers"
import { CharityBanner } from "@/components/charity-banner"
import { Button } from "@/components/ui/button"
import { EditableHero } from "./editable-hero"
import { EditablePollArea } from "./editable-poll-area"
import { EditableCountdown } from "./editable-countdown"
import type { Charity, TopicWithMeta } from "@favpoll/types"
import type { FavpollFormValues } from "./schema"

// Shown in the sidebar before any charities are selected
const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  isGenerating?: boolean
  onRegenerate?: () => void
  /** ISO string; when provided shows a live countdown with an edit affordance (edit mode) */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function PreviewPanel({
  charities,
  topics,
  isGenerating,
  onRegenerate,
  closesAt,
  onClosesAtChange,
}: Props) {
  const form = useFormContext<FavpollFormValues>()
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
            isGenerating={isGenerating}
            onRegenerate={onRegenerate}
            topicRevealPlaceholder={topicRevealPlaceholder}
          />
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-14 z-10 hidden space-y-4 self-start bg-background md:block md:pt-16">
          <EditableCountdown
            closesAt={closesAt}
            onClosesAtChange={onClosesAtChange}
          />
          <CharityBanner charities={displayCharities} totalRaised={0} />
          <div className="pointer-events-none opacity-40">
            <div className="rounded-lg border border-border bg-background px-5 py-4">
              <p className="mt-1 text-sm text-muted-foreground">
                <b>£0.00</b> available for guests who need help to pledge.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 flex w-full"
              >
                Add to the shared fund
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
