import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { GuestWall } from "./guest-wall"

const now = Date.now()
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString()

const meta = {
  title: "Components/GuestWall",
  component: GuestWall,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GuestWall>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entries: [
      { id: "1", name: "Margaret H", labels: ["Purple"], created_at: ago(4) },
      { id: "2", name: null, labels: ["Purple"], created_at: ago(24) },
      {
        id: "3",
        name: "Tom",
        labels: ["Robins", "Purple"],
        created_at: ago(90),
      },
      { id: "4", name: "Priya", labels: [], created_at: ago(60 * 26) },
    ],
  },
}

export const Empty: Story = {
  args: { entries: [] },
}

export const LabelsGated: Story = {
  name: "Labels gated (un-entitled viewer)",
  args: {
    entries: [
      { id: "1", name: "Margaret H", labels: [], created_at: ago(4) },
      { id: "2", name: null, labels: [], created_at: ago(24) },
    ],
  },
}
