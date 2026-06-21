import type { Meta, StoryObj } from "@storybook/react"
import { FavpollListCardEmpty } from "./favpoll-list-card-empty"

const meta = {
  title: "Components/FavpollListCardEmpty",
  component: FavpollListCardEmpty,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavpollListCardEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
