import type { Meta, StoryObj } from "@storybook/react"
import { Countdown } from "./countdown"

const future = (ms: number) => new Date(Date.now() + ms).toISOString()

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Countdown>

export default meta
type Story = StoryObj<typeof meta>

export const Days: Story = {
  args: {
    closesAt: future(4 * 24 * 60 * 60 * 1000),
  },
}

export const Hours: Story = {
  args: {
    closesAt: future(3 * 60 * 60 * 1000),
  },
}

export const Minutes: Story = {
  args: {
    closesAt: future(12 * 60 * 1000),
  },
}
