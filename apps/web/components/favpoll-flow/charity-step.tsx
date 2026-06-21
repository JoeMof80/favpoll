"use client"

import { Chip } from "@/components/ui/chip"
import type { Charity } from "@favpoll/types"

const MAX_CHARITIES = 3

type CharityStepProps = {
  charities: Charity[]
  value: string[]
  onChange: (v: string[]) => void
  search?: string
}

export function CharityStep({
  charities,
  value,
  onChange,
  search,
}: CharityStepProps) {
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
    <div>
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
