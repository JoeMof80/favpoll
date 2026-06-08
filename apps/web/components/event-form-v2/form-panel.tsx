"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Chip } from "@/components/ui/chip"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { cn } from "@/lib/utils"
import { shortTopicLabel } from "@/lib/registers"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { OccasionOverlay, REGISTER_CHIP_LABELS } from "./occasion-overlay"
import { TopicPickerField } from "./topic-picker-field"
import { CharityField } from "./charity-field"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
} from "./constants"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}

export function FormPanel({ charities, topics, categories }: Props) {
  const form = useFormContext<EventFormValues>()
  const register = form.watch("register") ?? ""
  const occasionType = form.watch("occasionType") ?? ""
  const isPlural = form.watch("isPlural") ?? false
  const selectedTopics = form.watch("topics") ?? []
  const selectedCharities = form.watch("charities") ?? []

  const [occasionOpen, setOccasionOpen] = useState(false)

  const registerLabel = register
    ? (REGISTER_CHIP_LABELS[register] ?? null)
    : null
  const topicLabel = selectedTopics[0]
    ? shortTopicLabel(selectedTopics[0].title)
    : null
  const selectedCharityNames = charities
    .filter((c) => selectedCharities.includes(c.id))
    .map((c) => c.name)

  return (
    <div className="space-y-5 p-5">
      {/* Pillar 1 — Occasion */}
      <div className="space-y-1.5">
        <SectionEyebrow variant="brand">Honour</SectionEyebrow>
        <div
          className={cn(
            CHIP_IN_INPUT,
            CHIP_IN_INPUT_SIZE["md"],
            "cursor-pointer"
          )}
          onClick={() => setOccasionOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setOccasionOpen(true)}
          aria-label="Choose occasion"
          aria-haspopup="dialog"
          aria-expanded={occasionOpen}
        >
          {registerLabel ? (
            <Chip
              selected
              size="md"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.reset()
              }}
              aria-label={`Clear ${registerLabel}`}
            >
              {registerLabel}
              {occasionType ? ` · ${occasionType}` : ""}
            </Chip>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 text-muted-foreground/50",
                CHIP_IN_INPUT_TEXT["md"]
              )}
            >
              Choose occasion…
            </span>
          )}
        </div>
        <OccasionOverlay
          register={register}
          occasionType={occasionType}
          isPlural={isPlural}
          onRegisterChange={(reg, oType) => {
            form.setValue("register", reg, { shouldValidate: true })
            form.setValue("occasionType", oType ?? "", { shouldValidate: true })
            form.setValue("openingLine", "")
          }}
          onIsPluralChange={(v) => form.setValue("isPlural", v)}
          onClear={() => form.reset()}
          open={occasionOpen}
          onOpenChange={setOccasionOpen}
        />
      </div>

      {/* Pillar 2 — favpoll (Topic) */}
      <div className="space-y-1.5">
        <SectionEyebrow variant="brand">Love</SectionEyebrow>
        <TopicPickerField
          topics={topics}
          categories={categories}
          value={selectedTopics}
          onChange={(v) => form.setValue("topics", v, { shouldValidate: true })}
        />
        {topicLabel && (
          <p className="text-xs text-muted-foreground">
            {selectedTopics[0]?.isCustom
              ? "New topic — add items after publishing."
              : "You can add items after publishing."}
          </p>
        )}
      </div>

      {/* Pillar 3 — Charity */}
      <div className="space-y-1.5">
        <SectionEyebrow variant="brand">Charity</SectionEyebrow>
        <CharityField
          charities={charities}
          value={selectedCharities}
          onChange={(v) =>
            form.setValue("charities", v, { shouldValidate: true })
          }
        />
        {selectedCharityNames.length > 1 && (
          <p className="text-xs text-muted-foreground">
            {selectedCharityNames.length} charities — proceeds split equally.
          </p>
        )}
      </div>
    </div>
  )
}
