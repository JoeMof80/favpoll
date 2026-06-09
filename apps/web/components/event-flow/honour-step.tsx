"use client"

import { Chip } from "@/components/ui/chip"
import { cn } from "@/lib/utils"
import type { EventCategory, EventGrouping } from "@favpoll/types"

const GROUPINGS: { value: EventGrouping; label: string }[] = [
  { value: "individual", label: "An individual" },
  { value: "couple", label: "A couple" },
  { value: "group", label: "A group" },
]

const CATEGORIES: {
  value: EventCategory
  label: string
  description: string
}[] = [
  {
    value: "celebration",
    label: "Celebration",
    description: "Birthday, retirement, wedding, graduation, and more.",
  },
  {
    value: "memorial",
    label: "Memorial",
    description: "Remembering someone who has passed.",
  },
  {
    value: "fundraiser",
    label: "Fundraiser",
    description: "Supporting a cause or charity directly.",
  },
]

type HonourStepProps = {
  value: { category: EventCategory | null; grouping: EventGrouping }
  onChange: (v: {
    category: EventCategory | null
    grouping: EventGrouping
  }) => void
}

export function HonourStep({ value, onChange }: HonourStepProps) {
  const showGrouping = value.category !== "fundraiser"

  function handleCategorySelect(cat: EventCategory) {
    const newGrouping = cat === "fundraiser" ? "individual" : value.grouping
    onChange({ category: cat, grouping: newGrouping })
  }

  function handleGroupingSelect(grp: EventGrouping) {
    onChange({ category: value.category, grouping: grp })
  }

  return (
    <div className="space-y-5">
      {/* Grouping segmented control */}
      {showGrouping && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            For
          </p>
          <div className="flex gap-1.5">
            {GROUPINGS.map(({ value: grp, label }) => (
              <Chip
                key={grp}
                size="md"
                selected={value.grouping === grp}
                onClick={() => handleGroupingSelect(grp)}
                className="flex-1 justify-center"
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Category chips */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Occasion type
        </p>
        <div className="space-y-2">
          {CATEGORIES.map(({ value: cat, label, description }) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                value.category === cat
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
