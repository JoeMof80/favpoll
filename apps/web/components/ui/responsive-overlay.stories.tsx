"use client"

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "./responsive-overlay"

const meta = {
  title: "UI/ResponsiveOverlay",
  component: ResponsiveOverlay,
  parameters: { layout: "centered" },
  args: {
    open: false,
    onOpenChange: () => {},
    title: "Example",
    children: null,
  },
} satisfies Meta<typeof ResponsiveOverlay>

export default meta
type Story = StoryObj<typeof meta>

function Controlled({
  description,
  footer,
  children,
}: {
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open overlay
      </Button>
      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Example overlay"
        description={description}
        footer={footer}
      >
        {children}
      </ResponsiveOverlay>
    </>
  )
}

export const Open: Story = {
  render: () => (
    <Controlled>
      <p className="text-sm text-muted-foreground">
        Content goes here. On mobile this slides up as a bottom sheet; on
        desktop it opens as a centred dialog.
      </p>
    </Controlled>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Controlled
      description="Optional help text shown below the title."
      footer={
        <div className="flex gap-2">
          <Button type="button" className="flex-1">
            Save
          </Button>
          <Button type="button" variant="ghost" className="flex-1">
            Cancel
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Footer contains Save and Cancel actions.
      </p>
    </Controlled>
  ),
}

export const LongContent: Story = {
  render: () => (
    <Controlled
      footer={
        <Button type="button" className="w-full">
          Done
        </Button>
      }
    >
      <div className="space-y-3">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            Item {i + 1} — scroll to see more content
          </div>
        ))}
      </div>
    </Controlled>
  ),
}
