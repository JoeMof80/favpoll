"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"
import { TopicItemsDialog } from "@/components/event-flow/topic-items-dialog"
import { shortTopicLabel } from "@/lib/registers"
import type {
  Category,
  Charity,
  EventCategory,
  EventGrouping,
  EventSubject,
  TopicItem,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"
import { SectionLabel } from "./favpoll-card/section-label"

const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

function sortItems(items: TopicItem[]): TopicItem[] {
  return [...items].sort((a, b) => {
    const aOrder = a.display_order ?? Infinity
    const bOrder = b.display_order ?? Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.label.localeCompare(b.label)
  })
}

type Step = "honour" | "love" | "charity"

type WizardData = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}

type Props = {
  data: WizardData
}

const STEPS: Step[] = ["honour", "love", "charity"]

export function NewEventWizard({ data }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("honour")
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [grouping, setGrouping] = useState<EventGrouping>("individual")
  const [subject, setSubject] = useState<EventSubject>("someone")
  const [topics, setTopics] = useState<EventFormValues["topics"]>([])
  const [charityIds, setCharityIds] = useState<string[]>([])
  const [loveOpen, setLoveOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)

  const stepIndex = STEPS.indexOf(step)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const customLabels = topics[0]?.customLabels ?? []
  const customItemCount = topics[0]?.isCustom ? customLabels.length : null
  const selectedTopic =
    topics[0] && !topics[0].isCustom
      ? (data.topics.find((t) => t.id === topics[0].topicId) ?? null)
      : null

  const sortedExistingItems = selectedTopic
    ? sortItems(selectedTopic.topic_items)
    : []
  const dialogExistingItems = sortedExistingItems.map((i) => ({
    id: i.id,
    label: i.label,
  }))

  const showItemsSection =
    topics.length > 0 && (topics[0]?.isCustom || !!selectedTopic)

  function handleAddItem(label: string) {
    const current = topics[0]
    if (!current) return
    const existing = current.customLabels ?? []
    const canonicalLabels = selectedTopic?.topic_items.map((i) => i.label) ?? []
    if (
      [...existing, ...canonicalLabels].some(
        (l) => l.toLowerCase() === label.toLowerCase()
      )
    )
      return
    setTopics([{ ...current, customLabels: [...existing, label] }])
  }

  function handleRemoveItem(label: string) {
    const current = topics[0]
    if (!current) return
    setTopics([
      {
        ...current,
        customLabels: (current.customLabels ?? []).filter((l) => l !== label),
      },
    ])
  }

  const nextDisabled =
    step === "honour"
      ? !category
      : step === "love"
        ? topics.length === 0 ||
          (topics[0]?.isCustom === true &&
            customItemCount !== null &&
            customItemCount < 2)
        : charityIds.length === 0

  const selectedCharities = data.charities.filter((c) =>
    charityIds.includes(c.id)
  )
  const charityCount = charityIds.length

  const leftIcon =
    step === "honour" ? (
      <Heart className="h-8 w-8 text-muted-foreground/40" />
    ) : step === "love" ? (
      <Star className="h-8 w-8 text-muted-foreground/40" />
    ) : (
      <Gift className="h-8 w-8 text-muted-foreground/40" />
    )

  const leftPrompt =
    step === "honour"
      ? subject === "cause"
        ? "What cause are you supporting?"
        : category === "memorial"
          ? "Who would you like to remember?"
          : "Who are you celebrating?"
      : step === "love"
        ? "What are their favourites?"
        : "Where should pledges go?"

  function handleNext() {
    if (step === "honour") setStep("love")
    else if (step === "love") setStep("charity")
  }

  function handleBack() {
    if (step === "charity") setStep("love")
    else if (step === "love") setStep("honour")
  }

  function handleFinish() {
    const topic = topics[0]
    const params = new URLSearchParams({
      category: category ?? "",
      grouping,
      subject,
      charityIds: charityIds.join(","),
    })
    if (topic) {
      if (topic.isCustom || customLabels.length > 0) {
        sessionStorage.setItem(
          DRAFT_ADDITIONS_KEY,
          JSON.stringify({
            topicRef: topic.isCustom
              ? { kind: "new", title: topic.title }
              : { kind: "existing", id: topic.topicId },
            addedItems: customLabels,
          })
        )
        params.set("draftAdditions", "1")
      } else {
        params.set("topicId", topic.topicId)
        params.set("topicTitle", topic.title)
      }
    }
    router.push(`/events/new/details?${params}`)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Step dots */}
      <ol
        role="list"
        aria-label="Wizard steps"
        className="mb-6 flex justify-center gap-2"
      >
        {STEPS.map((s, i) => (
          <li
            key={s}
            role="listitem"
            aria-label={`Step ${i + 1} of ${STEPS.length}`}
            aria-current={s === step ? "step" : undefined}
            className={`h-2 w-2 rounded-full transition-colors ${
              s === step ? "bg-[#534AB7]" : "bg-muted"
            }`}
          />
        ))}
      </ol>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm md:flex">
        {/* Left: icon + prompt — desktop only */}
        <div className="hidden w-56 shrink-0 flex-col items-center justify-center gap-4 border-r border-border px-6 py-8 md:flex">
          {leftIcon}
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {leftPrompt}
          </p>
        </div>

        {/* Step content */}
        <div className="min-h-48 flex-1">
          {step === "honour" && (
            <HonourStep
              value={{ category, grouping, subject }}
              onChange={({ category: cat, grouping: grp, subject: sub }) => {
                setCategory(cat)
                setGrouping(grp)
                setSubject(sub)
              }}
            />
          )}

          {step === "love" && (
            <div className="flex min-h-48 flex-col">
              {/* Topic trigger */}
              <div className="flex flex-col justify-center gap-3 px-5 py-6">
                <SectionLabel title="Topic" size="lg" />
                <p className="text-sm text-muted-foreground">
                  Choose a topic for this event.
                </p>
                {topics.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    <Chip size="lg" selected onClick={() => setLoveOpen(true)}>
                      {shortTopicLabel(topics[0].title)}
                    </Chip>
                  </div>
                ) : (
                  <Button
                    className="shrink-0"
                    onClick={() => setLoveOpen(true)}
                  >
                    Choose a topic
                  </Button>
                )}
              </div>

              {/* Items summary + trigger */}
              {showItemsSection && (
                <div className="flex flex-col gap-3 border-t border-border px-5 py-6">
                  {/* Validation hint for new custom topics */}
                  <SectionLabel title="Favourites" size="lg" />
                  <p className="text-sm text-muted-foreground">
                    View or add favourites
                  </p>
                  {topics[0]?.isCustom && customLabels.length < 2 && (
                    <p className="text-xs text-muted-foreground">
                      {customLabels.length === 0
                        ? "Add at least two options."
                        : "Add at least one more option."}
                    </p>
                  )}
                  <Button
                    className="shrink-0"
                    onClick={() => setItemsDialogOpen(true)}
                  >
                    {topics[0]?.isCustom && customLabels.length < 2
                      ? "Add favourites"
                      : "View or add favourites"}
                  </Button>
                  {/* Chip preview of items */}
                  <div className="flex flex-wrap gap-1.5">
                    {topics[0]?.isCustom
                      ? customLabels.map((label) => (
                          <Chip key={label} size="lg" readOnly>
                            {label}
                          </Chip>
                        ))
                      : sortedExistingItems.slice(0, 5).map((item) => (
                          <Chip key={item.id} size="lg" readOnly>
                            {item.label}
                          </Chip>
                        ))}
                    {!topics[0]?.isCustom &&
                      customLabels.map((label) => (
                        <Chip
                          key={label}
                          size="lg"
                          readOnly
                          className="border-[#534AB7] bg-[#534AB7] text-white"
                        >
                          {label}
                        </Chip>
                      ))}
                    {!topics[0]?.isCustom && sortedExistingItems.length > 4 && (
                      <span className="self-center text-xs text-muted-foreground">
                        +{sortedExistingItems.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "charity" && (
            <div className="flex min-h-48 flex-col justify-center gap-4 px-5 py-6">
              <SectionLabel title="Charity" size="lg" />
              <p className="text-sm text-muted-foreground">
                View or add favourites
              </p>
              <div>
                <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
                  Where pledges go
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {charityCount === 0
                    ? "Choose up to 3 charities — pledges are split equally."
                    : charityCount === 1
                      ? "1 of 3 selected."
                      : `${charityCount} of 3 selected.`}
                </p>
              </div>
              {selectedCharities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCharities.map((c) => (
                    <Chip
                      key={c.id}
                      size="lg"
                      selected
                      onClick={() => setCharityOpen(true)}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCharityOpen(true)}
                >
                  Choose a charity
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        {!isFirst ? (
          <Button variant="ghost" size="lg" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button size="lg" disabled={nextDisabled} onClick={handleFinish}>
            Set up my event
          </Button>
        ) : (
          <Button size="lg" disabled={nextDisabled} onClick={handleNext}>
            Next
          </Button>
        )}
      </div>

      {/* Love sheet */}
      <ResponsiveOverlay
        open={loveOpen}
        onOpenChange={setLoveOpen}
        title="Choose a favpoll"
      >
        <LoveStep
          topics={data.topics}
          categories={data.categories}
          value={topics}
          onChange={(v) => {
            setTopics(v)
            setLoveOpen(false)
          }}
          hideItemsPanel
        />
      </ResponsiveOverlay>

      {/* Charity sheet */}
      <ResponsiveOverlay
        open={charityOpen}
        onOpenChange={setCharityOpen}
        title="Choose a charity"
        footer={
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => setCharityOpen(false)}
          >
            Done
          </Button>
        }
      >
        <CharityStep
          charities={data.charities}
          value={charityIds}
          onChange={setCharityIds}
        />
      </ResponsiveOverlay>

      {/* Items dialog */}
      {topics.length > 0 && (
        <TopicItemsDialog
          open={itemsDialogOpen}
          onOpenChange={setItemsDialogOpen}
          topicTitle="Select Items"
          //topicTitle={topics[0].title}
          existingItems={dialogExistingItems}
          addedItems={customLabels}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
          isNewTopic={topics[0].isCustom ?? false}
        />
      )}
    </main>
  )
}
