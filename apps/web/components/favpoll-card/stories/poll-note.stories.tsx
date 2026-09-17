import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PollNote } from "../poll-note"

const meta = {
  title: "FavpollCard/PollNote",
  component: PollNote,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PollNote>

export default meta
type Story = StoryObj<typeof meta>

export const WithReveal: Story = {
  args: {
    personalNote: "Mine was purple. I wore it to every occasion that mattered.",
    protagonistFirstName: "Belinda",
    role: "status",
    "aria-live": "polite",
  },
}

export const Empty: Story = {
  args: {
    personalNote: null,
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p className="mt-2 text-[12px] text-muted-foreground">
          (renders nothing when personalNote is null)
        </p>
      </div>
    ),
  ],
}
