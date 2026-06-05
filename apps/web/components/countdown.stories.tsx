import type { Meta, StoryObj } from "@storybook/react"
import { Countdown } from "./countdown"

const future = (ms: number) => new Date(Date.now() + ms).toISOString()
const closesAt = future(4 * 24 * 60 * 60 * 1000)

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72 rounded-lg border border-border bg-card px-5 py-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Countdown>

export default meta
type Story = StoryObj<typeof meta>

export const Days: Story = {
  args: { closesAt: future(4 * 24 * 60 * 60 * 1000) },
}

export const Hours: Story = {
  args: { closesAt: future(3 * 60 * 60 * 1000) },
}

export const Minutes: Story = {
  args: { closesAt: future(12 * 60 * 1000) },
}

export const Large: Story = {
  args: { closesAt },
  render: () => (
    <div className="w-72 rounded-lg border border-border bg-card px-5 py-4">
      <Countdown closesAt={closesAt} size="lg" />
    </div>
  ),
}

export const Medium: Story = {
  args: { closesAt },
  render: () => (
    <div className="w-64 rounded-lg border border-border bg-card px-4 py-3">
      <Countdown closesAt={closesAt} size="md" />
    </div>
  ),
}

export const Small: Story = {
  args: { closesAt },
  render: () => (
    <div className="w-52 rounded-lg border border-border bg-card px-3 py-2">
      <Countdown closesAt={closesAt} size="sm" />
    </div>
  ),
}

export const Inline: Story = {
  args: { closesAt },
  render: () => (
    <div className="w-96 rounded-lg border border-border bg-card px-6 py-5">
      <Countdown closesAt={closesAt} variant="inline" />
    </div>
  ),
}

export const InlineAllSizes: Story = {
  args: { closesAt },
  render: () => (
    <div className="flex flex-col gap-6">
      {(
        [
          { size: "sm", width: "w-72", padding: "px-4 py-3", label: "Small" },
          { size: "md", width: "w-80", padding: "px-5 py-4", label: "Medium" },
          { size: "lg", width: "w-96", padding: "px-6 py-5", label: "Large" },
        ] as const
      ).map(({ size, width, padding, label }) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <div
            className={`${width} ${padding} rounded-lg border border-border bg-card`}
          >
            <Countdown closesAt={closesAt} variant="inline" size={size} />
          </div>
        </div>
      ))}
    </div>
  ),
}

export const AllSizes: Story = {
  args: { closesAt },
  render: () => (
    <div className="flex items-start gap-4">
      {(
        [
          { size: "sm", width: "w-52", padding: "px-3 py-2", label: "Small" },
          { size: "md", width: "w-64", padding: "px-4 py-3", label: "Medium" },
          { size: "lg", width: "w-72", padding: "px-5 py-4", label: "Large" },
        ] as const
      ).map(({ size, width, padding, label }) => (
        <div key={size} className="flex flex-col gap-2">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <div
            className={`${width} ${padding} rounded-lg border border-border bg-card`}
          >
            <Countdown closesAt={closesAt} size={size} />
          </div>
        </div>
      ))}
    </div>
  ),
}
