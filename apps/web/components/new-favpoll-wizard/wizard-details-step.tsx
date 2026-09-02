"use client"

import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { WIZARD_INPUT_SIZE } from "./wizard-field"
import type { WizardState, WizardVisibility } from "./use-wizard-state"
import { cn } from "@/lib/utils"

const GOAL_PRESETS = [100, 250, 500]

// The three-notch visibility axis (listed ⊃ unlisted ⊃ private) as one
// control — two stacked switches would leave the hierarchy illegible.
const VISIBILITY_OPTIONS: {
  value: WizardVisibility
  label: string
  hint: string
}[] = [
  {
    value: "listed",
    label: "Listed",
    hint: "Appears on the public favpolls page.",
  },
  {
    value: "unlisted",
    label: "Link only",
    hint: "Only people with the link can find it.",
  },
  {
    value: "private",
    label: "Private",
    hint: "Guests must sign in; shared links preview no details.",
  },
]

export function WizardDetailsStep({ w }: { w: WizardState }) {
  return (
    <div className="space-y-6">
      {/* sm:min-h-11 on every row: the controls differ in height (h-11
          buttons, h-10 picker, a bare switch) and the labels are centered,
          so without one shared row height the equal gaps read unevenly. */}
      <div className="block space-y-1.5 text-sm sm:grid sm:min-h-11 sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
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

      <div className="block space-y-1.5 text-sm sm:grid sm:min-h-11 sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="font-medium">
          Close date<span className="text-muted-foreground"> *</span>
        </span>
        {/* The 90-day cap lives in the picker's disabled dates and the
            server-side guard — no hint sentence (prototype round 38). */}
        <DateTimePicker
          value={w.closesAt}
          onChange={w.setClosesAt}
          size="lg"
          presets={CLOSE_DATE_PRESETS}
        />
      </div>

      {/* items-start + a min-h-11 label box: the hint line makes this the
          one row taller than its control, so centering the label against
          the whole cell would break the even label rhythm — anchor it to
          the toggle bar's 44px line instead. */}
      <div className="block space-y-1.5 text-sm sm:grid sm:min-h-11 sm:grid-cols-[180px_1fr] sm:items-start sm:space-y-0 sm:gap-x-6">
        <span className="font-medium sm:flex sm:min-h-11 sm:items-center">
          Visibility
        </span>
        <div className="space-y-1.5">
          {/* SegmentedControl — the /favpolls toolbar's own status control
              (founder, 2026-09-01: "use this UI"), replacing the fused
              toggle-group bar. */}
          <SegmentedControl
            size="lg"
            label="Who can see this favpoll"
            value={w.visibility}
            onChange={(v) => w.setVisibility(v as WizardVisibility)}
            options={VISIBILITY_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            className="w-fit"
          />
          <p className="text-muted-foreground">
            {VISIBILITY_OPTIONS.find((o) => o.value === w.visibility)?.hint}
          </p>
        </div>
      </div>
    </div>
  )
}
