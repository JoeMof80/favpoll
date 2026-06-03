import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ProtagonistAvatar } from "./event-hero-avatar"

const meta = {
  title: "EventHero/ProtagonistAvatar",
  component: ProtagonistAvatar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ProtagonistAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithPhoto: Story = {
  args: {
    name: "Belinda Shaw",
    photoUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop",
  },
}

export const InitialsFallback: Story = {
  args: {
    name: "Belinda Shaw",
    photoUrl: null,
  },
}

export const SingleName: Story = {
  args: {
    name: "Cher",
    photoUrl: null,
  },
}
