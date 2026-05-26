"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import type { Charity } from "@favpoll/types"
import { CharityField } from "./charity-field"

const MOCK_CHARITIES: Charity[] = [
  { id: "1", name: "Macmillan Cancer Support", is_active: true },
  { id: "2", name: "British Heart Foundation", is_active: true },
  { id: "3", name: "Age UK", is_active: true },
  { id: "4", name: "Oxfam", is_active: true },
  { id: "5", name: "Cancer Research UK", is_active: true },
  { id: "6", name: "RSPCA", is_active: true },
] as Charity[]

const meta = {
  title: "Form/CharityField",
  component: CharityField,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof CharityField>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  initial = [],
  size,
}: {
  initial?: string[]
  size?: "sm" | "md" | "lg"
}) {
  const [value, setValue] = useState<string[]>(initial)
  return (
    <CharityField
      charities={MOCK_CHARITIES}
      value={value}
      onChange={setValue}
      size={size}
    />
  )
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const WithSelections: Story = {
  render: () => <Controlled initial={["1", "3"]} />,
}

export const AtMax: Story = {
  render: () => <Controlled initial={["1", "2", "3"]} />,
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
        <Controlled initial={["1"]} size="sm" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">md</p>
        <Controlled initial={["1"]} size="md" />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">lg</p>
        <Controlled initial={["1"]} size="lg" />
      </div>
    </div>
  ),
}
