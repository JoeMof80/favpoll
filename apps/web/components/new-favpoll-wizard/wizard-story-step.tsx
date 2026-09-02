"use client"

import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { WizardField } from "./wizard-field"
import { ghostsFor } from "./wizard-placeholders"
import type { WizardState } from "./use-wizard-state"

export function WizardStoryStep({ w }: { w: WizardState }) {
  const ph = ghostsFor(w.category)
  return (
    <div className="space-y-5">
      <WizardField
        label="About"
        required
        info={
          w.isCause
            ? "What you're raising for — and why it matters to you."
            : "Introduce them in a sentence or two. Specific, personal details land harder than a list of facts."
        }
      >
        <InputGroup className="bg-background">
          <InputGroupTextarea
            className="md:text-base"
            rows={4}
            maxLength={300}
            value={w.about}
            placeholder={ph.about}
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
        label="The reveal"
        info="A quote in their own words, a memory, or a message to guests — one sentence, with a detail only you'd know."
      >
        <InputGroup className="bg-background">
          <InputGroupTextarea
            className="md:text-base"
            rows={4}
            maxLength={280}
            value={w.reveal}
            placeholder={ph.reveal}
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
