"use client"

import { InputGroup } from "@/components/ui/input-group"
import { MentionTextarea } from "@/components/mention-textarea"
import type { MentionTarget } from "@/lib/mentions"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { WizardField } from "./wizard-field"
import { ghostsFor } from "./wizard-placeholders"
import type { WizardState } from "./use-wizard-state"

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
      {/* ALWAYS-VISIBLE guidance for the two craft fields (founder,
          2026-09-17, after the Yvette session): the wizard is an
          authoring surface — a sentence of guidance changes the output,
          so it must not hide in a popover. The About hint coaches the
          note-tease: the withhold is About's job (brand doctrine), and
          cold guests need to know something is waiting. */}
      <WizardField
        label="About"
        required
        hint="Set the scene, link the topic and the cause. Hint at a note, if there is one."
      >
        <InputGroup className="bg-background">
          <MentionTextarea
            rows={4}
            maxLength={300}
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
            <CharCounter value={w.about} max={300} />
          </div>
        </InputGroup>
      </WizardField>

      <WizardField
        label="Personal note"
        hint="A direct quote, a memory, or a message to guests. Revealed only after a guest pledges."
      >
        <InputGroup className="bg-background">
          <MentionTextarea
            rows={4}
            maxLength={280}
            value={w.note}
            placeholder={revealGhost}
            onChange={w.setNote}
            mentions={noteMentions}
            quiet
            aria-label="Personal note"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-end px-3 py-1.5"
          >
            <CharCounter value={w.note} max={280} />
          </div>
        </InputGroup>
      </WizardField>
    </div>
  )
}
