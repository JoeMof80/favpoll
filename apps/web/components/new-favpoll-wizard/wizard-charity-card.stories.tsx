import type { Meta, StoryObj } from "@storybook/react"
import { WizardCharityCard } from "./wizard-charity-card"
import type { Charity } from "@favpoll/types"

const CHARITY_A: Charity = {
  id: "c1",
  name: "Shelter",
  registered_number: "263710",
  logo_url: null,
  created_at: "",
  description: null,
}

const CHARITY_B: Charity = {
  id: "c2",
  name: "Cancer Research UK",
  registered_number: "1089464",
  logo_url: null,
  created_at: "",
  description: null,
}

const meta = {
  title: "Wizard/WizardCharityCard",
  component: WizardCharityCard,
  parameters: { layout: "padded" },
  args: {
    onEdit: () => {},
    onRemove: () => {},
    onPickAnother: () => {},
  },
} satisfies Meta<typeof WizardCharityCard>

export default meta
type Story = StoryObj<typeof meta>

export const OneCharity: Story = {
  args: { charities: [CHARITY_A] },
}

export const TwoCharities: Story = {
  args: { charities: [CHARITY_A, CHARITY_B] },
}

export const ThreeCharities: Story = {
  args: {
    charities: [
      CHARITY_A,
      CHARITY_B,
      {
        ...CHARITY_A,
        id: "c3",
        name: "Macmillan Cancer Support",
        registered_number: "261017",
        logo_url: null,
        description: null,
      },
    ],
  },
}
