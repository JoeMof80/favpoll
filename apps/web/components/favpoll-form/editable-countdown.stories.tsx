import type { Meta, StoryObj } from "@storybook/react"
import { EditableCountdown } from "./editable-countdown"

const meta: Meta<typeof EditableCountdown> = {
  title: "FavpollForm/EditableCountdown",
  component: EditableCountdown,
  parameters: { layout: "padded" },
}
export default meta

type Story = StoryObj<typeof EditableCountdown>

const FUTURE = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 60_000).toISOString()

/** Create mode — no closing date set yet */
export const Placeholder: Story = {
  args: {},
}

/** Edit mode — event still open */
export const LiveCountdown: Story = {
  args: {
    closesAt: FUTURE,
    onClosesAtChange: (iso) => alert(`New closes_at: ${iso}`),
  },
}

/** Edit mode — event already closed */
export const Closed: Story = {
  args: {
    closesAt: PAST,
    onClosesAtChange: (iso) => alert(`New closes_at: ${iso}`),
  },
}
