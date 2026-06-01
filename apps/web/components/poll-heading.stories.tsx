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

export const WithReveal: Story = {
  name: "With reveal",
  args: {
    topicTitle: "Colour",
    reveal: "Belinda's was purple. She wore it to every important occasion.",
    protagonistFirstName: "Belinda",
  },
}

export const WithoutReveal: Story = {
  name: "Without reveal",
  args: {
    topicTitle: "Season",
    reveal: null,
    protagonistFirstName: "Margaret",
  },
}

export const TitleOnly: Story = {
  name: "Title only (no protagonist)",
  args: {
    topicTitle: "Film",
    reveal: null,
  },
}
