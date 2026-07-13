"use client"

import {
  Users,
  UsersRound,
  Balloon,
  Flower2,
  Flag,
  HeartHandshake,
  Mars,
  Venus,
  NonBinary,
} from "lucide-react"
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

// The Who axis forks: five person options set pronoun/grouping on
// subject="someone"; "A cause" flips subject entirely (faceless — no
// protagonist). The OR divider makes the fork visible, per the triad's
// territory reading: this step decides whether honour applies.
const PERSON_OPTIONS = [
  { value: "he", label: "He", icon: Mars },
  { value: "she", label: "She", icon: Venus },
  { value: "they", label: "They", icon: NonBinary },
  { value: "couple", label: "A couple", icon: Users },
  { value: "group", label: "A group", icon: UsersRound },
] as const

const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: Flag },
] as const

const WHO_ITEM_CLASS =
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-4 py-5 text-sm font-normal [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

const CATEGORY_ITEM_CLASS =
  "flex h-auto w-32 flex-col items-center gap-2 rounded-xl border border-border bg-background px-4 py-5 text-sm font-normal [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

function deriveToggleValue(
  subject: FavpollSubject,
  grouping: FavpollGrouping,
  pronoun: Pronoun | undefined
): string {
  if (subject === "cause") return "cause"
  if (grouping === "couple") return "couple"
  if (grouping === "group") return "group"
  if (pronoun) return pronoun
  return ""
}

export function HonourStep({ value, onChange }: Props) {
  const whoToggleValue = deriveToggleValue(
    value.subject,
    value.grouping,
    value.pronoun
  )

  function handleWhoChange(v: string) {
    if (!v) return
    if (v === "cause") {
      // A faceless cause is a fundraiser by definition — the only category
      // that derives the cause register. Set it here so the type question
      // needn't be asked (deriveRegister maps memorial→remembering and
      // celebration→celebrating_*, both of which presume a protagonist).
      onChange({
        category: "fundraiser",
        subject: "cause",
        grouping: "individual",
        pronoun: undefined,
      })
      return
    }
    // Leaving "A cause" discards its auto-set category — the organiser
    // should choose a type for a person explicitly, not inherit one.
    const category = value.subject === "cause" ? null : value.category
    if (v === "couple") {
      onChange({
        category,
        subject: "someone",
        grouping: "couple",
        pronoun: undefined,
      })
    } else if (v === "group") {
      onChange({
        category,
        subject: "someone",
        grouping: "group",
        pronoun: undefined,
      })
    } else {
      onChange({
        category,
        subject: "someone",
        grouping: "individual",
        pronoun: v as Pronoun,
      })
    }
  }

  function handleCategoryChange(v: string) {
    if (!v) return
    onChange({ ...value, category: v as FavpollCategory })
  }

  const isCause = value.subject === "cause"

  return (
    <div className="flex flex-col gap-8">
      {/* Person path: who… */}
      <ToggleGroup
        type="single"
        value={isCause ? "" : whoToggleValue}
        onValueChange={handleWhoChange}
        className="grid w-full grid-cols-4 gap-2 sm:grid-cols-5"
      >
        {PERSON_OPTIONS.map(({ value: v, label, icon: Icon }) => (
          <ToggleGroupItem key={v} value={v} className={WHO_ITEM_CLASS}>
            <Icon className="h-6 w-6" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* …and how you're honouring them. Dimmed (never hidden — no layout
          shift) when the cause path is taken, and it must show NO selection
          then: the plumbing category is not a chip choice. */}
      <div
        className={`flex flex-col gap-3 transition-opacity ${
          isCause ? "opacity-40" : ""
        }`}
      >
        <p className="text-sm text-muted-foreground">
          What type of favpoll is this?
        </p>
        <ToggleGroup
          type="single"
          value={isCause ? "" : (value.category ?? "")}
          onValueChange={handleCategoryChange}
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
            <ToggleGroupItem
              key={v}
              value={v}
              disabled={isCause}
              className={CATEGORY_ITEM_CLASS}
            >
              <Icon className="h-6 w-6" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* OR — the fork between two complete answers: honouring someone
          (who + type, above) or backing a cause (below, no type needed). */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Cause path: faceless — flips subject; category is set internally */}
      <ToggleGroup
        type="single"
        value={isCause ? "cause" : ""}
        onValueChange={handleWhoChange}
        className="grid w-full grid-cols-4 gap-2 sm:grid-cols-5"
      >
        <ToggleGroupItem value="cause" className={WHO_ITEM_CLASS}>
          <HeartHandshake className="h-6 w-6" />A cause
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
