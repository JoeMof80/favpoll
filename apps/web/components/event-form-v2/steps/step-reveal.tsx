"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { FieldDescription } from "@/components/ui/field"
import { resolvePlaceholders } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "../schema"
import { CounterWhenTyping } from "../step-section"
import { TEXTAREA_SIZE, type PickerSize } from "../constants"

type Props = {
  topics: TopicWithMeta[]
  onRevealFocus: () => void
  onRevealBlur: () => void
  size?: PickerSize
}

export function StepReveal({
  topics,
  onRevealFocus,
  onRevealBlur,
  size = "md",
}: Props) {
  const form = useFormContext<EventFormValues>()
  const register = form.watch("register") ?? ""
  const occasionType = (form.watch("occasionType") ?? "") || null
  const selectedTopics = form.watch("topics")
  const revealValue = form.watch("reveal") ?? ""
  const revealRemaining = 280 - revealValue.length

  // Clear reveal when topic is cleared
  useEffect(() => {
    if (selectedTopics?.length === 0) {
      form.setValue("reveal", "")
    }
  }, [selectedTopics?.length, form])

  const basePlaceholders = register
    ? resolvePlaceholders(register, occasionType)
    : null
  const firstSelectedTopicId = selectedTopics?.[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)
  const topicTitle = selectedTopics?.[0]?.title ?? ""
  const name = form.watch("name")
  const firstName = (name || (basePlaceholders?.name ?? "")).split(" ")[0]
  // Topic placeholders keyed by lowercase occasion_type for compat with existing data
  const topicKey = occasionType?.toLowerCase()
  const topicOccasionReveal =
    topicKey && firstTopicMeta?.placeholders?.[topicKey]?.reveal
  const revealPlaceholder =
    topicTitle && register && topicOccasionReveal
      ? topicOccasionReveal.replace("{name}", firstName)
      : topicTitle
        ? `Share their favourite ${topicTitle.toLowerCase()}…`
        : "Share something they loved…"

  return (
    <FormField
      control={form.control}
      name="reveal"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs text-muted-foreground">
            The reveal
          </FormLabel>
          <FormControl>
            <Textarea
              className={cn(
                TEXTAREA_SIZE[size],
                "bg-background placeholder:text-muted-foreground/50"
              )}
              placeholder={revealPlaceholder}
              rows={5}
              maxLength={280}
              {...field}
              value={field.value ?? ""}
              onFocus={onRevealFocus}
              onBlur={() => {
                field.onBlur()
                onRevealBlur()
              }}
            />
          </FormControl>
          <FormMessage />
          <FieldDescription size={size} className="mb-2">
            <CounterWhenTyping
              remaining={revealRemaining}
              description="Shown to guests after they've pledged."
              warning={56}
              critical={14}
            />
          </FieldDescription>
        </FormItem>
      )}
    />
  )
}
