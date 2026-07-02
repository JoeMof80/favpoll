"use client"

import {
  Users,
  UsersRound,
  Balloon,
  Flower2,
  PiggyBank,
  Ribbon,
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

const WHO_OPTIONS = [
  { value: "he", label: "He", icon: Mars },
  { value: "she", label: "She", icon: Venus },
  { value: "they", label: "They", icon: NonBinary },
  { value: "couple", label: "A couple", icon: Users },
  { value: "group", label: "A group", icon: UsersRound },
  { value: "cause", label: "A cause", icon: Ribbon },
] as const

const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: PiggyBank },
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
      onChange({
        ...value,
        subject: "cause",
        grouping: "individual",
        pronoun: undefined,
      })
    } else if (v === "couple") {
      onChange({
        ...value,
        subject: "someone",
        grouping: "couple",
        pronoun: undefined,
      })
    } else if (v === "group") {
      onChange({
        ...value,
        subject: "someone",
        grouping: "group",
        pronoun: undefined,
      })
    } else {
      onChange({
        ...value,
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

  return (
    <div className="flex flex-col gap-8">
      {/* Who row */}
      <ToggleGroup
        type="single"
        value={whoToggleValue}
        onValueChange={handleWhoChange}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {WHO_OPTIONS.map(({ value: v, label, icon: Icon }) => (
          <ToggleGroupItem key={v} value={v} className={WHO_ITEM_CLASS}>
            <Icon className="h-6 w-6" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Category row */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          What type of favpoll is this?
        </p>
        <ToggleGroup
          type="single"
          value={value.category ?? ""}
          onValueChange={handleCategoryChange}
          className="flex flex-wrap gap-2"
        >
          {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
            <ToggleGroupItem key={v} value={v} className={CATEGORY_ITEM_CLASS}>
              <Icon className="h-6 w-6" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
