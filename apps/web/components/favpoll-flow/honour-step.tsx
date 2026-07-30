"use client"

import { Balloon, Flower2, Medal, HeartHandshake } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
  Pronoun,
} from "@favpoll/types"

type HonourValue = {
  category: FavpollCategory | null
  grouping: FavpollGrouping
  subject: FavpollSubject
  pronoun: Pronoun | undefined
}

type Props = {
  value: HonourValue
  onChange: (value: HonourValue) => void
}

// The step forks: honouring someone (pick a type) OR backing a cause
// (faceless — no protagonist, no type). The who refinements (pronoun,
// pair/group) moved to the form's Generate control (2026-07-30) — they
// only shape suggestions, so they're answered where suggestions happen.
const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: Medal },
] as const

const ITEM_CLASS =
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-1 py-4 text-xs font-normal sm:px-4 sm:py-5 sm:text-sm [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

export function HonourStep({ value, onChange }: Props) {
  const isCause = value.subject === "cause"

  function handleCategoryChange(v: string) {
    if (!v) return
    // Touch either side of the OR and you're on that side: picking a type
    // while "A cause" is selected hops back to the person path.
    onChange({
      category: v as FavpollCategory,
      subject: "someone",
      grouping: value.subject === "cause" ? "individual" : value.grouping,
      pronoun: value.subject === "cause" ? undefined : value.pronoun,
    })
  }

  function handleCauseChange(v: string) {
    if (v !== "cause") return
    // A cause has no type: category is honestly null (deriveRegister is
    // subject-first, so the cause register needs no category plumbing).
    onChange({
      category: null,
      subject: "cause",
      grouping: "individual",
      pronoun: undefined,
    })
  }

  return (
    // The fork between two complete answers. Mobile stacks (type row,
    // horizontal OR, cause below); sm+ reads left-to-right on one row
    // with a vertical OR (founder, 2026-07-30). The step-shell guidance
    // asks the question, so there is no heading here.
    <div className="flex w-full flex-col gap-6 sm:max-w-135 sm:flex-row sm:items-stretch sm:gap-2">
      <ToggleGroup
        type="single"
        value={value.category ?? ""}
        onValueChange={handleCategoryChange}
        className="grid w-full grid-cols-3 gap-1.5 sm:min-w-0 sm:flex-[3] sm:gap-2"
      >
        {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
          <ToggleGroupItem key={v} value={v} className={ITEM_CLASS}>
            <Icon className="h-6 w-6" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div
        className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:gap-1"
        aria-hidden="true"
      >
        <div className="h-px flex-1 bg-border sm:h-auto sm:w-px" />
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          or
        </span>
        <div className="h-px flex-1 bg-border sm:h-auto sm:w-px" />
      </div>

      {/* Cause path: faceless — flips subject; category is set internally */}
      <ToggleGroup
        type="single"
        value={isCause ? "cause" : ""}
        onValueChange={handleCauseChange}
        className="grid w-full grid-cols-3 gap-1.5 sm:min-w-0 sm:flex-1 sm:grid-cols-1"
      >
        <ToggleGroupItem value="cause" className={ITEM_CLASS}>
          <HeartHandshake className="h-6 w-6" />
          Cause
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
