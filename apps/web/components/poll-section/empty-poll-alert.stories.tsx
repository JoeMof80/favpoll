import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { EmptyPollAlert } from "./empty-poll-alert"

const meta = {
  title: "PollSection/EmptyPollAlert",
  component: EmptyPollAlert,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyPollAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
