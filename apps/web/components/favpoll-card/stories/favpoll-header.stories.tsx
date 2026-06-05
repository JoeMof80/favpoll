import type { Meta, StoryObj } from "@storybook/react"
import { FavpollHeader } from "../favpoll-header"

const protagonist = {
  name: "Belinda Hartley",
  context: "1942–2024",
}

const meta = {
  title: "FavpollCard/FavpollHeader",
  component: FavpollHeader,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80 bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavpollHeader>

export default meta
type Story = StoryObj<typeof meta>

export const WithPhoto: Story = {
  args: {
    protagonist: {
      name: "Belinda Hartley",
      photo_url: "https://i.pravatar.cc/150?img=47",
      context: "1942–2024",
    },
    eyebrow: "Memorial",
  },
}

export const InitialsOnly: Story = {
  args: {
    protagonist,
    eyebrow: "Memorial",
  },
}

export const Couple: Story = {
  args: {
    protagonist: {
      name: "Alex & Jordan",
      initials: "AJ",
    },
    eyebrow: "Engagement",
  },
}

export const Large: Story = {
  args: { protagonist, eyebrow: "Memorial", size: "lg" },
  render: () => (
    <div className="w-80 bg-white p-4">
      <FavpollHeader protagonist={protagonist} eyebrow="Memorial" size="lg" />
    </div>
  ),
}

export const Medium: Story = {
  args: { protagonist, eyebrow: "Memorial", size: "md" },
  render: () => (
    <div className="w-72 bg-white p-4">
      <FavpollHeader protagonist={protagonist} eyebrow="Memorial" size="md" />
    </div>
  ),
}

export const Small: Story = {
  args: { protagonist, eyebrow: "Memorial", size: "sm" },
  render: () => (
    <div className="w-56 bg-white p-4">
      <FavpollHeader protagonist={protagonist} eyebrow="Memorial" size="sm" />
    </div>
  ),
}

export const AllSizes: Story = {
  args: { protagonist, eyebrow: "Memorial" },
  render: () => (
    <div className="flex items-start gap-6">
      {(
        [
          { size: "sm", width: "w-56", label: "Small" },
          { size: "md", width: "w-72", label: "Medium" },
          { size: "lg", width: "w-80", label: "Large" },
        ] as const
      ).map(({ size, width, label }) => (
        <div key={size} className={`${width} bg-white p-4`}>
          <p className="mb-3 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <FavpollHeader
            protagonist={protagonist}
            eyebrow="Memorial"
            size={size}
          />
        </div>
      ))}
    </div>
  ),
}
