"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { EditablePollArea } from "./editable-poll-area"
import { eventFormSchema, type EventFormValues } from "./schema"
import type { TopicWithMeta } from "@favpoll/types"

const COLOUR_TOPIC: TopicWithMeta = {
  id: "topic-colour",
  title: "Colour",
  is_finite: true,
  is_active: true,
  description: null,
  placeholders: {
    celebrating_one: {
      about: "Think of them as a human palette…",
      reveal: "Her absolute favourite was always Cobalt Blue.",
      pronouns: "she",
    },
  },
  created_by: null,
  created_at: "",
  favourites: [
    { id: "i1", label: "Red" },
    { id: "i2", label: "Blue" },
    { id: "i3", label: "Green" },
  ] as TopicWithMeta["favourites"],
  category_ids: [],
}

function FormWrapper({
  defaultValues,
  children,
}: {
  defaultValues: Partial<EventFormValues>
  children: React.ReactNode
}) {
  const form = useForm<EventFormValues, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema as never),
    defaultValues: {
      register: "celebrating_one",
      grouping: "individual",
      subject: "someone",
      category: "celebration",
      name: "Margaret",
      causeLabel: "",
      context: "",
      openingLine: "",
      about: "",
      reveal: "",
      charities: ["ch-1"],
      topics: [],
      isListed: true,
      ...defaultValues,
    },
  })
  return <Form {...form}>{children}</Form>
}

function Controlled(
  props: {
    topics: TopicWithMeta[]
    defaultValues: Partial<EventFormValues>
  } & Omit<
    React.ComponentProps<typeof EditablePollArea>,
    "showReveal" | "onToggleReveal"
  >
) {
  const { topics, defaultValues, ...rest } = props
  const [showReveal, setShowReveal] = useState(false)
  return (
    <FormWrapper defaultValues={defaultValues}>
      <EditablePollArea
        topics={topics}
        showReveal={showReveal}
        onToggleReveal={() => setShowReveal((s) => !s)}
        {...rest}
      />
    </FormWrapper>
  )
}

const meta: Meta<typeof EditablePollArea> = {
  title: "EventFormV2/EditablePollArea",
  component: EditablePollArea,
  parameters: { layout: "padded" },
}
export default meta

type Story = StoryObj<typeof EditablePollArea>

/** No topic selected — skeleton placeholder */
export const NoTopicSelected: Story = {
  render: () => (
    <Controlled topics={[COLOUR_TOPIC]} defaultValues={{ topics: [] }} />
  ),
}

/** Topic selected, pre-reveal view (PledgePanel dimmed) */
export const PreReveal: Story = {
  render: () => (
    <Controlled
      topics={[COLOUR_TOPIC]}
      defaultValues={{
        topics: [
          {
            topicId: "topic-colour",
            title: "Colour",
            isCustom: false,
            items: [
              { id: "i1", label: "Red" },
              { id: "i2", label: "Blue" },
              { id: "i3", label: "Green" },
            ],
            customLabels: [],
          },
        ],
      }}
    />
  ),
}

/** Post-reveal view — PollResults shown */
export const PostReveal: Story = {
  render: () => {
    const [showReveal, setShowReveal] = useState(true)
    return (
      <FormWrapper
        defaultValues={{
          category: "celebration",
          topics: [
            {
              topicId: "topic-colour",
              title: "Colour",
              isCustom: false,
              items: [
                { id: "i1", label: "Red" },
                { id: "i2", label: "Blue" },
              ],
              customLabels: [],
            },
          ],
          reveal: "She always said Blue — every single time.",
          charities: ["ch-1"],
        }}
      >
        <EditablePollArea
          topics={[COLOUR_TOPIC]}
          showReveal={showReveal}
          onToggleReveal={() => setShowReveal((s) => !s)}
        />
      </FormWrapper>
    )
  },
}
