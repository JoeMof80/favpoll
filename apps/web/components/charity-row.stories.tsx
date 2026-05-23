import type { Meta, StoryObj } from "@storybook/react"
import { CharityRow } from "./charity-row"

const ageUK = {
  id: "1",
  name: "Age UK",
  description: null,
  logo_url: null,
  registered_number: "1128267",
  created_at: "",
}

const meta = {
  title: "Components/CharityRow",
  component: CharityRow,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CharityRow>

export default meta
type Story = StoryObj<typeof meta>

export const OneCharity: Story = {
  args: {
    charity: ageUK,
    amountRaised: 750,
  },
}
