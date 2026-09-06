"use client"

import { Balloon, Flower2, Medal } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FavpollCategory } from "@favpoll/types"
import { cn } from "@/lib/utils"
import {
  REGISTER_LINK_HOVER,
  REGISTER_LINK_INK,
} from "@/components/register-link"
import type { RegisterPalette } from "@/lib/register-palette"

type Props = {
  value: FavpollCategory | null
  onChange: (value: FavpollCategory) => void
  /** Locked (edit with pledges): the cards stay visible — the chosen
      one keeps its pill — but take no clicks (founder, 2026-09-06). */
  disabled?: boolean
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
//
// EACH IN ITS OWN COLOUR (founder, 2026-08-31: "brand each of the buttons").
// A data-register on the item scopes its palette, so the icon and label are
// purple, magenta, green — the register-ink idiom the header links and the
// home cards use: white, the register as ink, its pale tint on hover, and
// the chosen one in a pill of its own colour. Once chosen, the whole wizard
// wears that register (NewFavpollWizard).
const CATEGORY_OPTIONS = [
  {
    value: "celebration",
    label: "Celebration",
    icon: Balloon,
    palette: "celebration",
  },
  {
    value: "fundraiser",
    label: "Fundraiser",
    icon: Medal,
    palette: "fundraiser",
  },
  { value: "memorial", label: "Memorial", icon: Flower2, palette: "memorial" },
] as const satisfies readonly {
  value: FavpollCategory
  label: string
  icon: unknown
  palette: RegisterPalette
}[]

const ITEM_CLASS = cn(
  "flex h-auto w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-1 py-4 text-xs font-normal sm:px-4 sm:py-5 sm:text-sm [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0",
  REGISTER_LINK_INK,
  REGISTER_LINK_HOVER,
  // Dark: an OUTLINED chip on the page, tinted text — not a solid tile of
  // the register's dark page colour, which is what a scoped bg-background
  // gives and was too heavy beside the header's treatment.
  "dark:border-chart-2/40 dark:bg-transparent",
  "data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:font-medium dark:data-[state=on]:border-chart-2 dark:data-[state=on]:bg-chart-2/15"
)

export function EventStep({ value, onChange, disabled = false }: Props) {
  // The step-shell guidance asks the question, so there is no heading here.
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(v) => v && onChange(v as FavpollCategory)}
      className="grid w-full grid-cols-3 gap-1.5 sm:gap-2"
    >
      {CATEGORY_OPTIONS.map(({ value: v, label, icon: Icon, palette }) => (
        <ToggleGroupItem
          key={v}
          value={v}
          disabled={disabled}
          data-register={palette}
          className={ITEM_CLASS}
        >
          <Icon className="h-6 w-6" />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
