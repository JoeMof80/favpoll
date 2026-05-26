"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ItemAddField } from "./item-add-field"

const CANONICAL_COLOURS = [
  { id: "c-1", label: "Blue" },
  { id: "c-2", label: "Green" },
  { id: "c-3", label: "Red" },
  { id: "c-4", label: "Yellow" },
  { id: "c-5", label: "Purple" },
  { id: "c-6", label: "Orange" },
  { id: "c-7", label: "Pink" },
  { id: "c-8", label: "Black" },
  { id: "c-9", label: "White" },
]

const CANONICAL_SEASONS = [
  { id: "s-1", label: "Spring" },
  { id: "s-2", label: "Summer" },
  { id: "s-3", label: "Autumn" },
  { id: "s-4", label: "Winter" },
]

const meta = {
  title: "Form/ItemAddField",
  component: ItemAddField,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    canonicalItems: CANONICAL_COLOURS,
    customLabels: [],
    topicTitle: "Colour",
    onAdd: () => {},
    onRemove: () => {},
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    isFinite: { control: "boolean" },
  },
} satisfies Meta<typeof ItemAddField>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  initial = [],
  canonicalItems = CANONICAL_COLOURS,
  isFinite = false,
  topicTitle = "Colour",
  size,
}: {
  initial?: string[]
  canonicalItems?: { id: string; label: string }[]
  isFinite?: boolean
  topicTitle?: string
  size?: "sm" | "md" | "lg"
}) {
  const [customLabels, setCustomLabels] = useState<string[]>(initial)
  return (
    <ItemAddField
      canonicalItems={canonicalItems}
      customLabels={customLabels}
      topicTitle={topicTitle}
      isFinite={isFinite}
      onAdd={(label) => setCustomLabels((prev) => [...prev, label])}
      onRemove={(label) =>
        setCustomLabels((prev) => prev.filter((l) => l !== label))
      }
      size={size}
    />
  )
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const WithCustomLabels: Story = {
  render: () => <Controlled initial={["Teal", "Indigo"]} />,
}

export const Finite: Story = {
  render: () => (
    <Controlled
      canonicalItems={CANONICAL_SEASONS}
      topicTitle="Season"
      isFinite
    />
  ),
}

export const NewCustomTopic: Story = {
  render: () => (
    <Controlled canonicalItems={[]} topicTitle="Sandwich" />
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
        <Controlled initial={["Teal"]} size="sm" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">md</p>
        <Controlled initial={["Teal"]} size="md" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">lg</p>
        <Controlled initial={["Teal"]} size="lg" />
      </div>
    </div>
  ),
}
