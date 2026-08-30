"use client"

// PROTOTYPE, round 2 (founder feedback on A) — see NOTES.md.
// A single stepped flow: kind → charity (dialog) → topic (dialog) →
// words (name/opening/context/about/reveal, one step, generate button)
// → goal → publish. The live preview fades everything except the part
// the step writes, to say "this IS the favpoll page".
import { useMemo, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { CharityBanner } from "@/components/charity-banner"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { EditableHero } from "@/components/favpoll-form/editable-hero"
import { EditablePollArea } from "@/components/favpoll-form/editable-poll-area"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { deriveRegister } from "@/lib/registers"
import { cn } from "@/lib/utils"

type Data = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  suggestedTopicIds: Record<string, string[]>
}

type StepKey = "kind" | "charity" | "topic" | "words" | "goal" | "finish"
const STEPS: StepKey[] = ["kind", "charity", "topic", "words", "goal", "finish"]

const TITLES: Record<
  StepKey,
  { title: string; guidance: string; skippable?: boolean }
> = {
  kind: { title: "Event", guidance: "What kind of favpoll is this?" },
  charity: {
    title: "Charity",
    guidance: "Every pledge goes to the charity you pick.",
  },
  topic: {
    title: "Topic",
    guidance: "Pick a topic, and guests pledge on their favourite.",
  },
  words: {
    title: "Their page",
    guidance: "Who this is for, in their own words.",
  },
  goal: {
    title: "Goal",
    guidance: "Optional — understood as progress, never as pressure.",
    skippable: true,
  },
  finish: {
    title: "Publish",
    guidance: "How the favpoll appears, and a head start for guests.",
  },
}

// Canned example per kind, so "Generate an example" demonstrates the real
// affordance without calling the model. The real build calls
// safeGenerateDraft, exactly as the form does today.
const EXAMPLES: Record<string, Partial<FavpollFormValues>> = {
  memorial: {
    name: "Margaret Whitfield",
    context: "1941 – 2026",
    about:
      "A headmistress for forty-one years with a gift for knowing every pupil's name. There was a season she always loved most.",
    reveal: "Autumn, always. She said it felt like coming home.",
  },
  celebration: {
    name: "Poppy Chen",
    context: "Sweet Sixteen",
    about:
      "Sixteen on Saturday, and the family can't agree on one thing: the correct ice cream. Settle it with a pledge.",
    reveal: "Mint choc chip is the best, of course.",
  },
  fundraiser: {
    name: "Marcus Bell",
    context: "London Marathon run",
    about:
      "Running his first marathon for Mind. Whichever hat is leading on the day, he'll wear for all 26.2 miles.",
    reveal:
      "Thank you for your pledge. If we reach the goal, I'll eat the hat as well! (Only kidding)",
  },
}

export function WizardPrototype({ data }: { data: Data }) {
  const form = useForm<FavpollFormValues>({
    defaultValues: {
      grouping: "individual",
      subject: "someone",
      charities: [],
      topics: [],
      isListed: true,
      register: "",
    },
  })
  const v = useWatch({ control: form.control })
  const palette = paletteForRegister(
    deriveRegister(v.category ?? null, v.grouping ?? "individual", v.subject)
  )

  const [step, setStep] = useState(0)
  const [charityOpen, setCharityOpen] = useState(false)
  const [topicOpen, setTopicOpen] = useState(false)
  const [showReveal, setShowReveal] = useState(true)
  const [goalDraft, setGoalDraft] = useState("")
  const current = STEPS[Math.min(step, STEPS.length - 1)]!

  const primaryCharity = data.charities.find((c) => v.charities?.[0] === c.id)
  const chosenCharities = data.charities.filter((c) =>
    v.charities?.includes(c.id)
  )
  const suggestedTopics = useMemo(
    () =>
      (primaryCharity ? (data.suggestedTopicIds[primaryCharity.id] ?? []) : [])
        .map((id) => data.topics.find((t) => t.id === id))
        .filter((t): t is TopicWithMeta => !!t),
    [primaryCharity, data]
  )

  const canNext: Record<StepKey, boolean> = {
    kind: !!v.category,
    charity: (v.charities?.length ?? 0) > 0,
    topic: (v.topics?.length ?? 0) > 0,
    words: !!v.name?.trim(),
    goal: true,
    finish: true,
  }

  function fillExample() {
    const ex = EXAMPLES[v.category ?? "celebration"] ?? EXAMPLES.celebration
    for (const [k, val] of Object.entries(ex))
      form.setValue(k as keyof FavpollFormValues, val as never)
  }

  const field = (label: string, opt: boolean, node: React.ReactNode) => (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">
        {label}
        {opt && (
          <span className="font-normal text-muted-foreground"> — optional</span>
        )}
      </span>
      {node}
    </label>
  )

  const stepBody = (k: StepKey) => {
    switch (k) {
      case "kind":
        return (
          <EventStep
            value={v.category ?? null}
            onChange={(c) => form.setValue("category", c)}
          />
        )
      case "charity":
        return (
          <div className="space-y-3">
            {chosenCharities.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {chosenCharities.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border px-3 py-2 font-medium"
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No charity picked yet.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setCharityOpen(true)}
            >
              {chosenCharities.length ? "Change charity" : "Pick a charity"}
            </Button>
          </div>
        )
      case "topic":
        return (
          <div className="space-y-3">
            {v.topics?.[0] ? (
              <p className="text-sm">
                <span className="font-medium">{v.topics[0].title}</span>{" "}
                <span className="text-muted-foreground">
                  · {(v.topics[0].items ?? []).length} favourites
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No topic picked yet.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setTopicOpen(true)}
            >
              {(v.topics?.length ?? 0) ? "Change topic" : "Pick a topic"}
            </Button>
          </div>
        )
      case "words":
        return (
          <div className="space-y-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={fillExample}
            >
              ✦ Generate an example
            </Button>
            {field(
              "Name",
              false,
              <Input
                value={v.name ?? ""}
                maxLength={40}
                placeholder="Name or nickname"
                onChange={(e) => form.setValue("name", e.target.value)}
              />
            )}
            {field(
              "Opening line",
              true,
              <Input
                value={v.openingLine ?? ""}
                maxLength={50}
                placeholder="Replaces the default opening prefix"
                onChange={(e) => form.setValue("openingLine", e.target.value)}
              />
            )}
            {field(
              "Context",
              true,
              <Input
                value={v.context ?? ""}
                maxLength={40}
                placeholder="e.g. turning 40 · Class of 2024"
                onChange={(e) => form.setValue("context", e.target.value)}
              />
            )}
            {field(
              "About",
              true,
              <Textarea
                rows={3}
                maxLength={300}
                value={v.about ?? ""}
                placeholder="Two or three sentences — tease the topic and the cause, but don't give too much away."
                onChange={(e) => form.setValue("about", e.target.value)}
              />
            )}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  The reveal{" "}
                  <span className="font-normal text-muted-foreground">
                    — optional
                  </span>
                </span>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Include
                  <Switch
                    checked={showReveal}
                    onCheckedChange={setShowReveal}
                  />
                </label>
              </div>
              <Textarea
                rows={3}
                maxLength={280}
                disabled={!showReveal}
                className={showReveal ? undefined : "opacity-40"}
                value={v.reveal ?? ""}
                placeholder="Guests see this only after they pledge. A quote, a memory, or a message."
                onChange={(e) => form.setValue("reveal", e.target.value)}
              />
            </div>
          </div>
        )
      case "goal":
        return (
          <div className="flex gap-2">
            {[100, 250, 500].map((g) => (
              <Button
                key={g}
                type="button"
                size="sm"
                variant={v.goalAmount === g ? "default" : "outline"}
                onClick={() => {
                  form.setValue("goalAmount", g)
                  setGoalDraft(String(g))
                }}
              >
                £{g}
              </Button>
            ))}
            <Input
              className="w-28"
              inputMode="numeric"
              placeholder="£ other"
              value={goalDraft}
              onChange={(e) => {
                setGoalDraft(e.target.value)
                const n = parseInt(e.target.value, 10)
                form.setValue(
                  "goalAmount",
                  Number.isFinite(n) && n > 0 ? n : undefined
                )
              }}
            />
          </div>
        )
      case "finish":
        return (
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="font-medium">Listed</span>{" "}
                <span className="text-muted-foreground">
                  — appears on the public favpolls page
                </span>
              </span>
              <Switch
                checked={v.isListed ?? true}
                onCheckedChange={(c) => form.setValue("isListed", c)}
              />
            </label>
            <p className="text-muted-foreground">
              Close date and the shared-fund head start would live here too.
            </p>
            <Button type="button" className="w-full" disabled>
              Publish — dead in this prototype
            </Button>
          </div>
        )
    }
  }

  // Which preview regions the current step writes. Everything else fades,
  // to say: this is the favpoll page, and you are filling THIS part in.
  const focus: Record<StepKey, ("hero" | "poll" | "charity")[]> = {
    kind: ["hero", "poll", "charity"],
    charity: ["charity"],
    topic: ["poll"],
    words: ["hero", "poll"],
    goal: ["charity"],
    finish: ["hero", "poll", "charity"],
  }
  const dim = (region: "hero" | "poll" | "charity") =>
    cn(
      "transition-opacity duration-300",
      !focus[current].includes(region) && "opacity-25"
    )

  const preview = (
    <div
      aria-hidden="true"
      data-proto-preview=""
      className="pointer-events-none rounded-xl border border-border bg-background p-6 shadow-sm select-none"
    >
      {!showReveal && (
        <style>{`[data-proto-preview] [aria-label="Add reveal"], [data-proto-preview] [aria-label="Edit reveal"] { display: none }`}</style>
      )}
      <p className="mb-4 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        The favpoll page — live
      </p>
      <div className={dim("hero")}>
        <EditableHero />
      </div>
      <div className={cn("mt-6", dim("poll"))}>
        <EditablePollArea />
      </div>
      <div className={cn("mt-6", dim("charity"))}>
        {chosenCharities.length > 0 ? (
          <CharityBanner
            charities={chosenCharities}
            totalRaised={0}
            goalAmount={v.goalAmount ?? null}
          />
        ) : (
          <div className="h-20 rounded-lg border border-dashed border-border" />
        )}
      </div>
    </div>
  )

  return (
    <RegisterScope palette={palette}>
      <FormProvider {...form}>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:items-start">
            <div>
              <ol
                role="list"
                className="mb-8 flex items-center gap-2"
                aria-label="Steps"
              >
                {STEPS.map((k, i) => (
                  <li
                    key={k}
                    role="listitem"
                    aria-label={`Step ${i + 1} of ${STEPS.length}`}
                    aria-current={i === step ? "step" : undefined}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i < step
                        ? "w-6 bg-primary/50"
                        : i === step
                          ? "w-10 bg-primary"
                          : "w-6 bg-muted"
                    )}
                  />
                ))}
              </ol>
              <p className="text-sm font-medium tracking-[0.09em] text-primary-muted uppercase">
                {TITLES[current].title}
              </p>
              <h1 className="mt-1 mb-6 text-2xl font-medium">
                {TITLES[current].guidance}
              </h1>
              {stepBody(current)}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  ← Back
                </Button>
                <div className="flex items-center gap-3">
                  {TITLES[current].skippable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStep((s) => Math.min(STEPS.length - 1, s + 1))
                      }
                    >
                      Skip for now
                    </Button>
                  )}
                  {current !== "finish" && (
                    <Button
                      type="button"
                      disabled={!canNext[current]}
                      onClick={() =>
                        setStep((s) => Math.min(STEPS.length - 1, s + 1))
                      }
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="md:sticky md:top-20">{preview}</div>
          </div>
        </main>

        <ResponsiveOverlay
          open={charityOpen}
          onOpenChange={setCharityOpen}
          title="Pick a charity"
        >
          <CharityStep
            charities={data.charities}
            value={v.charities ?? []}
            onChange={(ids) => {
              form.setValue("charities", ids)
              if (ids.length) setCharityOpen(false)
            }}
          />
        </ResponsiveOverlay>
        <ResponsiveOverlay
          open={topicOpen}
          onOpenChange={setTopicOpen}
          title="Pick a topic"
        >
          <TopicStep
            topics={data.topics}
            categories={data.categories}
            value={(v.topics ?? []) as FavpollFormValues["topics"]}
            onChange={(t) => {
              form.setValue("topics", t)
              if (t.length) setTopicOpen(false)
            }}
            hideItemsPanel
            suggestedTopics={suggestedTopics}
            primaryCharityName={primaryCharity?.name}
          />
        </ResponsiveOverlay>

        {process.env.NODE_ENV !== "production" && (
          <div className="fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900 px-3 py-1.5 font-mono text-xs text-white shadow-xl">
            PROTOTYPE · A, round 2
          </div>
        )}
      </FormProvider>
    </RegisterScope>
  )
}
