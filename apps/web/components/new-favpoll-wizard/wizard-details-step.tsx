"use client"

import { SegmentedControl } from "@/components/ui/segmented-control"
import { SwitchLine } from "@/components/ui/switch-line"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { GoalPicker } from "@/components/favpoll-form/goal-picker"
import {
  FIELD_LABELS,
  VISIBILITY_OPTIONS,
  guestAdditionsSentence,
  showDonationsSentence,
  visibilityHint,
} from "@/lib/favpoll-fields"
import { WizardField } from "./wizard-field"
import type { WizardState, WizardVisibility } from "./use-wizard-state"

export function WizardDetailsStep({ w }: { w: WizardState }) {
  return (
    <div className="space-y-6">
      {/* Every row is a WizardField (founder, 2026-09-06: the hand-rolled
          rows' inline labels sat flush on mobile, unlike the other steps
          — one grammar, no drift). */}
      <WizardField label={FIELD_LABELS.goal}>
        <GoalPicker
          amount={w.goalAmount ?? null}
          draft={w.goalDraft}
          onChange={(n, draft) => {
            w.setGoalAmount(n ?? undefined)
            w.setGoalDraft(draft)
          }}
        />
      </WizardField>

      {/* The 90-day cap lives in the picker's disabled dates and the
          server-side guard — no hint sentence (prototype round 38). */}
      <WizardField label={FIELD_LABELS.closeDate} required>
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
        label={FIELD_LABELS.visibility}
        hint={visibilityHint(w.visibility)}
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
      {/* The sentence is the switch's label, beside it (founder,
          2026-09-30) — not a hint two lines below. */}
      <WizardField label={FIELD_LABELS.guestAdditions}>
        <SwitchLine
          checked={w.allowGuestItems}
          onCheckedChange={w.setAllowGuestItems}
        >
          {guestAdditionsSentence(w.allowGuestItems)}
        </SwitchLine>
      </WizardField>

      <WizardField label={FIELD_LABELS.showDonations}>
        <SwitchLine
          checked={w.showGuestAmounts}
          onCheckedChange={w.setShowGuestAmounts}
        >
          {showDonationsSentence(w.showGuestAmounts)}
        </SwitchLine>
      </WizardField>
    </div>
  )
}
