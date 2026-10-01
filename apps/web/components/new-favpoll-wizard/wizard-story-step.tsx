"use client"

import { InputGroup } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { MentionTextarea } from "@/components/mention-textarea"
import type { MentionTarget } from "@/lib/mentions"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { WizardField } from "./wizard-field"
import { WizardGenerateButton } from "./wizard-generate-button"
import { ghostsFor } from "./wizard-placeholders"
import type { WizardState } from "./use-wizard-state"
import { FIELD_HINTS, FIELD_LABELS, FIELD_LIMITS } from "@/lib/favpoll-fields"

export function WizardStoryStep({ w }: { w: WizardState }) {
  const ph = ghostsFor(w.category)
  // Cache-only prefetch: a cached generated draft for THIS favpoll's
  // calibration set beats the static pair — contextual, zero model
  // cost. The "e.g. " prefix keeps the ghost convention.
  const aboutGhost = w.cachedGhosts ? `e.g. ${w.cachedGhosts.about}` : ph.about
  const revealGhost = w.cachedGhosts ? `e.g. ${w.cachedGhosts.note}` : ph.note
  // MENTIONS (founder, 2026-09-28): @ offers the charities and the topic
  // under the name on the card; the note also offers the favourites.
  const topic = w.topics[0]
  const aboutMentions: MentionTarget[] = [
    ...w.selectedCharities.map((c) => ({
      kind: "charity" as const,
      label: c.name,
      id: c.id,
    })),
    ...(topic ? [{ kind: "topic" as const, label: topic.title }] : []),
  ]
  const noteMentions: MentionTarget[] = [
    ...aboutMentions,
    ...(topic?.items ?? []).map((i) => ({
      kind: "item" as const,
      label: i.label,
    })),
    ...(topic?.customLabels ?? []).map((label) => ({
      kind: "item" as const,
      label,
    })),
  ]
  return (
    <div className="space-y-5">
      {/* GENERATE, in the field column (founder, 2026-09-30: "inline with
          the fields, not the label") — the first row of the step, on the
          inputs' own left edge, above the About it fills. */}
      <div className="sm:grid sm:grid-cols-[180px_1fr] sm:gap-x-6">
        <span className="hidden sm:block" aria-hidden="true" />
        <div className="min-w-0">
          <WizardGenerateButton w={w} />
        </div>
      </div>

      {/* ALWAYS-VISIBLE guidance for the two craft fields (founder,
          2026-09-17, after the Yvette session): the wizard is an
          authoring surface — a sentence of guidance changes the output,
          so it must not hide in a popover. The About hint coaches the
          note-tease: the withhold is About's job (brand doctrine), and
          cold guests need to know something is waiting. */}
      <WizardField label={FIELD_LABELS.about} required hint={FIELD_HINTS.about}>
        <InputGroup className="bg-background">
          <MentionTextarea
            rows={4}
            maxLength={FIELD_LIMITS.about}
            value={w.about}
            placeholder={aboutGhost}
            onChange={w.setAbout}
            mentions={aboutMentions}
            aria-label="About"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-end px-3 py-1.5"
          >
            <CharCounter value={w.about} max={FIELD_LIMITS.about} />
          </div>
        </InputGroup>
      </WizardField>

      <WizardField label={FIELD_LABELS.note} hint={FIELD_HINTS.note}>
        <InputGroup className="bg-background">
          <MentionTextarea
            rows={4}
            maxLength={FIELD_LIMITS.note}
            value={w.note}
            placeholder={revealGhost}
            onChange={w.setNote}
            mentions={noteMentions}
            aria-label="Personal note"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-end px-3 py-1.5"
          >
            <CharCounter value={w.note} max={FIELD_LIMITS.note} />
          </div>
        </InputGroup>
      </WizardField>

      {/* THE ENACTED SHAPE'S ONE FIELD (topic rules §D, founder 2026-10-02):
          filled, the guests' picks decide the night and every rule
          follows; empty, the memento shape. Pre-filled by Generate where
          the pairing row is enacted; the organiser sees the promise in
          their own words. Two shapes only, checked on save. */}
      <WizardField label={FIELD_LABELS.outcome} hint={FIELD_HINTS.outcome}>
        <Input
          maxLength={FIELD_LIMITS.outcome}
          value={w.outcome}
          placeholder="e.g. the top five are the board on the night"
          onChange={(e) => w.setOutcome(e.target.value)}
          aria-label="What the picks decide"
        />
      </WizardField>
    </div>
  )
}
