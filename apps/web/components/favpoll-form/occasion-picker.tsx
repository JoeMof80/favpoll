"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { cn } from "@/lib/utils"
import type { OccasionSpec } from "@/lib/occasions"

const CHIP_ON =
  "rounded-full border-primary bg-secondary text-secondary-foreground hover:bg-secondary"
const CHIP_OFF = "rounded-full"

/**
 * Fullscreen searchable picker for the Generate control's occasion.
 * The occasion is an ephemeral generation input (never stored): picking
 * one generates immediately, so there is no separate confirm step.
 */
export function OccasionPicker({
  open,
  onOpenChange,
  occasions,
  selected,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  occasions: OccasionSpec[]
  selected: OccasionSpec | null
  onSelect: (occasion: OccasionSpec | null) => void
}) {
  const [search, setSearch] = useState("")
  const trimmed = search.trim().toLowerCase()
  const filtered = trimmed
    ? occasions.filter((o) => o.label.toLowerCase().includes(trimmed))
    : occasions

  function close() {
    setSearch("")
    onOpenChange(false)
  }

  function pick(occasion: OccasionSpec | null) {
    onSelect(occasion)
    close()
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => {
        if (!o) setSearch("")
        onOpenChange(o)
      }}
      title="Pick an occasion"
      footer={
        <Button type="button" className="w-full" onClick={close}>
          Done
        </Button>
      }
      fullscreenOnMobile
      mobileSave={{ label: "Done", onClick: close }}
    >
      <div className="space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search occasions…"
          autoFocus
          className="md:text-base"
        />
        <div
          className="flex flex-wrap gap-1.5"
          role="listbox"
          aria-label="Occasions"
        >
          {!trimmed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              role="option"
              aria-selected={selected === null}
              onClick={() => pick(null)}
              className={cn(selected === null ? CHIP_ON : CHIP_OFF)}
            >
              No occasion
            </Button>
          )}
          {filtered.map((occasion) => (
            <Button
              key={occasion.label}
              type="button"
              variant="outline"
              size="sm"
              role="option"
              aria-selected={selected?.label === occasion.label}
              onClick={() => pick(occasion)}
              className={cn(
                selected?.label === occasion.label ? CHIP_ON : CHIP_OFF
              )}
            >
              {occasion.label}
            </Button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No occasions match.
          </p>
        )}
      </div>
    </ResponsiveOverlay>
  )
}
