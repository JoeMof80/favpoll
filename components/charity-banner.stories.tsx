import type { Meta, StoryObj } from "@storybook/react"
import { CharityBanner } from "./charity-banner"

const ageUK = {
  id: "1",
  name: "Age UK",
  description: null,
  logo_url: null,
  registered_number: "1128267",
  created_at: "",
}

const macmillan = {
  id: "2",
  name: "Macmillan Cancer Support",
  description: null,
  logo_url: null,
  registered_number: "261017",
  created_at: "",
}

const rnli = {
  id: "3",
  name: "RNLI",
  description: null,
  logo_url: null,
  registered_number: "209603",
  created_at: "",
}

const meta = {
  title: "Components/CharityBanner",
  component: CharityBanner,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CharityBanner>

export default meta
type Story = StoryObj<typeof meta>

export const OneCharity: Story = {
  args: {
    charities: [ageUK],
    totalRaised: 750,
  },
}

export const TwoCharities: Story = {
  args: {
    charities: [ageUK, macmillan],
    totalRaised: 1200,
  },
}

export const ThreeCharities: Story = {
  args: {
    charities: [ageUK, macmillan, rnli],
    totalRaised: 2400,
  },
}

export const NoRaised: Story = {
  args: {
    charities: [ageUK],
    totalRaised: 0,
  },
}
