"use client"

import { Balloon, Flower2, Medal } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FavpollCategory } from "@favpoll/types"

type Props = {
  value: FavpollCategory | null
  onChange: (value: FavpollCategory) => void
}

// One axis, three answers: what KIND of favpoll is this.
//
// Cause used to sit here too, behind an `or` divider — a fork between two
// complete answers. It has moved to the Generate control's who step
// (2026-08-25), because it belongs to a different axis: Cause answers WHO
// (no one — a faceless cause), while these three answer WHAT KIND. They
// are not alternatives, which is why a marathon runner is a person AND a
// fundraiser and keeps their name. The who refinements (pronoun,
// pair/group) left for the same control on 2026-07-30; Cause is the last
// of the who axis to follow them.
const CATEGORY_OPTIONS = [
  { value: "celebration", label: "Celebration", icon: Balloon },
  { value: "memorial", label: "Memorial", icon: Flower2 },
  { value: "fundraiser", label: "Fundraiser", icon: Medal },
] as const

const ITEM_CLASS =
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-1 py-4 text-xs font-normal sm:px-4 sm:py-5 sm:text-sm [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"

export function EventStep({ value, onChange }: Props) {
  // The step-shell guidance asks the question, so there is no heading here.
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(v) => v && onChange(v as FavpollCategory)}
      className="grid w-full grid-cols-3 gap-1.5 sm:gap-2"
    >
      {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon }) => (
        <ToggleGroupItem key={v} value={v} className={ITEM_CLASS}>
          <Icon className="h-6 w-6" />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
