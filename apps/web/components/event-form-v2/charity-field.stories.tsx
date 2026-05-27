"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import type { Charity } from "@favpoll/types"
import { CharityField } from "./charity-field"

const MOCK_CHARITIES: Charity[] = [
  {
    id: "1",
    name: "Macmillan Cancer Support",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
  {
    id: "2",
    name: "British Heart Foundation",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
  {
    id: "3",
    name: "Age UK",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
  {
    id: "4",
    name: "Oxfam",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
  {
    id: "5",
    name: "Cancer Research UK",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
  {
    id: "6",
    name: "RSPCA",
    description: null,
    logo_url: null,
    registered_number: null,
    created_at: "",
  },
]

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
  args: {
    charities: MOCK_CHARITIES,
    value: [],
    onChange: () => {},
  },
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
