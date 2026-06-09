"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { shortTopicLabel, registerForOccasionType } from "@/lib/registers"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
}

export function FormPanel({ charities, topics, categories }: Props) {
  const form = useFormContext<EventFormValues>()
  const occasionType = form.watch("occasionType") ?? ""
  const isPlural = form.watch("isPlural") ?? false
  const selectedTopics = form.watch("topics") ?? []
  const selectedCharities = form.watch("charities") ?? []

  const [honourOpen, setHonourOpen] = useState(false)
  const [loveOpen, setLoveOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)

  const topicLabel = selectedTopics[0]
    ? shortTopicLabel(selectedTopics[0].title)
    : null
  const charityNames = charities
    .filter((c) => selectedCharities.includes(c.id))
    .map((c) => c.name)

  const charityCount = selectedCharities.length
  const charityDescription =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  return (
    <div className="space-y-5 p-5">
      {/* Editable summary */}
      <div className="space-y-1.5">
        <SectionEyebrow variant="brand">Your event</SectionEyebrow>
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={!!occasionType}
            size="md"
            onClick={() => setHonourOpen(true)}
          >
            {occasionType || "Occasion…"}
          </Chip>
          <Chip
            selected={!!topicLabel}
            size="md"
            onClick={() => setLoveOpen(true)}
          >
            {topicLabel || "Topic…"}
          </Chip>
          {charityNames.length > 0 ? (
            charityNames.map((name) => (
              <Chip
                key={name}
                selected
                size="md"
                onClick={() => setCharityOpen(true)}
              >
                {name}
              </Chip>
            ))
          ) : (
            <Chip size="md" onClick={() => setCharityOpen(true)}>
              Charity…
            </Chip>
          )}
        </div>
        {topicLabel && (
          <p className="text-xs text-muted-foreground">
            {selectedTopics[0]?.isCustom
              ? "New topic — add items after publishing."
              : "You can add items after publishing."}
          </p>
        )}
        {charityNames.length > 1 && (
          <p className="text-xs text-muted-foreground">
            {charityNames.length} charities — proceeds split equally.
          </p>
        )}
      </div>

      {/* Honour sheet */}
      <ResponsiveOverlay
        open={honourOpen}
        onOpenChange={setHonourOpen}
        title="Occasion"
        description="What is this event for?"
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setHonourOpen(false)}
          >
            Done
          </Button>
        }
      >
        <HonourStep
          value={{ occasionType, isPlural }}
          onChange={({ occasionType: oType, isPlural: iP }) => {
            const derived = registerForOccasionType(oType || null)
            form.setValue("occasionType", oType, { shouldValidate: true })
            form.setValue("register", derived)
            form.setValue("isPlural", iP)
            form.setValue("openingLine", "")
          }}
        />
      </ResponsiveOverlay>

      {/* Love sheet */}
      <ResponsiveOverlay
        open={loveOpen}
        onOpenChange={setLoveOpen}
        title="favpoll topic"
        description="Choose what everyone votes on."
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setLoveOpen(false)}
          >
            Done
          </Button>
        }
      >
        <LoveStep
          topics={topics}
          categories={categories}
          value={selectedTopics}
          onChange={(v) => form.setValue("topics", v, { shouldValidate: true })}
        />
      </ResponsiveOverlay>

      {/* Charity sheet */}
      <ResponsiveOverlay
        open={charityOpen}
        onOpenChange={setCharityOpen}
        title="Charity"
        description={charityDescription}
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setCharityOpen(false)}
          >
            Done
          </Button>
        }
      >
        <CharityStep
          charities={charities}
          value={selectedCharities}
          onChange={(v) =>
            form.setValue("charities", v, { shouldValidate: true })
          }
        />
      </ResponsiveOverlay>
    </div>
  )
}
