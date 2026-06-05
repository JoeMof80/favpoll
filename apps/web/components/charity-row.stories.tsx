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

export const WithLogo: Story = {
  args: {
    charity: {
      ...ageUK,
      logo_url: "https://placehold.co/32x32/EEEDFE/534AB7?text=A",
    },
    amountRaised: 1250,
  },
}

export const NoAmount: Story = {
  args: {
    charity: ageUK,
    amountRaised: 0,
  },
}

export const Large: Story = {
  args: { charity: ageUK, amountRaised: 750 },
  render: () => (
    <div className="w-80">
      <CharityRow charity={ageUK} amountRaised={750} size="lg" />
    </div>
  ),
}

export const Medium: Story = {
  args: { charity: ageUK, amountRaised: 750 },
  render: () => (
    <div className="w-72">
      <CharityRow charity={ageUK} amountRaised={750} size="md" />
    </div>
  ),
}

export const Small: Story = {
  args: { charity: ageUK, amountRaised: 750 },
  render: () => (
    <div className="w-56">
      <CharityRow charity={ageUK} amountRaised={750} size="sm" />
    </div>
  ),
}

export const AllSizes: Story = {
  args: { charity: ageUK, amountRaised: 750 },
  render: () => (
    <div className="flex items-start gap-6">
      {(
        [
          { size: "sm", width: "w-56", label: "Small" },
          { size: "md", width: "w-72", label: "Medium" },
          { size: "lg", width: "w-80", label: "Large" },
        ] as const
      ).map(({ size, width, label }) => (
        <div key={size} className={width}>
          <p className="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <CharityRow charity={ageUK} amountRaised={750} size={size} />
        </div>
      ))}
    </div>
  ),
}
