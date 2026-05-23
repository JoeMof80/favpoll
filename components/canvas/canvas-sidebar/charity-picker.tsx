"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PickerField } from "@/components/ui/picker-field"
import type { Charity } from "@/types"

export const MAX_CHARITIES = 3

type Props = {
  charities: Charity[]
  charityIds: string[]
  charitySearch: string
  onToggle: (id: string) => void
  onSearchChange: (v: string) => void
}

export function CharityPicker({
  charities,
  charityIds,
  charitySearch,
  onToggle,
  onSearchChange,
}: Props) {
  const atMax = charityIds.length >= MAX_CHARITIES
  const selected = charities.filter((c) => charityIds.includes(c.id))

  const items = charities.map((c) => ({
    id: c.id,
    label: c.name,
    disabled: !charityIds.includes(c.id) && atMax,
  }))

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <SectionEyebrow variant="muted" className="font-semibold">
          Charity
        </SectionEyebrow>
        {charityIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {charityIds.length}/{MAX_CHARITIES}
          </p>
        )}
      </div>

      <PickerField
        items={items}
        selectedIds={charityIds}
        onToggle={onToggle}
        searchValue={charitySearch}
        onSearchChange={onSearchChange}
        placeholder={atMax ? "Maximum charities selected" : "Select a charity…"}
        disabled={atMax}
        popoverLabel="Select a charity"
      />

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onToggle(c.id)}
              className="h-auto rounded-full px-3 py-1.5 text-xs"
            >
              {c.name}
              <X
                className="ml-1 h-3 w-3 shrink-0"
                aria-label={`Remove ${c.name}`}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
