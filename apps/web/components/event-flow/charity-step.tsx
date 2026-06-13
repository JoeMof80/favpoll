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
  const [pickingMore, setPickingMore] = useState(false)

  const atMax = value.length >= MAX_CHARITIES
  const showPicker = value.length === 0 || pickingMore

  const selectedCharities = charities.filter((c) => value.includes(c.id))
  const visible = charities.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else if (!atMax) {
      onChange([...value, id])
      setPickingMore(false)
    }
  }

  if (!showPicker) {
    return (
      <div className="space-y-4 px-5 py-6">
        {/* Selected charities */}
        <div className="flex flex-wrap gap-1.5">
          {selectedCharities.map((c) => (
            <Chip key={c.id} selected size="lg" onClick={() => toggle(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>

        {/* Split note when 2+ */}
        {value.length >= 2 && (
          <p className="text-xs text-muted-foreground" data-testid="split-note">
            Proceeds are split equally — one charity keeps it simplest.
          </p>
        )}

        {/* Add another — quiet secondary action */}
        {!atMax && (
          <button
            type="button"
            onClick={() => setPickingMore(true)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            data-testid="add-another"
          >
            Pick another charity
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Back to selected state (only when re-adding) */}
      {value.length > 0 && (
        <div className="border-b border-border px-5 py-3">
          <button
            type="button"
            onClick={() => setPickingMore(false)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Sticky search */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search charities…"
          autoFocus
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Charity chips */}
      {visible.length === 0 ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No results.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-5 py-4">
          {visible.map((c) => (
            <Chip
              key={c.id}
              selected={value.includes(c.id)}
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
