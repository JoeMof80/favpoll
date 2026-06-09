"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import type { Charity } from "@favpoll/types"

const MAX_CHARITIES = 3

type CharityStepProps = {
  charities: Charity[]
  value: string[]
  onChange: (v: string[]) => void
}

export function CharityStep({ charities, value, onChange }: CharityStepProps) {
  const [search, setSearch] = useState("")

  const atMax = value.length >= MAX_CHARITIES

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

  return (
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
  )
}
