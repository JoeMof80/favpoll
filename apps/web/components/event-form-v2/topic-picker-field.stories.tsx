"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import type { TopicWithMeta, Category } from "@favpoll/types"
import { TopicPickerField } from "./topic-picker-field"
import type { EventFormValues } from "./schema"

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", label: "Nature" },
  { id: "cat-2", label: "Food" },
  { id: "cat-3", label: "Culture" },
] as Category[]

const MOCK_TOPICS: TopicWithMeta[] = [
  {
    id: "t-1",
    title: "Colour",
    is_active: true,
    is_finite: false,
    topic_items: [
      { id: "i-1", label: "Blue", is_canonical: true, topic_id: "t-1" },
      { id: "i-2", label: "Green", is_canonical: true, topic_id: "t-1" },
      { id: "i-3", label: "Red", is_canonical: true, topic_id: "t-1" },
    ],
    category_ids: ["cat-3"],
    placeholders: {},
  },
  {
    id: "t-2",
    title: "Season",
    is_active: true,
    is_finite: true,
    topic_items: [
      { id: "i-4", label: "Spring", is_canonical: true, topic_id: "t-2" },
      { id: "i-5", label: "Summer", is_canonical: true, topic_id: "t-2" },
      { id: "i-6", label: "Autumn", is_canonical: true, topic_id: "t-2" },
      { id: "i-7", label: "Winter", is_canonical: true, topic_id: "t-2" },
    ],
    category_ids: ["cat-1"],
    placeholders: {},
  },
  {
    id: "t-3",
    title: "Ice cream",
    is_active: true,
    is_finite: false,
    topic_items: [
      { id: "i-8", label: "Vanilla", is_canonical: true, topic_id: "t-3" },
      { id: "i-9", label: "Chocolate", is_canonical: true, topic_id: "t-3" },
    ],
    category_ids: ["cat-2"],
    placeholders: {},
  },
  {
    id: "t-4",
    title: "Film",
    is_active: true,
    is_finite: false,
    topic_items: [],
    category_ids: ["cat-3"],
    placeholders: {},
  },
  {
    id: "t-5",
    title: "Biscuit",
    is_active: true,
    is_finite: false,
    topic_items: [],
    category_ids: ["cat-2"],
    placeholders: {},
  },
] as unknown as TopicWithMeta[]

const meta = {
  title: "Form/TopicPickerField",
  component: TopicPickerField,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    topics: MOCK_TOPICS,
    categories: MOCK_CATEGORIES,
    value: [],
    onChange: () => {},
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof TopicPickerField>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  initial = [],
  size,
}: {
  initial?: EventFormValues["topics"]
  size?: "sm" | "md" | "lg"
}) {
  const [value, setValue] = useState<EventFormValues["topics"]>(initial)
  return (
    <TopicPickerField
      topics={MOCK_TOPICS}
      categories={MOCK_CATEGORIES}
      value={value}
      onChange={setValue}
      size={size}
    />
  )
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const WithSelection: Story = {
  render: () => (
    <Controlled
      initial={[
        {
          topicId: "t-1",
          title: "Colour",
          isCustom: false,
          items: [{ id: "i-1", label: "Blue" }],
          customLabels: [],
        },
      ]}
    />
  ),
}

export const WithCustomTopic: Story = {
  render: () => (
    <Controlled
      initial={[
        {
          topicId: "",
          title: "Sandwich",
          isCustom: true,
          items: [],
          customLabels: [],
        },
      ]}
    />
  ),
}

export const Small: Story = {
  render: () => <Controlled size="sm" />,
}

export const Medium: Story = {
  render: () => <Controlled size="md" />,
}

export const Large: Story = {
  render: () => <Controlled size="lg" />,
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">sm</p>
        <Controlled size="sm" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">md</p>
        <Controlled size="md" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">lg</p>
        <Controlled size="lg" />
      </div>
    </div>
  ),
}
