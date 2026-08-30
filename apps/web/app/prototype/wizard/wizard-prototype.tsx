"use client"

// PROTOTYPE — see NOTES.md. Two variants, one form, the real preview.
import { useMemo, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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

const WHO = [
  { key: "he", label: "He" },
  { key: "she", label: "She" },
  { key: "they", label: "They" },
  { key: "pair", label: "Pair" },
  { key: "group", label: "Group" },
] as const

type StepKey =
  | "who"
  | "kind"
  | "charity"
  | "topic"
  | "identity"
  | "about"
  | "reveal"
  | "goal"
  | "finish"

const STEP_TITLES: Record<
  StepKey,
  { title: string; guidance: string; skippable?: boolean }
> = {
  who: { title: "Who", guidance: "Who is this favpoll for?" },
  kind: { title: "Event", guidance: "What kind of favpoll is this?" },
  charity: {
    title: "Charity",
    guidance: "Every pledge goes to the charity you pick.",
  },
  topic: {
    title: "Topic",
    guidance: "Pick a topic, and guests pledge on their favourite.",
  },
  identity: {
    title: "Name",
    guidance: "Who the page is about, in their own words.",
  },
  about: {
    title: "About",
    guidance:
      "Two or three sentences: who this is for, the occasion, and where pledges go.",
    skippable: true,
  },
  reveal: {
    title: "The reveal",
    guidance: "Guests see this only after they pledge.",
    skippable: true,
  },
  goal: {
    title: "Goal",
    guidance:
      "Optional — shown to guests as understood progress, never as pressure.",
    skippable: true,
  },
  finish: {
    title: "Publish",
    guidance: "How the favpoll appears, and a head start for guests.",
  },
}

export function WizardPrototype({ data }: { data: Data }) {
  const params = useSearchParams()
  const router = useRouter()
  const variant = params.get("variant") === "sections" ? "sections" : "stepped"

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

  const [who, setWho] = useState<string | null>(null)
  const [step, setStep] = useState<number>(0)
  const [goalDraft, setGoalDraft] = useState("")

  const steps = useMemo<StepKey[]>(
    () =>
      v.subject === "cause"
        ? [
            "who",
            "charity",
            "topic",
            "identity",
            "about",
            "reveal",
            "goal",
            "finish",
          ]
        : [
            "who",
            "kind",
            "charity",
            "topic",
            "identity",
            "about",
            "reveal",
            "goal",
            "finish",
          ],
    [v.subject]
  )
  const current = steps[Math.min(step, steps.length - 1)]!

  const primaryCharity = data.charities.find((c) => v.charities?.[0] === c.id)
  const suggestedTopics = (
    primaryCharity ? (data.suggestedTopicIds[primaryCharity.id] ?? []) : []
  )
    .map((id) => data.topics.find((t) => t.id === id))
    .filter((t): t is TopicWithMeta => !!t)

  const canNext: Record<StepKey, boolean> = {
    who: who !== null,
    kind: !!v.category,
    charity: (v.charities?.length ?? 0) > 0,
    topic: (v.topics?.length ?? 0) > 0,
    identity: v.subject === "cause" ? !!v.causeLabel?.trim() : !!v.name?.trim(),
    about: true,
    reveal: true,
    goal: true,
    finish: true,
  }

  function pickWho(key: string) {
    setWho(key)
    if (key === "cause") {
      form.setValue("subject", "cause")
      form.setValue("category", undefined)
      form.setValue("grouping", "individual")
      form.setValue("pronoun", undefined)
    } else {
      form.setValue("subject", "someone")
      if (key === "pair") form.setValue("grouping", "couple")
      else if (key === "group") form.setValue("grouping", "group")
      else {
        form.setValue("grouping", "individual")
        form.setValue("pronoun", key as "he" | "she" | "they")
      }
    }
  }

  const stepBody = (k: StepKey) => {
    switch (k) {
      case "who":
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {WHO.map((o) => (
                <Button
                  key={o.key}
                  type="button"
                  size="sm"
                  variant={who === o.key ? "default" : "outline"}
                  onClick={() => pickWho(o.key)}
                >
                  {o.label}
                </Button>
              ))}
              <span className="self-center text-xs text-muted-foreground">
                OR
              </span>
              <Button
                type="button"
                size="sm"
                data-register="fundraiser"
                variant={who === "cause" ? "default" : "outline"}
                onClick={() => pickWho("cause")}
              >
                A cause
              </Button>
            </div>
          </div>
        )
      case "kind":
        return (
          <EventStep
            value={v.category ?? null}
            onChange={(c) => form.setValue("category", c)}
          />
        )
      case "charity":
        return (
          <div className="max-h-[420px] overflow-y-auto">
            <CharityStep
              charities={data.charities}
              value={v.charities ?? []}
              onChange={(ids) => form.setValue("charities", ids)}
            />
          </div>
        )
      case "topic":
        return (
          <div className="max-h-[460px] overflow-y-auto">
            <TopicStep
              topics={data.topics}
              categories={data.categories}
              value={(v.topics ?? []) as FavpollFormValues["topics"]}
              onChange={(t) => form.setValue("topics", t)}
              hideItemsPanel
              suggestedTopics={suggestedTopics}
              primaryCharityName={primaryCharity?.name}
            />
          </div>
        )
      case "identity":
        return (
          <div className="space-y-4">
            {v.subject === "cause" ? (
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">What are you raising for?</span>
                <Input
                  value={v.causeLabel ?? ""}
                  maxLength={60}
                  placeholder="e.g. St Mark's Hospice"
                  onChange={(e) => form.setValue("causeLabel", e.target.value)}
                />
              </label>
            ) : (
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Name</span>
                <Input
                  value={v.name ?? ""}
                  maxLength={40}
                  placeholder="Name or nickname"
                  onChange={(e) => form.setValue("name", e.target.value)}
                />
              </label>
            )}
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">
                Opening line{" "}
                <span className="font-normal text-muted-foreground">
                  — optional
                </span>
              </span>
              <Input
                value={v.openingLine ?? ""}
                maxLength={50}
                placeholder="Replaces the default opening prefix"
                onChange={(e) => form.setValue("openingLine", e.target.value)}
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">
                Context{" "}
                <span className="font-normal text-muted-foreground">
                  — optional
                </span>
              </span>
              <Input
                value={v.context ?? ""}
                maxLength={40}
                placeholder="e.g. turning 40 · Class of 2024"
                onChange={(e) => form.setValue("context", e.target.value)}
              />
            </label>
          </div>
        )
      case "about":
        return (
          <Textarea
            rows={4}
            maxLength={300}
            value={v.about ?? ""}
            placeholder={
              v.subject === "cause"
                ? "What are you raising for? Tease the topic and why it matters — but don't give it all away."
                : "Enter a short biography — tease the topic and the cause, but don't give too much away."
            }
            onChange={(e) => form.setValue("about", e.target.value)}
          />
        )
      case "reveal":
        return (
          <Textarea
            rows={4}
            maxLength={280}
            value={v.reveal ?? ""}
            placeholder="What did they love? Name it, and the detail only you'd know."
            onChange={(e) => form.setValue("reveal", e.target.value)}
          />
        )
      case "goal":
        return (
          <div className="space-y-3">
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

  const preview = (
    <div
      aria-hidden="true"
      className="pointer-events-none rounded-xl border border-border bg-background p-6 shadow-sm select-none"
    >
      <p className="mb-4 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        Live preview
      </p>
      <EditableHero />
      <div className="mt-6">
        <EditablePollArea />
      </div>
      {(v.charities?.length ?? 0) > 0 && (
        <div className="mt-6">
          <CharityBanner
            charities={data.charities.filter((c) =>
              v.charities?.includes(c.id)
            )}
            totalRaised={0}
            goalAmount={v.goalAmount ?? null}
          />
        </div>
      )}
    </div>
  )

  const switcher = (
    <div className="fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full bg-neutral-900 px-2 py-1 font-mono text-xs text-white shadow-xl">
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white"
        aria-label="Previous variant"
        onClick={() =>
          router.replace(
            `?variant=${variant === "stepped" ? "sections" : "stepped"}`,
            { scroll: false }
          )
        }
      >
        <ChevronLeft />
      </Button>
      <span className="px-1">
        PROTOTYPE ·{" "}
        {variant === "stepped"
          ? "A — one question per screen"
          : "B — one page of sections"}
      </span>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white"
        aria-label="Next variant"
        onClick={() =>
          router.replace(
            `?variant=${variant === "stepped" ? "sections" : "stepped"}`,
            { scroll: false }
          )
        }
      >
        <ChevronRight />
      </Button>
    </div>
  )

  return (
    <RegisterScope palette={palette}>
      <FormProvider {...form}>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:items-start">
            {variant === "stepped" ? (
              <div>
                {/* Progress dots */}
                <ol
                  role="list"
                  className="mb-8 flex items-center gap-2"
                  aria-label="Steps"
                >
                  {steps.map((k, i) => (
                    <li
                      key={k}
                      role="listitem"
                      aria-label={`Step ${i + 1} of ${steps.length}`}
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
                  {STEP_TITLES[current].title}
                </p>
                <h1 className="mt-1 mb-6 text-2xl font-medium">
                  {STEP_TITLES[current].guidance}
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
                    {STEP_TITLES[current].skippable && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setStep((s) => Math.min(steps.length - 1, s + 1))
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
                          setStep((s) => Math.min(steps.length - 1, s + 1))
                        }
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {steps.map((k) => (
                  <section key={k}>
                    <p className="text-sm font-medium tracking-[0.09em] text-primary-muted uppercase">
                      {STEP_TITLES[k].title}
                    </p>
                    <h2 className="mt-1 mb-4 text-xl font-medium">
                      {STEP_TITLES[k].guidance}
                    </h2>
                    {stepBody(k)}
                  </section>
                ))}
              </div>
            )}
            <div className="md:sticky md:top-20">{preview}</div>
          </div>
        </main>
        {process.env.NODE_ENV !== "production" && switcher}
      </FormProvider>
    </RegisterScope>
  )
}
