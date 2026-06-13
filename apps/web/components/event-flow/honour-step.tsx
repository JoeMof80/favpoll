"use client"

import {
  User,
  Users,
  UsersRound,
  Heart,
  Balloon,
  Flower2,
  PiggyBank,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { EventCategory, EventGrouping, EventSubject } from "@favpoll/types"

type HonourValue = {
  category: EventCategory | null
  grouping: EventGrouping
  subject: EventSubject
  causeLabel: string
}

type Props = {
  value: HonourValue
  onChange: (value: HonourValue) => void
}

const SUBJECT_OPTIONS = [
  { value: "individual", label: "An individual", icon: User },
  { value: "couple", label: "A couple", icon: Users },
  { value: "group", label: "A group", icon: UsersRound },
  { value: "cause", label: "A cause", icon: Heart },
] as const

const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: PiggyBank },
] as const

const ITEM_CLASS =
  "flex h-auto w-32 flex-col items-center gap-2 rounded-xl border border-border bg-background px-4 py-5 text-sm font-normal [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-[#EEEDFE] data-[state=on]:text-[#3C3489]"

function subjectToGrouping(subject: string): EventGrouping {
  if (subject === "couple") return "couple"
  if (subject === "group") return "group"
  return "individual"
}

function groupingToSubjectValue(
  subject: EventSubject,
  grouping: EventGrouping
): string {
  if (subject === "cause") return "cause"
  return grouping
}

export function HonourStep({ value, onChange }: Props) {
  const subjectToggleValue = groupingToSubjectValue(
    value.subject,
    value.grouping
  )

  function handleSubjectChange(v: string) {
    if (!v) return
    if (v === "cause") {
      onChange({ ...value, subject: "cause", grouping: "individual" })
    } else {
      onChange({
        ...value,
        subject: "someone",
        grouping: subjectToGrouping(v),
      })
    }
  }

  function handleCategoryChange(v: string) {
    if (!v) return
    onChange({ ...value, category: v as EventCategory })
  }

  return (
    <div className="flex flex-col gap-8 px-6 md:px-0">
      {/* Subject row */}
      <div className="flex flex-col gap-3 py-6">
        <h3 className="text-lg font-medium tracking-tight text-foreground">
          Honour
        </h3>
        <p className="text-sm text-muted-foreground">
          Who or what is this event for?
        </p>
        <ToggleGroup
          type="single"
          value={subjectToggleValue}
          onValueChange={handleSubjectChange}
          className="flex flex-wrap gap-2"
        >
          {SUBJECT_OPTIONS.map(({ value: v, label, icon: Icon }) => (
            <ToggleGroupItem key={v} value={v} className={ITEM_CLASS}>
              <Icon className="h-6 w-6" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {value.subject === "someone" && value.grouping === "individual" && (
          <p className="text-xs text-muted-foreground">
            Self-honours welcome — guests won&apos;t know it&apos;s you until
            the reveal.
          </p>
        )}

        {/* Cause label input */}
        {value.subject === "cause" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cause-label"
              className="text-sm text-muted-foreground"
            >
              What are you raising for?
            </label>
            <input
              id="cause-label"
              type="text"
              maxLength={60}
              placeholder="e.g. 40 years of Shelter"
              value={value.causeLabel}
              onChange={(e) =>
                onChange({ ...value, causeLabel: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-[#534AB7] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Category row */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">What is the occasion?</p>
        <ToggleGroup
          type="single"
          value={value.category ?? ""}
          onValueChange={handleCategoryChange}
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
            <ToggleGroupItem key={v} value={v} className={ITEM_CLASS}>
              <Icon className="h-6 w-6" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
