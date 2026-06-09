"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { OccasionOverlay } from "./occasion-overlay"

const meta = {
  title: "Form/OccasionOverlay",
  component: OccasionOverlay,
  parameters: { layout: "centered" },
  args: {
    occasionType: "",
    isPlural: false,
    onOccasionChange: () => {},
    onIsPluralChange: () => {},
    onClear: () => {},
    open: false,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof OccasionOverlay>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  initialOccasionType = "",
  initialIsPlural = false,
}: {
  initialOccasionType?: string
  initialIsPlural?: boolean
}) {
  const [occasionType, setOccasionType] = useState(initialOccasionType)
  const [isPlural, setIsPlural] = useState(initialIsPlural)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="rounded border border-border px-3 py-2 text-sm"
        onClick={() => setOpen(true)}
      >
        {occasionType
          ? `${occasionType}${isPlural ? " (plural)" : ""}`
          : "Choose occasion…"}
      </button>
      <OccasionOverlay
        occasionType={occasionType}
        isPlural={isPlural}
        onOccasionChange={setOccasionType}
        onIsPluralChange={setIsPlural}
        onClear={() => {
          setOccasionType("")
          setIsPlural(false)
        }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

export const Empty: Story = {
  render: () => <Controlled />,
}

export const WithOccasionType: Story = {
  render: () => <Controlled initialOccasionType="Birthday" />,
}

export const Wedding: Story = {
  render: () => <Controlled initialOccasionType="Wedding" initialIsPlural />,
}

export const Remembering: Story = {
  render: () => <Controlled initialOccasionType="Memorial" />,
}
