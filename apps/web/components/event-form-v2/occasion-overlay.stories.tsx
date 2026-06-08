"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { OccasionOverlay } from "./occasion-overlay"

const meta = {
  title: "Form/OccasionOverlay",
  component: OccasionOverlay,
  parameters: { layout: "centered" },
  args: {
    register: "",
    occasionType: "",
    isPlural: false,
    onRegisterChange: () => {},
    onIsPluralChange: () => {},
    onClear: () => {},
    open: false,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof OccasionOverlay>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  initialRegister = "",
  initialOccasionType = "",
  initialIsPlural = false,
}: {
  initialRegister?: string
  initialOccasionType?: string
  initialIsPlural?: boolean
}) {
  const [register, setRegister] = useState(initialRegister)
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
        {register
          ? `${register}${occasionType ? ` · ${occasionType}` : ""}${isPlural ? " (plural)" : ""}`
          : "Choose occasion…"}
      </button>
      <OccasionOverlay
        register={register}
        occasionType={occasionType}
        isPlural={isPlural}
        onRegisterChange={(reg, oType) => {
          setRegister(reg)
          setOccasionType(oType ?? "")
        }}
        onIsPluralChange={setIsPlural}
        onClear={() => {
          setRegister("")
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

export const WithRegister: Story = {
  render: () => <Controlled initialRegister="celebrating_one" />,
}

export const WithRegisterAndType: Story = {
  render: () => (
    <Controlled
      initialRegister="celebrating_one"
      initialOccasionType="Birthday"
    />
  ),
}

export const Plural: Story = {
  render: () => (
    <Controlled
      initialRegister="celebrating_many"
      initialOccasionType="Wedding"
      initialIsPlural
    />
  ),
}

export const Remembering: Story = {
  render: () => <Controlled initialRegister="remembering" />,
}
