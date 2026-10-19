"use client"

// THE ORGANISER'S SIDE OF HOW IT WORKS (prototype, founder 2026-10-19:
// "Maybe 'How it works' should be more organiser oriented as in the process
// of creating a favpoll"). The home hero now shows the GUEST's journey in
// sixteen seconds, so a walkthrough that narrated the same journey a screen
// lower was the hero told twice. These four panes show the MAKING of a
// favpoll instead, in the wizard's own order — occasion, charity, topic,
// story — each a still of the wizard's step inside the browser frame. The
// frame is deliberate: the guest is shown on a phone, the organiser at a
// desk, and the chrome says which actor a beat belongs to before a word is
// read.
//
// Stills, not the live wizard: the real steps carry state, search and
// uploads; a still says what the step asks for and nothing else, which is
// what a walkthrough needs. The rail is a compact copy of the wizard's —
// its six stations, the current one lit — not the real WizardStepRail,
// whose breakpoints follow the viewport rather than this scaled box.

import { Check } from "lucide-react"
import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { CharityRow } from "@/components/charity-row"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"

export type WizardPane = "event" | "charity" | "topic" | "story"

/** The pane's natural size — laid out at this, scaled by the caller. */
export const WIZARD_VIGNETTE_W = 640
export const WIZARD_VIGNETTE_H = 420

const STATIONS: { key: WizardPane | "info" | "details"; label: string }[] = [
  { key: "event", label: "Event" },
  { key: "charity", label: "Charity" },
  { key: "topic", label: "Topic" },
  { key: "info", label: "Header" },
  { key: "story", label: "Story" },
  { key: "details", label: "Settings" },
]

const ORDER: WizardPane[] = ["event", "charity", "topic", "story"]

function Rail({ pane }: { pane: WizardPane }) {
  // Everything before the current pane is done; the Header station sits
  // between Topic and Story in the real wizard, so it is done once Story is.
  const reached = (key: string) => {
    const idx = STATIONS.findIndex((s) => s.key === key)
    const cur = STATIONS.findIndex((s) => s.key === pane)
    return idx < cur
  }
  return (
    <div
      className="flex w-[168px] shrink-0 flex-col justify-between border-r border-border bg-primary/5 px-5 py-5"
      aria-hidden="true"
    >
      {STATIONS.map((s) => {
        const current = s.key === pane
        const done = reached(s.key)
        return (
          <div key={s.key} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-[10px]",
                current
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3" /> : null}
            </span>
            <span
              className={cn(
                "text-xs font-medium tracking-widest uppercase",
                current || done ? "text-primary" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const DEMO_CHARITIES: Charity[] = [
  {
    id: "wv-stlukes",
    name: "St Luke's Cheshire Hospice",
    registered_number: "515595",
    logo_url: null,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
  } as Charity,
  {
    id: "wv-mariecurie",
    name: "Marie Curie",
    registered_number: "207994",
    logo_url: null,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
  } as Charity,
  {
    id: "wv-mind",
    name: "Mind",
    registered_number: "219830",
    logo_url: null,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
  } as Charity,
]

const COLOURS = ["Purple", "Blue", "Red", "Green", "Pink", "Black", "Gold"]

function Pane({ pane }: { pane: WizardPane }) {
  if (pane === "event") {
    return (
      <div className="flex h-full flex-col justify-center gap-5">
        <SectionEyebrow>What is the occasion?</SectionEyebrow>
        <div className="pointer-events-none">
          <EventStep value="memorial" onChange={() => {}} disabled />
        </div>
      </div>
    )
  }
  if (pane === "charity") {
    return (
      <div className="flex h-full flex-col gap-4">
        <SectionEyebrow>Which charity?</SectionEyebrow>
        <Input
          readOnly
          tabIndex={-1}
          value="st luke"
          aria-label="Search the register"
          className="pointer-events-none"
        />
        <ul className="space-y-2">
          {DEMO_CHARITIES.map((c, i) => (
            <li
              key={c.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                i === 0 ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <CharityRow charity={c} amountRaised={0} size="sm" />
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Every registered charity in England and Wales, from the Charity
          Commission&apos;s register.
        </p>
      </div>
    )
  }
  if (pane === "topic") {
    return (
      <div className="flex h-full flex-col gap-4">
        <SectionEyebrow>Favourite what?</SectionEyebrow>
        <Input
          readOnly
          tabIndex={-1}
          value="colour"
          aria-label="Search topics"
          className="pointer-events-none"
        />
        <div className="rounded-lg border border-primary bg-primary/5 px-3 py-3">
          <p className="text-sm font-medium text-foreground">Colour</p>
          <p className="text-xs text-muted-foreground">
            The one they always reached for
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COLOURS.map((c) => (
              <Chip
                key={c}
                size="sm"
                tabIndex={-1}
                className="pointer-events-none"
              >
                {c}
              </Chip>
            ))}
            <Chip
              size="sm"
              tabIndex={-1}
              className="pointer-events-none border-dashed"
            >
              + Add
            </Chip>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Pick from the catalogue, or write a list of your own.
        </p>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col gap-3">
      <SectionEyebrow>Their story</SectionEyebrow>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Name</p>
          <Input
            readOnly
            tabIndex={-1}
            value="Belinda Hartley"
            className="pointer-events-none"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Dates</p>
          <Input
            readOnly
            tabIndex={-1}
            value="1945 – 2024"
            className="pointer-events-none w-32"
          />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">About</p>
        <Textarea
          readOnly
          tabIndex={-1}
          rows={2}
          value="A headmistress for forty-one years with a gift for knowing every pupil's name. She had a signature colour that she loved."
          className="pointer-events-none resize-none"
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          Your note · revealed once a guest has pledged
        </p>
        <Textarea
          readOnly
          tabIndex={-1}
          rows={2}
          value="My favourite colour was purple. I wore it to every occasion that mattered."
          className="pointer-events-none resize-none"
        />
      </div>
    </div>
  )
}

export function WizardVignette({ pane }: { pane: WizardPane }) {
  return (
    <div
      data-testid="wizard-vignette"
      data-pane={pane}
      className="theme-light text-foreground"
      style={{ width: WIZARD_VIGNETTE_W, height: WIZARD_VIGNETTE_H }}
    >
      <DemoFrame className="h-full overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1 rounded-b-xl border border-t-0 border-border bg-background">
          <Rail pane={pane} />
          <div className="min-h-0 flex-1 overflow-hidden px-8 py-6">
            <Pane pane={pane} />
          </div>
        </div>
      </DemoFrame>
    </div>
  )
}

export const WIZARD_PANES = ORDER
