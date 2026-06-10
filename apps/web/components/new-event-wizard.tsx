"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Sparkles, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"
import { cn } from "@/lib/utils"
import type {
  Category,
  Charity,
  EventCategory,
  EventGrouping,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type WizardData = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}
type Step = "honour" | "love" | "charity"

const STEPS: Step[] = ["honour", "love", "charity"]

type StepMeta = {
  icon: React.ReactNode
  prompt: (cat: EventCategory | null) => string
}

const STEP_META: Record<Step, StepMeta> = {
  honour: {
    icon: <Heart className="h-8 w-8 text-muted-foreground/40" />,
    prompt: (cat) =>
      cat === "memorial"
        ? "Who would you like to remember?"
        : cat === "fundraiser"
          ? "What cause are you supporting?"
          : "Who are you celebrating?",
  },
  love: {
    icon: <Sparkles className="h-8 w-8 text-muted-foreground/40" />,
    prompt: () =>
      "Choose what everyone votes on — their favourite colour, film, dish, and more.",
  },
  charity: {
    icon: <HandHeart className="h-8 w-8 text-muted-foreground/40" />,
    prompt: () => "All pledges go to the charity you choose.",
  },
}

const STEP_TITLES: Record<Step, string> = {
  honour: "Choose the occasion",
  love: "Choose a favpoll",
  charity: "Choose a charity",
}

type Props = {
  data: WizardData
}

export function NewEventWizard({ data }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("honour")
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [grouping, setGrouping] = useState<EventGrouping>("individual")
  const [topics, setTopics] = useState<EventFormValues["topics"]>([])
  const [charityIds, setCharityIds] = useState<string[]>([])

  const stepIndex = STEPS.indexOf(step)
  const meta = STEP_META[step]

  const nextDisabled =
    step === "honour"
      ? !category
      : step === "love"
        ? topics.length === 0
        : charityIds.length === 0

  function handleFinish() {
    const topic = topics[0]
    const params = new URLSearchParams({
      category: category ?? "",
      grouping,
      charityIds: charityIds.join(","),
    })
    if (topic) {
      if (topic.isCustom) {
        params.set("topicIsCustom", "true")
        params.set("topicTitle", topic.title)
      } else {
        params.set("topicId", topic.topicId)
        params.set("topicTitle", topic.title)
      }
    }
    router.push(`/events/new/details?${params}`)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Step header */}
      <div className="mb-5">
        <p className="text-xs font-medium text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <h1 className="mt-0.5 text-xl font-medium">{STEP_TITLES[step]}</h1>
      </div>

      {/* Step dots */}
      <div
        className="mb-6 flex gap-1.5"
        role="list"
        aria-label="Wizard progress"
      >
        {STEPS.map((s, i) => (
          <div
            key={s}
            role="listitem"
            aria-label={`Step ${i + 1} of ${STEPS.length}`}
            aria-current={s === step ? "step" : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all",
              s === step
                ? "w-6 bg-primary"
                : i < stepIndex
                  ? "w-3 bg-primary/40"
                  : "w-3 bg-border"
            )}
          />
        ))}
      </div>

      {/* Two-column card */}
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm md:flex">
        {/* Left: icon + prompt — desktop only */}
        <div className="hidden w-56 shrink-0 flex-col items-center justify-center gap-4 border-r border-border px-6 py-8 md:flex">
          {meta.icon}
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {meta.prompt(category)}
          </p>
        </div>

        {/* Right: step content */}
        <div className="min-h-64 flex-1 overflow-y-auto">
          {step === "honour" ? (
            <HonourStep
              value={{ category, grouping }}
              onChange={({ category: cat, grouping: grp }) => {
                setCategory(cat)
                setGrouping(grp)
              }}
            />
          ) : step === "love" ? (
            <LoveStep
              topics={data.topics}
              categories={data.categories}
              value={topics}
              onChange={setTopics}
            />
          ) : (
            <CharityStep
              charities={data.charities}
              value={charityIds}
              onChange={setCharityIds}
            />
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-4 flex gap-2">
        {stepIndex > 0 && (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            onClick={() => setStep(STEPS[stepIndex - 1])}
          >
            Back
          </Button>
        )}
        {step !== "charity" ? (
          <Button
            type="button"
            className="flex-1"
            disabled={nextDisabled}
            onClick={() => setStep(STEPS[stepIndex + 1])}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            disabled={nextDisabled}
            onClick={handleFinish}
          >
            Set up my event
          </Button>
        )}
      </div>
    </main>
  )
}
