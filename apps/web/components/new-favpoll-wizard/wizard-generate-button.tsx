"use client"

import {
  Check,
  ChevronDown,
  Mars,
  NonBinary,
  Ribbon,
  Venus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GroupIcon, PairIcon } from "@/components/icons/people"
import type { WhoValue } from "@/lib/who"
import type { WizardState } from "./use-wizard-state"

// THE WHO MENU LIVES ON GENERATE NOW (founder, 2026-09-02, option B):
// generation is the one consumer that degrades without a who, so the
// selector sits exactly where it is required — the prefix half of a
// split button. Its old home, a ghost icon inside the name field's end
// addon, was easily missed; the who-variable placeholder ghosts it fed
// retired with the move (see wizard-placeholders.ts).
//
// The gendered icons (f8bff8f) and the founder-drawn Pair/Group figures
// (components/icons/people.tsx). The trigger is the PREFIX half
// (founder, 2026-09-02): the chevron alone until a who is chosen, then
// the selection's icon joins it. (The neutral person placeholder was
// tried and cut same day; a chevron-less trigger read as a button, not
// a menu.) THE SEAM: every Button wears an invisible 1px border with
// bg-clip-padding, so two flush halves still showed ~2px of page
// between their clipped backgrounds — border-0 on both, with an
// explicit 1px divider element between (founder, 2026-09-02: "why
// still a gap?").
const WHO_ICONS: Record<WhoValue, React.ElementType> = {
  he: Mars,
  she: Venus,
  they: NonBinary,
  couple: PairIcon,
  group: GroupIcon,
  cause: Ribbon,
}

const WHO_LABELS: Record<WhoValue, string> = {
  he: "He",
  she: "She",
  they: "They",
  couple: "Pair",
  group: "Group",
  cause: "Cause",
}

const PRONOUN_ORDER: WhoValue[] = ["he", "she", "they", "couple", "group"]

export function WizardGenerateButton({ w }: { w: WizardState }) {
  const WhoIcon = w.who ? WHO_ICONS[w.who] : null
  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={
              w.who ? `Who: ${WHO_LABELS[w.who]}` : "Who is this favpoll for?"
            }
            className="rounded-r-none border-0 px-2"
          >
            {WhoIcon && <WhoIcon className="h-4 w-4" aria-hidden="true" />}
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {PRONOUN_ORDER.map((k) => {
            const Icon = WHO_ICONS[k]
            return (
              <DropdownMenuItem key={k} onClick={() => w.handleWho(k)}>
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{WHO_LABELS[k]}</span>
                {w.who === k && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            )
          })}
          {/* Cause only under Fundraiser — a memorial or celebration is
              definitionally about someone, and subject "cause" would
              override the chosen type in deriveRegister. The who check
              keeps a prefilled cause representable in edit mode whatever
              its stored category. */}
          {(w.category === "fundraiser" || w.who === "cause") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => w.handleWho("cause")}>
                <Ribbon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Cause</span>
                {w.who === "cause" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <span aria-hidden="true" className="w-px self-stretch bg-primary/15" />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={w.generating || w.topics.length === 0}
        onClick={w.generateExample}
        className="rounded-l-none border-0"
      >
        {w.generating ? "Generating…" : "✦ Generate an example"}
      </Button>
    </div>
  )
}
