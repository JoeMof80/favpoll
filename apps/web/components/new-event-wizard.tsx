"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Award, Gift, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"
import { TopicItemsDialog } from "@/components/event-flow/topic-items-dialog"
import { shortTopicLabel } from "@/lib/registers"
import { getWizardCopy, type WizardStep } from "@/lib/wizard-copy"
import { cn } from "@/lib/utils"
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

const STEPS: WizardStep[] = ["honour", "charity", "love"]

const STEP_LABELS: Record<WizardStep, string> = {
  honour: "Honour",
  charity: "Charity",
  love: "Love",
}

const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  honour: Award,
  charity: Gift,
  love: Heart,
}

type WizardData = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}

type Props = {
  data: WizardData
}

export function NewEventWizard({ data }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>("honour")
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [grouping, setGrouping] = useState<EventGrouping>("individual")
  const [subject, setSubject] = useState<EventSubject>("someone")
  const [causeLabel, setCauseLabel] = useState("")
  const [topics, setTopics] = useState<EventFormValues["topics"]>([])
  const [charityIds, setCharityIds] = useState<string[]>([])
  const [loveOpen, setLoveOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)

  const stepIndex = STEPS.indexOf(step)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const copy = getWizardCopy(subject)

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
      ? !category || (subject === "cause" && !causeLabel.trim())
      : step === "charity"
        ? charityIds.length === 0
        : topics.length === 0 ||
          (topics[0]?.isCustom === true &&
            customItemCount !== null &&
            customItemCount < 2)

  const selectedCharities = data.charities.filter((c) =>
    charityIds.includes(c.id)
  )

  function handleNext() {
    if (step === "honour") setStep("charity")
    else if (step === "charity") setStep("love")
  }

  function handleBack() {
    if (step === "love") setStep("charity")
    else if (step === "charity") setStep("honour")
  }

  function handleFinish() {
    const topic = topics[0]
    const params = new URLSearchParams({
      category: category ?? "",
      grouping,
      subject,
      charityIds: charityIds.join(","),
    })
    if (subject === "cause" && causeLabel.trim()) {
      params.set("causeLabel", causeLabel.trim())
    }
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
    <main>
      {/* Full-page two-column layout: triad rail left (md+), step content right */}
      <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
        {/* Left: persistent triad — desktop only, full-height tinted rail */}
        {/* Added 'h-full' to ensure the inner container can stretch and distribute space */}
        <div className="hidden h-full flex-col gap-10 bg-primary/10 p-6 md:flex">
          {/* CHANGED: 'content-around' to 'justify-around', added 'flex-1' to fill the vertical space */}
          <div className="flex flex-1 flex-col justify-around gap-8">
            {STEPS.map((s) => {
              const Icon = STEP_ICONS[s]
              const isActive = s === step
              const isPast = STEPS.indexOf(s) < stepIndex
              return (
                <div
                  key={s}
                  className={cn(
                    "space-y-1.5 transition-opacity",
                    isActive
                      ? "opacity-100"
                      : isPast
                        ? "opacity-60"
                        : "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-6 w-6 shrink-0",
                        isActive ? "text-[#534AB7]" : "text-muted-foreground"
                      )}
                    />
                    <p
                      className={cn(
                        "text-lg font-medium tracking-widest uppercase",
                        isActive ? "text-[#534AB7]" : "text-muted-foreground"
                      )}
                    >
                      {STEP_LABELS[s]}
                    </p>
                  </div>
                  <p className="pl-8.5 text-sm leading-relaxed text-muted-foreground">
                    {copy.rail[s]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: step content + navigation, centered column, top-aligned */}
        <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
          <div className="mx-auto w-full max-w-2xl">
            {/* Step dots — mobile only (compact progress strip) */}
            {/* Progress strip — mobile only (labelled segments) */}
            <ol
              role="list"
              aria-label="Wizard steps"
              className="mb-10 flex gap-2 md:hidden"
            >
              {STEPS.map((s, i) => {
                const isActive = s === step
                const isPast = STEPS.indexOf(s) < stepIndex
                return (
                  <li
                    key={s}
                    role="listitem"
                    aria-label={`Step ${i + 1} of ${STEPS.length}: ${STEP_LABELS[s]}`}
                    aria-current={isActive ? "step" : undefined}
                    className="flex flex-1 flex-col gap-1.5"
                  >
                    <span
                      className={cn(
                        "h-1 rounded-full transition-colors",
                        isActive || isPast ? "bg-[#534AB7]" : "bg-muted"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-medium tracking-widest uppercase transition-colors",
                        isActive ? "text-[#534AB7]" : "text-muted-foreground"
                      )}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </li>
                )
              })}
            </ol>

            {/* Step content */}
            {step === "honour" && (
              <HonourStep
                value={{ category, grouping, subject, causeLabel }}
                onChange={({
                  category: cat,
                  grouping: grp,
                  subject: sub,
                  causeLabel: cl,
                }) => {
                  setCategory(cat)
                  setGrouping(grp)
                  setSubject(sub)
                  setCauseLabel(cl)
                }}
              />
            )}

            {step === "charity" && (
              <div className="flex flex-col gap-3 py-6">
                <SectionLabel title="Charity" size="lg" />
                <p className="text-sm text-muted-foreground">
                  {copy.charityGuidance}
                </p>
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
                    className="shrink-0"
                    onClick={() => setCharityOpen(true)}
                  >
                    Choose a charity
                  </Button>
                )}
              </div>
            )}

            {step === "love" && (
              <div className="flex flex-col">
                {/* Topic trigger */}
                <div className="flex flex-col gap-3 py-6">
                  <SectionLabel title="Topic" size="lg" />
                  <p className="text-sm text-muted-foreground">
                    {copy.loveGuidance}
                  </p>
                  {topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      <Chip
                        size="lg"
                        selected
                        onClick={() => setLoveOpen(true)}
                      >
                        {shortTopicLabel(topics[0].title)}
                      </Chip>
                    </div>
                  ) : (
                    <Button
                      className="shrink-0"
                      variant="secondary"
                      onClick={() => setLoveOpen(true)}
                    >
                      Choose a topic
                    </Button>
                  )}
                </div>

                {/* Items summary + trigger */}
                {showItemsSection && (
                  <div className="flex flex-col gap-3 border-t border-border py-6">
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
                      {!topics[0]?.isCustom &&
                        sortedExistingItems.length > 4 && (
                          <Chip
                            size="lg"
                            onClick={() => setItemsDialogOpen(true)}
                          >
                            +{sortedExistingItems.length - 4} more
                          </Chip>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-end gap-2 border-t border-border pt-2">
              {!isFirst ? (
                <Button variant="ghost" size="lg" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {isLast ? (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={nextDisabled}
                  onClick={handleFinish}
                >
                  Set up my event
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  disabled={nextDisabled}
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
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
            variant="secondary"
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
