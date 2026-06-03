"use client"

import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FieldDescription } from "@/components/ui/field"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "../schema"
import { TopicPickerField } from "../topic-picker-field"
import type { PickerSize } from "../constants"

type Props = {
  topics: TopicWithMeta[]
  categories: Category[]
  size?: PickerSize
}

export function StepTopic({ topics, categories, size = "md" }: Props) {
  const form = useFormContext<EventFormValues>()
  const selectedTopics = form.watch("topics")

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="topics"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              Topic
            </FormLabel>
            <TopicPickerField
              topics={topics}
              categories={categories}
              value={field.value}
              onChange={field.onChange}
              size={size}
            />
            <FormMessage />
            <FieldDescription size={size} className="mb-2">
              Find a topic for guests to vote on or create one of your own.
            </FieldDescription>
          </FormItem>
        )}
      />

      {selectedTopics?.[0] && (
        <p className="text-sm text-muted-foreground">
          {selectedTopics[0].isCustom
            ? "This is a new topic. Add items after publishing — guests won't see any options until you do."
            : "You can add items to this poll after publishing."}
        </p>
      )}
    </div>
  )
}
