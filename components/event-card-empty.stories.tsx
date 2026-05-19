import type { Meta, StoryObj } from "@storybook/react"
import { EventCardEmpty } from "./event-card-empty"

const meta = {
  title: "Components/EventCardEmpty",
  component: EventCardEmpty,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCardEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
