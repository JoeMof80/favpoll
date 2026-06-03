import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { RotateCcw, Eye, Share2 } from "lucide-react"
import { TooltipIconButton } from "./tooltip-icon-button"

const meta = {
  title: "UI/TooltipIconButton",
  component: TooltipIconButton,
  parameters: { layout: "centered" },
  args: {
    onClick: () => {},
  },
} satisfies Meta<typeof TooltipIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const ResetPledge: Story = {
  args: {
    icon: RotateCcw,
    label: "Reset pledge",
    side: "left",
  },
}

export const ViewResults: Story = {
  args: {
    icon: Eye,
    label: "View results",
    side: "left",
  },
}

export const Share: Story = {
  args: {
    icon: Share2,
    label: "Share event",
    side: "bottom",
  },
}
