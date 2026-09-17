"use client"

import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
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
  const revealGhost = w.cachedGhosts
    ? `e.g. ${w.cachedGhosts.reveal}`
    : ph.reveal
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
          <InputGroupTextarea
            className="md:text-base"
            rows={4}
            maxLength={300}
            value={w.about}
            placeholder={aboutGhost}
            onChange={(e) => w.setAbout(e.target.value)}
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
          <InputGroupTextarea
            className="md:text-base"
            rows={4}
            maxLength={280}
            value={w.reveal}
            placeholder={revealGhost}
            onChange={(e) => w.setReveal(e.target.value)}
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-end px-3 py-1.5"
          >
            <CharCounter value={w.reveal} max={280} />
          </div>
        </InputGroup>
      </WizardField>
    </div>
  )
}
