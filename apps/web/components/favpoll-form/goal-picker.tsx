"use client"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { WIZARD_INPUT_SIZE } from "@/components/new-favpoll-wizard/wizard-field"
import { GOAL_PRESETS } from "@/lib/favpoll-fields"
import { cn } from "@/lib/utils"

// THE PLEDGE GOAL, one control for the wizard and the manage page
// (2026-09-30): preset amounts as buttons, and a box for any other.
// The caller owns both the amount and the box's raw text, so the
// wizard's state and the manage page's self-saving row read the same.

export function GoalPicker({
  amount,
  draft,
  onChange,
  onBlur,
  disabled,
}: {
  amount: number | null
  /** The box's raw text — kept apart from the amount so "12" mid-type
   *  isn't rounded away. */
  draft: string
  onChange: (amount: number | null, draft: string) => void
  onBlur?: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GOAL_PRESETS.map((g) => (
        <Button
          key={g}
          type="button"
          className="h-11 px-3.5 md:text-base"
          variant={amount === g ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onChange(g, String(g))}
        >
          £{g}
        </Button>
      ))}
      <InputGroup
        className={cn(WIZARD_INPUT_SIZE, "min-w-28 flex-1 bg-background")}
      >
        <InputGroupAddon align="inline-start">
          <span className="text-muted-foreground">£</span>
        </InputGroupAddon>
        <InputGroupInput
          className="md:text-base"
          inputMode="numeric"
          placeholder="other"
          aria-label="Custom goal amount"
          value={draft}
          disabled={disabled}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10)
            onChange(Number.isFinite(n) && n > 0 ? n : null, e.target.value)
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
        />
      </InputGroup>
    </div>
  )
}
