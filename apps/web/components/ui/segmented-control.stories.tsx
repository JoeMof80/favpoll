import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { SegmentedControl, ToolbarLabel } from "./segmented-control"

// The control that decided this component should exist: it had been written
// twice, once for the favpolls list's status filter and once for the print
// workspace's zoom presets, before anyone noticed they were the same thing.

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

function Demo({
  options,
  initial,
  label,
}: {
  options: readonly { value: string; label: string }[]
  initial: string
  label: string
}) {
  const [value, setValue] = useState(initial)
  return (
    <div className="flex items-center gap-3">
      <ToolbarLabel>{label}</ToolbarLabel>
      <SegmentedControl
        options={options}
        value={value}
        onChange={setValue}
        label={label}
      />
    </div>
  )
}

/** The favpolls list's status filter — the original. */
export const Status: Story = {
  args: { options: [], value: "", onChange: () => {}, label: "Status" },
  render: () => (
    <Demo
      label="Status"
      initial="live"
      options={[
        { value: "all", label: "All" },
        { value: "live", label: "Live" },
        { value: "closed", label: "Closed" },
      ]}
    />
  ),
}

/** The print workspace's zoom presets — the second one. */
export const Zoom: Story = {
  args: { options: [], value: "", onChange: () => {}, label: "Zoom" },
  render: () => (
    <Demo
      label="Zoom"
      initial="fit"
      options={[
        { value: "fit", label: "Fit" },
        { value: "0.5", label: "50%" },
        { value: "0.75", label: "75%" },
        { value: "1", label: "100%" },
      ]}
    />
  ),
}

/** Two options is the floor — below that it is a switch, not a choice. */
export const TwoOptions: Story = {
  args: { options: [], value: "", onChange: () => {}, label: "Telling" },
  render: () => (
    <Demo
      label="Telling"
      initial="tribute"
      options={[
        { value: "tribute", label: "Tribute" },
        { value: "fundraiser", label: "Fundraiser" },
      ]}
    />
  ),
}
