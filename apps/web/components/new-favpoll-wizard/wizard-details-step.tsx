"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { WIZARD_INPUT_SIZE } from "./wizard-field"
import type { WizardState } from "./use-wizard-state"
import { cn } from "@/lib/utils"

const GOAL_PRESETS = [100, 250, 500]

export function WizardDetailsStep({ w }: { w: WizardState }) {
  return (
    <div className="space-y-6">
      <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="font-medium">Pledge goal</span>
        <div className="flex gap-2">
          {GOAL_PRESETS.map((g) => (
            <Button
              key={g}
              type="button"
              className="h-11 px-5 md:text-base"
              variant={w.goalAmount === g ? "default" : "outline"}
              onClick={() => {
                w.setGoalAmount(g)
                w.setGoalDraft(String(g))
              }}
            >
              £{g}
            </Button>
          ))}
          <InputGroup className={cn(WIZARD_INPUT_SIZE, "flex-1 bg-background")}>
            <InputGroupAddon align="inline-start">
              <span className="text-muted-foreground">£</span>
            </InputGroupAddon>
            <InputGroupInput
              className="md:text-base"
              inputMode="numeric"
              placeholder="other"
              aria-label="Custom goal amount"
              value={w.goalDraft}
              onChange={(e) => {
                w.setGoalDraft(e.target.value)
                const n = parseInt(e.target.value, 10)
                w.setGoalAmount(Number.isFinite(n) && n > 0 ? n : undefined)
              }}
            />
          </InputGroup>
        </div>
      </div>

      <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="font-medium">Close date</span>
        {/* The 90-day cap lives in the picker's disabled dates and the
            server-side guard — no hint sentence (prototype round 38). */}
        <DateTimePicker
          value={w.closesAt}
          onChange={w.setClosesAt}
          size="lg"
          presets={CLOSE_DATE_PRESETS}
        />
      </div>

      <label className="flex items-center justify-between gap-4 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:gap-x-6">
        <span className="font-medium">Listed</span>
        <span className="flex items-center gap-3">
          <Switch checked={w.isListed} onCheckedChange={w.setIsListed} />
          <span className="text-muted-foreground">
            appears on the public favpolls page
          </span>
        </span>
      </label>
    </div>
  )
}
