"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Sparkles, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"
import { getWizardData } from "@/app/events/new/wizard-data"
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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewEventWizard({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("honour")
  const [data, setData] = useState<WizardData | null>(null)
  const [category, setCategory] = useState<EventCategory | null>(null)
  const [grouping, setGrouping] = useState<EventGrouping>("individual")
  const [topics, setTopics] = useState<EventFormValues["topics"]>([])
  const [charityIds, setCharityIds] = useState<string[]>([])

  useEffect(() => {
    if (open && !data) {
      getWizardData().then(setData)
    }
  }, [open, data])

  useEffect(() => {
    if (!open) {
      setStep("honour")
      setCategory(null)
      setGrouping("individual")
      setTopics([])
      setCharityIds([])
    }
  }, [open])

  const stepIndex = STEPS.indexOf(step)

  const charityCount = charityIds.length
  const charityDesc =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  const title =
    step === "honour"
      ? "Choose the occasion"
      : step === "love"
        ? "Choose a favpoll"
        : "Choose a charity"

  const description =
    step === "charity"
      ? `Step 3 of 3 — ${charityDesc}`
      : `Step ${stepIndex + 1} of 3`

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
    onOpenChange(false)
    router.push(`/events/new?${params}`)
  }

  const meta = STEP_META[step]

  const footer = (
    <div className="flex gap-2">
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
  )

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
    >
      {!data ? (
        <div className="flex min-h-[22rem] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[9rem_1fr] md:gap-6">
          {/* Left column: icon + tense-aware prompt (desktop only) */}
          <div className="hidden md:flex md:flex-col md:items-center md:gap-3 md:pt-2">
            {meta.icon}
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {meta.prompt(category)}
            </p>
          </div>

          {/* Right column: step content */}
          <div className="min-h-[22rem]">
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
      )}
    </ResponsiveOverlay>
  )
}
