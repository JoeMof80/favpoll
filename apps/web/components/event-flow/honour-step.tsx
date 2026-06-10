"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EventCategory, EventGrouping } from "@favpoll/types"
import { PollTitle } from "../favpoll-card/poll-title"

const GROUPINGS: { value: EventGrouping; label: string }[] = [
  { value: "individual", label: "An individual" },
  { value: "couple", label: "A couple" },
  { value: "group", label: "A group" },
]

const CATEGORIES: {
  value: EventCategory
  label: string
}[] = [
  { value: "celebration", label: "Celebration" },
  { value: "memorial", label: "Memorial" },
  { value: "fundraiser", label: "Fundraiser" },
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
      {/* Category — horizontal scroll row */}
      <div className="space-y-3 px-5 py-4">
        <PollTitle title="Occasion type" size="lg" />
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATEGORIES.map(({ value: cat, label }) => (
            <Button
              key={cat}
              type="button"
              variant="outline"
              onClick={() => handleCategorySelect(cat)}
              className={cn(
                "shrink-0",
                value.category === cat &&
                  "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grouping segmented control */}
      {showGrouping && (
        <div className="space-y-3 px-5 py-4">
          <PollTitle title="For" size="lg" />
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {GROUPINGS.map(({ value: grp, label }) => (
              <Button
                key={grp}
                type="button"
                variant="outline"
                onClick={() => handleGroupingSelect(grp)}
                className={cn(
                  "shrink-0",
                  value.grouping === grp &&
                    "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
