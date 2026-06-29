"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { EditablePollArea } from "./editable-poll-area"
import { favpollFormSchema, type FavpollFormValues } from "./schema"

function FormWrapper({
  defaultValues,
  children,
}: {
  defaultValues: Partial<FavpollFormValues>
  children: React.ReactNode
}) {
  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
    resolver: zodResolver(favpollFormSchema as never),
    defaultValues: {
      register: "celebrating_one",
      grouping: "individual",
      subject: "someone",
      category: "celebration",
      name: "Gretchen",
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
    defaultValues: Partial<FavpollFormValues>
  } & React.ComponentProps<typeof EditablePollArea>
) {
  const { defaultValues, ...rest } = props
  return (
    <FormWrapper defaultValues={defaultValues}>
      <EditablePollArea {...rest} />
    </FormWrapper>
  )
}

const meta: Meta<typeof EditablePollArea> = {
  title: "FavpollForm/EditablePollArea",
  component: EditablePollArea,
  parameters: { layout: "padded" },
}
export default meta

type Story = StoryObj<typeof EditablePollArea>

/** No topic selected — skeleton placeholder */
export const NoTopicSelected: Story = {
  render: () => <Controlled defaultValues={{ topics: [] }} />,
}

/** Topic selected, pre-reveal view (PledgePanel dimmed) */
export const PreReveal: Story = {
  render: () => (
    <Controlled
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
  render: () => (
    <Controlled
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
    />
  ),
}
