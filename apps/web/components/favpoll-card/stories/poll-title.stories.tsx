import type { Meta, StoryObj } from "@storybook/react"
import { PollTitle } from "../poll-title"

const meta = {
  title: "FavpollCard/PollTitle",
  component: PollTitle,
  parameters: { layout: "centered" },
} satisfies Meta<typeof PollTitle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: "Colour" },
}

export const Long: Story = {
  args: { title: "Biscuit of All Time" },
}

export const Large: Story = {
  args: { title: "Colour", size: "lg" },
}

export const Medium: Story = {
  args: { title: "Colour", size: "md" },
}

export const Small: Story = {
  args: { title: "Colour", size: "sm" },
}

export const AllSizes: Story = {
  args: { title: "Colour" },
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        [
          { size: "sm", label: "Small" },
          { size: "md", label: "Medium" },
          { size: "lg", label: "Large" },
        ] as const
      ).map(({ size, label }) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-16 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
          <PollTitle title="Colour" size={size} />
        </div>
      ))}
    </div>
  ),
}
