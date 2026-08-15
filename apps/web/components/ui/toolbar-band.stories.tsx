import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "./button"
import { SegmentedControl, ToolbarLabel } from "./segmented-control"
import { ToolbarBand } from "./toolbar-band"

// The band is full-bleed on purpose, so these stories run at full width
// rather than centred — a centred story would show the one thing it is not.

const meta = {
  title: "UI/ToolbarBand",
  component: ToolbarBand,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ToolbarBand>

export default meta
type Story = StoryObj<typeof meta>

/** The shape every surface shares: labelled controls in a centred row. */
export const Default: Story = {
  args: {
    className: "flex flex-wrap items-center gap-x-3 gap-y-2",
    children: (
      <>
        <ToolbarLabel>Zoom</ToolbarLabel>
        <SegmentedControl
          label="Zoom"
          value="fit"
          onChange={() => {}}
          options={[
            { value: "fit", label: "Fit" },
            { value: "1", label: "100%" },
          ]}
        />
        <div className="ml-auto flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm">
            Export CSV
          </Button>
          <Button type="button" variant="secondary" size="sm">
            Print
          </Button>
        </div>
      </>
    ),
  },
}

/**
 * `below` takes full-width content under the centred row — the favpolls list
 * puts its occasion rail there, so the rail can scroll edge to edge while the
 * controls stay in the page's column.
 */
export const WithRailBelow: Story = {
  args: {
    ...Default.args,
    below: (
      <div className="mx-auto max-w-330 px-4 pb-2.5">
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Memorial", "Celebration", "Fundraiser", "Cause"].map(
            (label) => (
              <span
                key={label}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground"
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    ),
  },
}
