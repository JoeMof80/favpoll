import type { Meta, StoryObj } from "@storybook/react"
import { PollHeading } from "./poll-heading"

const meta = {
  title: "PollHeading/PollHeading",
  component: PollHeading,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl py-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PollHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {
  name: "Static (post-pledge)",
  args: {
    topicTitle: "Colour",
  },
}

export const AsButton: Story = {
  name: "As pledge button (pre-pledge)",
  args: {
    topicTitle: "Colour",
    onPledge: () => {},
  },
}

export const TitleOnly: Story = {
  name: "Title only — no actions",
  args: {
    topicTitle: "Film",
  },
}
