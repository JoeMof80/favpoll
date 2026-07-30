"use client"

import {
  Balloon,
  Flower2,
  Medal,
  HeartHandshake,
  Mars,
  Venus,
  NonBinary,
} from "lucide-react"
import { CoupleIcon, GroupIcon } from "@/components/icons/people"
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
  { value: "couple", label: "A couple", icon: CoupleIcon },
  { value: "group", label: "A group", icon: GroupIcon },
] as const

const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: Medal },
] as const

// px-1/text-xs on phones so five chips share one row without wrapping
// (founder screenshot, 2026-07-30); sm+ restores the roomier chip.
const WHO_ITEM_CLASS =
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-1 py-4 text-xs font-normal sm:px-4 sm:py-5 sm:text-sm [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

const CATEGORY_ITEM_CLASS =
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-1 py-4 text-xs font-normal sm:px-4 sm:py-5 sm:text-sm [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

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
      // A cause has no type: category is honestly null (deriveRegister is
      // subject-first, so the cause register needs no category plumbing).
      onChange({
        category: null,
        subject: "cause",
        grouping: "individual",
        pronoun: undefined,
      })
      return
    }
    // A cause carries category=null, so leaving it naturally starts the
    // person path with no type chosen — Next gates until one is picked.
    const category = value.category
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
    // Touch either side of the OR and you're on that side: picking a type
    // while "A cause" is selected hops back to the person path (cause
    // deselects, who empties, Next re-gates until a who is chosen). The
    // step's questions stay answerable in any order — no dead controls.
    if (value.subject === "cause") {
      onChange({
        category: v as FavpollCategory,
        subject: "someone",
        grouping: "individual",
        pronoun: undefined,
      })
      return
    }
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
        className="grid w-full grid-cols-5 gap-1.5 sm:gap-2"
      >
        {PERSON_OPTIONS.map(({ value: v, label, icon: Icon }) => (
          <ToggleGroupItem key={v} value={v} className={WHO_ITEM_CLASS}>
            <Icon className="h-6 w-6" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* …and how you're honouring them. Always live (any-order answering is
          the step's grammar); a cause carries category=null so nothing shows
          selected, and clicking a chip hops back to the person path. */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          What type of favpoll is this?
        </p>
        <ToggleGroup
          type="single"
          value={value.category ?? ""}
          onValueChange={handleCategoryChange}
          className="grid w-full max-w-100 grid-cols-3 gap-1.5 sm:gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
            <ToggleGroupItem key={v} value={v} className={CATEGORY_ITEM_CLASS}>
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
        className="grid w-full grid-cols-5 gap-1.5 sm:gap-2"
      >
        <ToggleGroupItem value="cause" className={WHO_ITEM_CLASS}>
          <HeartHandshake className="h-6 w-6" />A cause
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
