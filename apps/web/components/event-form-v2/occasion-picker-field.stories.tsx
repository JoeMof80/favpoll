"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { OccasionPickerField } from "./occasion-picker-field"

const meta = {
  title: "Form/OccasionPickerField",
  component: OccasionPickerField,
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
} satisfies Meta<typeof OccasionPickerField>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({ size }: { size?: "sm" | "md" | "lg" }) {
  const [value, setValue] = useState("")
  return (
    <OccasionPickerField
      value={value}
      onChange={setValue}
      onClear={() => setValue("")}
      size={size}
    />
  )
}

export const Default: Story = {
  render: () => <Controlled />,
}

export const WithSelection: Story = {
  render: () => {
    const [value, setValue] = useState("birthday")
    return (
      <OccasionPickerField
        value={value}
        onChange={setValue}
        onClear={() => setValue("")}
      />
    )
  },
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
