"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"
import { getWizardData } from "@/app/events/new/wizard-data"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type WizardData = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}
type Step = "honour" | "love" | "charity"

const STEPS: Step[] = ["honour", "love", "charity"]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewEventWizard({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("honour")
  const [data, setData] = useState<WizardData | null>(null)
  const [occasionType, setOccasionType] = useState("")
  const [isPlural, setIsPlural] = useState(false)
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
      setOccasionType("")
      setIsPlural(false)
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
      ? !occasionType
      : step === "love"
        ? topics.length === 0
        : charityIds.length === 0

  function handleFinish() {
    const topic = topics[0]
    const params = new URLSearchParams({
      occasionType,
      isPlural: String(isPlural),
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
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      ) : step === "honour" ? (
        <HonourStep
          value={{ occasionType, isPlural }}
          onChange={({ occasionType: oType, isPlural: iP }) => {
            setOccasionType(oType)
            setIsPlural(iP)
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
    </ResponsiveOverlay>
  )
}
