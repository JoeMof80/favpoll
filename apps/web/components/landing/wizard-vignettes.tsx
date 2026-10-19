"use client"

// THE ORGANISER'S SIDE OF HOW IT WORKS (prototype, founder 2026-10-19:
// "Maybe 'How it works' should be more organiser oriented as in the process
// of creating a favpoll"). The home hero now shows the GUEST's journey in
// sixteen seconds, so a walkthrough that narrated the same journey a screen
// lower was the hero told twice. These four panes show the MAKING of a
// favpoll instead, in the wizard's own order — occasion, charity, topic,
// story — each the wizard's own step inside the browser frame. The frame is
// deliberate: the guest is shown on a phone, the organiser at a desk, and
// the chrome says which actor a beat belongs to before a word is read.
//
// THE REAL PARTS (founder, same day: the first cut "jars slightly compared
// to the stationery and live display and keepsake which are realistic"):
// the wizard's own step rail, its charity card, its topic card, its field
// and its nav, laid out on the wizard's own 320px-rail grid at a desktop
// width and scaled, exactly as the room is the real display page scaled.
// Inert throughout: a still of the step, not a working copy of it.
//
// ONE FAVPOLL THROUGHOUT (founder: "you've used the memorial example when
// the retained section is for St Luke's fundraiser"): every pane derives
// from the SCENE the card, the room and the keepsake show, so the organiser
// is seen making exactly the favpoll the later beats hold.

import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { WizardStepRail } from "@/components/new-favpoll-wizard/wizard-step-rail"
import { WizardStepShell } from "@/components/new-favpoll-wizard/wizard-step-shell"
import { WizardCharityCard } from "@/components/new-favpoll-wizard/wizard-charity-card"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import { WizardField } from "@/components/new-favpoll-wizard/wizard-field"
import { WizardNav } from "@/components/new-favpoll-wizard/wizard-nav"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import type { Charity, Favourite, FavpollCategory } from "@favpoll/types"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

export type WizardPane = "event" | "charity" | "topic" | "story"

/** The pane's natural size — the wizard at a laptop width, scaled by the
 *  caller. 320px of rail plus the step at the wizard's own padding. */
export const WIZARD_VIGNETTE_W = 960
export const WIZARD_VIGNETTE_H = 540

const CATEGORY_LABEL: Record<FavpollCategory, string> = {
  memorial: "Memorial",
  celebration: "Celebration",
  fundraiser: "Fundraiser",
}

const categoryFor = (scene: HeroScene): FavpollCategory =>
  scene.kind === "memorial"
    ? "memorial"
    : scene.kind === "celebration"
      ? "celebration"
      : "fundraiser"

const noop = () => {}

function Step({ pane, scene }: { pane: WizardPane; scene: HeroScene }) {
  const own = scene.charities[0]
  const charity = {
    id: own.id,
    name: own.name,
    registered_number: own.registered_number,
    logo_url: own.logo_url,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    consent_status: "approved",
  } as unknown as Charity
  const isCause = !scene.protagonist
  const storyName = scene.protagonist?.name ?? scene.heading ?? ""
  const storyContext = scene.protagonist?.context ?? scene.context ?? ""
  const storyAbout = scene.protagonist?.about ?? scene.blurb ?? ""

  if (pane === "event") {
    return (
      <WizardStepShell title={STEP_LABELS.event}>
        <EventStep value={categoryFor(scene)} onChange={noop} disabled />
      </WizardStepShell>
    )
  }
  if (pane === "charity") {
    return (
      <WizardStepShell title={STEP_LABELS.charity}>
        <WizardCharityCard charities={[charity]} onPickAnother={noop} />
      </WizardStepShell>
    )
  }
  if (pane === "topic") {
    return (
      <WizardStepShell title={STEP_LABELS.topic}>
        <WizardTopicCard
          topic={{
            topicId: scene.poll.id,
            title: scene.poll.topic.title,
            isCustom: false,
            items: scene.poll.topic.favourites.map((f) => ({
              id: f.id,
              label: f.label,
            })),
            customLabels: [],
          }}
          sortedExistingItems={
            scene.poll.topic.favourites.map((f) => ({
              id: f.id,
              label: f.label,
            })) as unknown as Favourite[]
          }
          customLabels={[]}
          showItemsSection
          onEdit={noop}
          onOpenItemsDialog={noop}
        />
      </WizardStepShell>
    )
  }
  return (
    <WizardStepShell title={STEP_LABELS.story}>
      <div className="space-y-5">
        <WizardField label={isCause ? "Cause" : "Name"} required>
          <Input readOnly tabIndex={-1} value={storyName} />
        </WizardField>
        <WizardField label={isCause ? "Event" : "Dates"}>
          <Input readOnly tabIndex={-1} value={storyContext} />
        </WizardField>
        <WizardField label="About">
          <Textarea
            readOnly
            tabIndex={-1}
            rows={3}
            value={storyAbout}
            className="resize-none"
          />
        </WizardField>
        <WizardField
          label="Your note"
          hint="Revealed to a guest once they have pledged."
        >
          <Textarea
            readOnly
            tabIndex={-1}
            rows={2}
            value={scene.poll.personal_note}
            className="resize-none"
          />
        </WizardField>
      </div>
    </WizardStepShell>
  )
}

export function WizardVignette({
  pane,
  scene,
}: {
  pane: WizardPane
  scene: HeroScene
}) {
  const current = pane as WizardStep
  const idx = STEPS.indexOf(current)
  const done = Object.fromEntries(
    STEPS.map((s) => [s, STEPS.indexOf(s) < idx])
  ) as Record<WizardStep, boolean>
  // The rail's one-line answers for the steps already taken, as the wizard
  // writes them.
  const answers: Partial<Record<WizardStep, string[]>> = {
    event: [CATEGORY_LABEL[categoryFor(scene)]],
    charity: [scene.charities[0].name],
    topic: [scene.poll.topic.title],
  }
  const summary = Object.fromEntries(
    STEPS.map((s) => [s, done[s] ? (answers[s] ?? []) : []])
  ) as Record<WizardStep, string[]>

  return (
    <div
      data-testid="wizard-vignette"
      data-pane={pane}
      inert
      className="pointer-events-none text-foreground select-none"
      style={{ width: WIZARD_VIGNETTE_W, height: WIZARD_VIGNETTE_H }}
    >
      <DemoFrame className="h-full overflow-hidden bg-background">
        {/* The wizard's own grid (index.tsx): 320px of rail, the step
            beside it. The rail is `hidden md:flex` for the phone's
            progress strip; inside this scaled box it is always the rail. */}
        <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] overflow-hidden rounded-b-xl border border-t-0 border-border bg-background [&>div:first-child>div]:flex!">
          <div className="min-h-0">
            <WizardStepRail
              currentStep={current}
              summary={summary}
              done={done}
            />
          </div>
          <div className="min-h-0 overflow-hidden px-12 pt-6 pb-10">
            <div className="mx-auto w-full max-w-2xl">
              <Step pane={pane} scene={scene} />
              <WizardNav
                isFirst={pane === "event"}
                isLast={false}
                nextDisabled={false}
                onBack={noop}
                onNext={noop}
                onFinish={noop}
              />
            </div>
          </div>
        </div>
      </DemoFrame>
    </div>
  )
}
