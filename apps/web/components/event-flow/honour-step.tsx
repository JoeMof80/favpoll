"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EventCategory, EventGrouping, EventSubject } from "@favpoll/types"
import { SectionLabel } from "../favpoll-card/section-label"

type SubjectOption =
  | { kind: "person"; value: EventGrouping; label: string }
  | { kind: "cause"; label: string }

const SUBJECT_OPTIONS: SubjectOption[] = [
  { kind: "person", value: "individual", label: "An individual" },
  { kind: "person", value: "couple", label: "A couple" },
  { kind: "person", value: "group", label: "A group" },
  { kind: "cause", label: "A cause" },
]

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "celebration", label: "Celebration" },
  { value: "memorial", label: "Memorial" },
  { value: "fundraiser", label: "Fundraiser" },
]

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
  function handleSubjectSelect(opt: SubjectOption) {
    if (opt.kind === "cause") {
      onChange({ ...value, subject: "cause" })
    } else {
      onChange({ ...value, subject: "someone", grouping: opt.value })
    }
  }

  function handleCategorySelect(cat: EventCategory) {
    onChange({ ...value, category: cat })
  }

  function handleCauseLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, causeLabel: e.target.value })
  }

  function isSubjectActive(opt: SubjectOption) {
    return opt.kind === "cause"
      ? value.subject === "cause"
      : value.subject !== "cause" && value.grouping === opt.value
  }

  return (
    <div className="space-y-5">
      {/* Subject row */}
      <div className="space-y-3 px-5 py-4">
        <SectionLabel title="For" size="lg" />
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {SUBJECT_OPTIONS.map((opt) => (
            <Button
              key={opt.kind === "cause" ? "cause" : opt.value}
              type="button"
              variant="outline"
              onClick={() => handleSubjectSelect(opt)}
              className={cn(
                "shrink-0",
                isSubjectActive(opt) &&
                  "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>
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
        <SectionLabel title="Occasion type" size="lg" />
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
    </div>
  )
}
