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
// THE RAIL, COMPACT (founder, 2026-10-19: "reduce the width of the rail and
// omit the listed items underneath each step header"): the real rail's
// stations — its icons, its filled/outline/ghost buttons, its spine, its
// labels and done ticks — on a 200px rail with no answer slots beneath. The
// real WizardStepRail reserves four lines per station, which is taller than
// this frame, so the slots are the one thing not copied.
function Rail({
  current,
  done,
}: {
  current: WizardStep
  done: Record<WizardStep, boolean>
}) {
  return (
    <div className="flex h-full flex-col bg-primary/10 p-5">
      <div className="relative flex flex-1 flex-col justify-around">
        {/* The spine, station centre to station centre: the 28px button's
            half, inside the column. */}
        <span
          aria-hidden="true"
          className="absolute top-[14px] bottom-[14px] left-[11.5px] w-px bg-primary"
        />
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === current
          const reachable = done[s]
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span className="relative -ml-0.5 shrink-0">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-background"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary/10"
                />
                <Button
                  type="button"
                  tabIndex={-1}
                  size="icon-sm"
                  variant={
                    isActive ? "default" : reachable ? "outline" : "ghost"
                  }
                  className={cn(
                    "relative h-7 w-7 shrink-0 rounded-full",
                    reachable && !isActive && "border-primary bg-transparent"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4", !isActive && "text-primary")}
                  />
                </Button>
              </span>
              <p className="text-sm font-medium tracking-widest text-primary uppercase">
                {STEP_LABELS[s]}
              </p>
              {done[s] && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ONE FAVPOLL THROUGHOUT (founder: "you've used the memorial example when
// the retained section is for St Luke's fundraiser"): every pane derives
// from the SCENE the card, the room and the keepsake show, so the organiser
// is seen making exactly the favpoll the later beats hold.

import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { Check } from "lucide-react"
import { STEP_ICONS } from "@/components/new-favpoll-wizard/wizard-step-rail"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WizardStepShell } from "@/components/new-favpoll-wizard/wizard-step-shell"
import { WizardCharityCard } from "@/components/new-favpoll-wizard/wizard-charity-card"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import { WizardField } from "@/components/new-favpoll-wizard/wizard-field"
import { WizardNav } from "@/components/new-favpoll-wizard/wizard-nav"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import { FIELD_LABELS, nameLabel } from "@/lib/favpoll-fields"
import type { RegisterPalette } from "@/lib/register-palette"
import type { Charity, Favourite, FavpollCategory } from "@favpoll/types"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

export type WizardPane = "event" | "charity" | "topic" | "info" | "story"

/** The pane's natural size — the wizard in a 768px window, which the
 *  caller scales to the column at a quarter MORE than a 960px window would
 *  get (founder, 2026-10-19: "the content is harder to read at this size.
 *  Maybe we can zoom the content to e.g. 125%"). Laid out small and scaled
 *  up rather than CSS-zoomed: zoom let the rail lay out taller than the
 *  frame and clipped its last stations. 320px of rail, the step beside. */
export const WIZARD_VIGNETTE_W = 768
export const WIZARD_VIGNETTE_H = 512

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
  const category = categoryFor(scene)
  const storyName = scene.protagonist?.name ?? scene.heading ?? ""
  const storyContext = scene.protagonist?.context ?? scene.context ?? ""
  const storyAbout = scene.protagonist?.about ?? scene.blurb ?? ""
  const photoUrl = scene.protagonist?.photo_url ?? scene.photo_url ?? null

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
  if (pane === "info") {
    // THE HEADER STEP (founder, 2026-10-19: "create an extra step for
    // header, in the interests of accuracy"): the wizard's own fields in
    // its own order — opening line, name or cause, context, the photo.
    return (
      <WizardStepShell title={STEP_LABELS.info}>
        <div className="space-y-5">
          <WizardField label={FIELD_LABELS.openingLine}>
            <Input readOnly tabIndex={-1} value={scene.opening_line ?? ""} />
          </WizardField>
          <WizardField
            label={nameLabel(isCause ? "cause" : "someone", category)}
            required
          >
            <Input readOnly tabIndex={-1} value={storyName} />
          </WizardField>
          <WizardField label={FIELD_LABELS.context}>
            <Input readOnly tabIndex={-1} value={storyContext} />
          </WizardField>
          <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
            <span className="block font-medium">{FIELD_LABELS.photo}</span>
            {/* The avatar IS the button in the real step: the same
                rounded-xl slot, holding the scene's photo. */}
            <span className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>
          </div>
        </div>
      </WizardStepShell>
    )
  }
  return (
    <WizardStepShell title={STEP_LABELS.story}>
      <div className="space-y-5">
        <WizardField label={FIELD_LABELS.about} required>
          <Textarea
            readOnly
            tabIndex={-1}
            rows={3}
            value={storyAbout}
            className="resize-none"
          />
        </WizardField>
        <WizardField
          label={FIELD_LABELS.note}
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
  palette,
}: {
  pane: WizardPane
  scene: HeroScene
  /** The register the wizard is drawn in. The browser frame around it
   *  stays neutral — the TV's bezel is not themed either (founder,
   *  2026-10-19: "lets not make the browser frame themed"). */
  palette: RegisterPalette
}) {
  const current = pane as WizardStep
  const idx = STEPS.indexOf(current)
  const done = Object.fromEntries(
    STEPS.map((s) => [s, STEPS.indexOf(s) < idx])
  ) as Record<WizardStep, boolean>

  return (
    <div
      data-testid="wizard-vignette"
      data-pane={pane}
      inert
      className="pointer-events-none text-foreground select-none"
      style={{ width: WIZARD_VIGNETTE_W, height: WIZARD_VIGNETTE_H }}
    >
      <DemoFrame className="h-full overflow-hidden bg-background">
        {/* The wizard's own grid (index.tsx) with the rail at 200px rather
            than 320: the step beside it. */}
        <div
          data-register={palette}
          // The register alone: it has light and dark palettes of its own,
          // and the vignette follows the visitor's theme like any browser
          // window (founder, 2026-10-19).
          className="grid min-h-0 flex-1 grid-cols-[200px_1fr] overflow-hidden rounded-b-xl border border-t-0 border-border bg-background"
        >
          <div className="min-h-0">
            <Rail current={current} done={done} />
          </div>
          <div className="min-h-0 overflow-hidden px-8 pt-3 pb-6">
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
