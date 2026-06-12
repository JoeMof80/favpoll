"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { EventCategory, EventGrouping, EventSubject } from "@favpoll/types"
import { SectionLabel } from "../favpoll-card/section-label"
import { Balloon, User } from "lucide-react"

const SUBJECT_ITEMS: {
  value: string
  label: string
  subject: EventSubject
  grouping?: EventGrouping
}[] = [
  {
    value: "individual",
    label: "An individual",
    subject: "someone",
    grouping: "individual",
  },
  {
    value: "couple",
    label: "A couple",
    subject: "someone",
    grouping: "couple",
  },
  { value: "group", label: "A group", subject: "someone", grouping: "group" },
  { value: "cause", label: "A cause", subject: "cause" },
]

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "celebration", label: "Celebration" },
  { value: "memorial", label: "Memorial" },
  { value: "fundraiser", label: "Fundraiser" },
]

const ACTIVE_ITEM_CLASS =
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"

type HonourStepProps = {
  value: {
    category: EventCategory | null
    grouping: EventGrouping
    subject: EventSubject
    causeLabel: string
  }
  onChange: (v: {
    category: EventCategory | null
    grouping: EventGrouping
    subject: EventSubject
    causeLabel: string
  }) => void
}

export function HonourStep({ value, onChange }: HonourStepProps) {
  const subjectKey = value.subject === "cause" ? "cause" : value.grouping

  function handleSubjectChange(v: string) {
    if (!v) return
    const item = SUBJECT_ITEMS.find((i) => i.value === v)
    if (!item) return
    if (item.subject === "cause") {
      onChange({ ...value, subject: "cause" })
    } else {
      onChange({ ...value, subject: "someone", grouping: item.grouping! })
    }
  }

  function handleCategoryChange(v: string) {
    if (!v) return
    onChange({ ...value, category: v as EventCategory })
  }

  function handleCauseLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, causeLabel: e.target.value })
  }

  return (
    <div className="space-y-5">
      {/* Subject row */}
      <div className="space-y-3 px-5 py-4">
        <SectionLabel title="Who are you honouring?" size="lg" />
        <ToggleGroup
          type="single"
          value={subjectKey}
          onValueChange={handleSubjectChange}
          aria-label="Who is this event for?"
          className="flex-wrap gap-1.5"
        >
          {SUBJECT_ITEMS.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              variant="outline"
              size="lg"
              className={ACTIVE_ITEM_CLASS}
            >
              <User />
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {value.subject !== "cause" && value.grouping === "individual" && (
          <p className="text-xs text-muted-foreground">
            Self-honours welcome — guests won&apos;t know it&apos;s you until
            the reveal.
          </p>
        )}
        {value.subject === "cause" && (
          <div className="space-y-1">
            <label
              htmlFor="honour-cause-label"
              className="text-xs text-muted-foreground"
            >
              What are you raising for?
            </label>
            <input
              id="honour-cause-label"
              type="text"
              value={value.causeLabel}
              onChange={handleCauseLabelChange}
              maxLength={60}
              placeholder="e.g. 40 years of Shelter"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>
        )}
      </div>

      {/* Category row */}
      <div className="space-y-3 px-5 py-4">
        <SectionLabel title="How are you honouring them?" size="lg" />
        <ToggleGroup
          type="single"
          value={value.category ?? ""}
          onValueChange={handleCategoryChange}
          aria-label="Occasion type"
          className="flex-wrap gap-1.5"
        >
          {CATEGORIES.map(({ value: cat, label }) => (
            <ToggleGroupItem
              key={cat}
              value={cat}
              variant="outline"
              size="lg"
              className={ACTIVE_ITEM_CLASS}
            >
              <Balloon />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
