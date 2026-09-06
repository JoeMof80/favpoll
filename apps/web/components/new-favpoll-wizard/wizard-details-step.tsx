"use client"

import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { WizardField, WIZARD_INPUT_SIZE } from "./wizard-field"
import type { WizardState, WizardVisibility } from "./use-wizard-state"
import { cn } from "@/lib/utils"

const GOAL_PRESETS = [100, 250, 500, 1000]

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
      {/* Every row is a WizardField (founder, 2026-09-06: the hand-rolled
          rows' inline labels sat flush on mobile, unlike the other steps
          — one grammar, no drift). */}
      <WizardField label="Pledge goal">
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((g) => (
            <Button
              key={g}
              type="button"
              className="h-11 px-3.5 md:text-base"
              variant={w.goalAmount === g ? "default" : "outline"}
              onClick={() => {
                w.setGoalAmount(g)
                w.setGoalDraft(String(g))
              }}
            >
              £{g.toLocaleString("en-GB")}
            </Button>
          ))}
          <InputGroup className={cn(WIZARD_INPUT_SIZE, "w-28 bg-background")}>
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
      </WizardField>

      {/* The 90-day cap lives in the picker's disabled dates and the
          server-side guard — no hint sentence (prototype round 38). */}
      <WizardField label="Close date" required>
        {w.appeal?.closesAt ? (
          // Inherited from the appeal and locked — one event, one
          // announcement moment (concept decision, 2026-09-05).
          <p className="flex min-h-11 items-center text-base text-foreground">
            {w.closesAt?.toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="ml-2 text-sm text-muted-foreground">
              — set by {w.appeal.name}
            </span>
          </p>
        ) : (
          <DateTimePicker
            value={w.closesAt}
            onChange={w.setClosesAt}
            size="lg"
            presets={CLOSE_DATE_PRESETS}
          />
        )}
      </WizardField>

      <WizardField
        label="Visibility"
        hint={VISIBILITY_OPTIONS.find((o) => o.value === w.visibility)?.hint}
      >
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
      </WizardField>

      {/* Decided here, overridable mid-event from the manage toolbar
          (founder, 2026-09-03). Not a rail line: the rail lists the
          authored facts, and a default-on toggle isn't one. */}
      <WizardField
        label="Guest additions"
        hint={
          w.allowGuestItems
            ? "Guests can add their own favourites to the topic."
            : "Only your favourites appear."
        }
      >
        {/* The switch is shorter than the 44px control line, so it takes
            its own min-h-11 centring box. */}
        <div className="flex min-h-11 items-center">
          <Switch
            checked={w.allowGuestItems}
            onCheckedChange={w.setAllowGuestItems}
            aria-label="Guests can add favourites"
          />
        </div>
      </WizardField>
    </div>
  )
}
