"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  MAX_CHARITIES,
  type PickerSize,
} from "./constants"

export function CharityField({
  charities,
  value,
  onChange,
  size = "md",
}: {
  charities: Charity[]
  value: string[]
  onChange: (ids: string[]) => void
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const atMax = value.length >= MAX_CHARITIES
  const selected = charities.filter((c) => value.includes(c.id))

  const visible = charities.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else if (!atMax) {
      onChange([...value, id])
    }
  }

  const charityCount = value.length
  const charityDescription =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  return (
    <div>
      {/* Trigger */}
      <div
        className={cn(
          CHIP_IN_INPUT,
          CHIP_IN_INPUT_SIZE[size],
          "cursor-pointer"
        )}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {selected.map((c) => (
          <Chip
            key={c.id}
            selected
            size={size}
            className="gap-1"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggle(c.id)
            }}
            aria-label={`Remove ${c.name}`}
          >
            {c.name}
          </Chip>
        ))}
        {!atMax && (
          <span
            className={cn(
              "min-w-0 flex-1 text-muted-foreground/50",
              CHIP_IN_INPUT_TEXT[size]
            )}
          >
            {selected.length === 0 ? "Select a charity…" : "Add another…"}
          </span>
        )}
      </div>

      {/* Overlay */}
      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setSearch("")
        }}
        title="Charity"
        description={charityDescription}
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setOpen(false)
              setSearch("")
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities…"
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
          />
          {/* Charity chips */}
          {visible.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No results.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((c) => (
                <Chip
                  key={c.id}
                  selected={value.includes(c.id)}
                  size="lg"
                  disabled={!value.includes(c.id) && atMax}
                  onClick={() => toggle(c.id)}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </ResponsiveOverlay>
    </div>
  )
}
