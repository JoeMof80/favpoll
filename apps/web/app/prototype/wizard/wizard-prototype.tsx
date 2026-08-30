"use client"

// PROTOTYPE, round 10 (founder: "Maybe we've got the Wizard mostly right
// already") — see NOTES.md. The live preview is gone. This is the
// PRODUCTION wizard's exact shape — rail, step shell, overlays, nav —
// with four steps appended after Topic: Name, About & reveal, Goal (with
// the shared-fund head start) and Publish. Single column, phone-friendly,
// the payoff is landing on the real page after Publish.
//
// The event/charity/topic steps reuse useWizardState and the production
// components wholesale; only the rail/strip are re-rendered locally
// because the production ones hardcode the three-step list.
import { useState } from "react"
import {
  BookOpen,
  Calendar,
  Flag,
  Gift,
  Shapes,
  Target,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { InputGroupButton } from "@/components/ui/input-group"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { useWizardState } from "@/components/new-favpoll-wizard/use-wizard-state"
import { WizardCharityCard } from "@/components/new-favpoll-wizard/wizard-charity-card"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import { WizardStepShell } from "@/components/new-favpoll-wizard/wizard-step-shell"
import type { WizardData } from "@/components/new-favpoll-wizard/use-wizard-state"
import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { deriveRegister } from "@/lib/registers"
import { cn } from "@/lib/utils"

type ProtoStep =
  | "event"
  | "charity"
  | "topic"
  | "info"
  | "story"
  | "goal"
  | "publish"

const PROTO_STEPS: ProtoStep[] = [
  "event",
  "charity",
  "topic",
  "info",
  "story",
  "goal",
  "publish",
]

const STEP_LABELS: Record<ProtoStep, string> = {
  event: "Event",
  charity: "Charity",
  topic: "Topic",
  info: "Name",
  story: "About & reveal",
  goal: "Goal",
  publish: "Publish",
}

const STEP_ICONS: Record<ProtoStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  goal: Target,
  publish: Flag,
}

// Rail lines for the three production steps come from wizard-copy; the
// four new ones follow the same register — the favpoll, not its subject.
const RAIL: Record<ProtoStep, string> = {
  event: "Celebration, memorial or fundraiser.",
  charity: "Every pledge goes to the charity you pick.",
  topic: "Pick a topic, and guests pledge on their favourite.",
  info: "The name at the top of the page.",
  story: "An introduction, and the reveal guests unlock.",
  goal: "A goal, and a head start for guests.",
  publish: "How it appears, and when it closes.",
}

// Canned example per kind, so "Generate an example" demonstrates the real
// affordance without calling the model. The real build calls
// safeGenerateDraft, exactly as the form does today.
const EXAMPLES: Record<
  string,
  { name: string; context: string; about: string; reveal: string }
> = {
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

function ProtoRail({ current }: { current: ProtoStep }) {
  const idx = PROTO_STEPS.indexOf(current)
  return (
    <div className="hidden h-full flex-col gap-6 bg-primary/10 p-6 md:flex">
      <div className="flex flex-1 flex-col justify-around gap-5">
        {PROTO_STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === current
          return (
            <div
              key={s}
              className={cn(
                "space-y-1 transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-base font-medium tracking-widest uppercase",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[s]}
                </p>
              </div>
              <p className="pl-7.5 text-sm leading-relaxed text-muted-foreground">
                {RAIL[s]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProtoProgressStrip({ current }: { current: ProtoStep }) {
  const idx = PROTO_STEPS.indexOf(current)
  return (
    <ol
      role="list"
      aria-label="Wizard steps"
      className="mb-10 flex gap-1.5 md:hidden"
    >
      {PROTO_STEPS.map((s, i) => (
        <li
          key={s}
          role="listitem"
          aria-label={`Step ${i + 1} of ${PROTO_STEPS.length}: ${STEP_LABELS[s]}`}
          aria-current={s === current ? "step" : undefined}
          className="flex-1"
        >
          <span
            className={cn(
              "block h-1 rounded-full transition-colors",
              i <= idx ? "bg-primary" : "bg-muted"
            )}
          />
        </li>
      ))}
    </ol>
  )
}

export function WizardPrototype({ data }: { data: WizardData }) {
  const w = useWizardState(data)
  const [topicSearch, setTopicSearch] = useState("")
  const [charitySearch, setCharitySearch] = useState("")

  // The four appended steps' fields — plain local state; the real build
  // would publish these from the final step.
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState("")
  const [openingLine, setOpeningLine] = useState("")
  const [context, setContext] = useState("")
  const [about, setAbout] = useState("")
  const [reveal, setReveal] = useState("")
  const [showReveal, setShowReveal] = useState(true)
  const [goalAmount, setGoalAmount] = useState<number | undefined>(undefined)
  const [goalDraft, setGoalDraft] = useState("")
  const [fundSeed, setFundSeed] = useState("")
  const [isListed, setIsListed] = useState(true)
  const [closeDate, setCloseDate] = useState("")

  const current = PROTO_STEPS[Math.min(stepIdx, PROTO_STEPS.length - 1)]!
  const isFirst = stepIdx === 0
  const isLast = current === "publish"

  const palette = paletteForRegister(
    deriveRegister(w.category, w.grouping, w.subject)
  )

  const trimmedTopicSearch = topicSearch.trim()
  const topicShowCreate =
    trimmedTopicSearch.length > 0 &&
    !data.topics
      .filter((t) => t.is_active !== false)
      .some((t) => t.title.toLowerCase() === trimmedTopicSearch.toLowerCase())

  function handleCreateTopic() {
    if (!trimmedTopicSearch) return
    w.setTopics([
      {
        topicId: "",
        title: trimmedTopicSearch,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ])
    w.setTopicOpen(false)
    setTopicSearch("")
  }

  function fillExample() {
    const ex = EXAMPLES[w.category ?? "celebration"] ?? EXAMPLES.celebration!
    setName(ex.name)
    setContext(ex.context)
    setAbout(ex.about)
    setReveal(ex.reveal)
  }

  const nextDisabled: Record<ProtoStep, boolean> = {
    event: !w.category,
    charity: w.charityIds.length === 0,
    topic:
      w.topics.length === 0 ||
      (w.topics[0]?.isCustom === true && w.customLabels.length < 2),
    info: !name.trim(),
    story: false,
    goal: false,
    publish: false,
  }

  const field = (
    label: string,
    opt: boolean,
    node: React.ReactNode,
    hint?: string
  ) => (
    <label className="block space-y-1.5 text-sm">
      <span className="block font-medium">
        {label}
        {opt && (
          <span className="font-normal text-muted-foreground"> — optional</span>
        )}
      </span>
      {node}
      {hint && (
        <span className="block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  )

  return (
    <RegisterScope palette={palette}>
      <main>
        <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
          <ProtoRail current={current} />

          <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
            <div className="mx-auto w-full max-w-2xl">
              <ProtoProgressStrip current={current} />

              {current === "event" && (
                <WizardStepShell
                  title="Event"
                  guidance="What kind of favpoll is this?"
                >
                  <EventStep value={w.category} onChange={w.setCategory} />
                </WizardStepShell>
              )}

              {current === "charity" && (
                <WizardStepShell
                  title="Charity"
                  guidance={w.copy.charityGuidance}
                >
                  {w.selectedCharities.length > 0 ? (
                    <WizardCharityCard
                      charities={w.selectedCharities}
                      onEdit={() => w.setCharityOpen(true)}
                      onRemove={(id) =>
                        w.setCharityIds((ids) => ids.filter((i) => i !== id))
                      }
                      onPickAnother={() => w.setCharityOpen(true)}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => w.setCharityOpen(true)}
                    >
                      Pick a charity
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {current === "topic" && (
                <WizardStepShell title="Topic" guidance={w.copy.topicGuidance}>
                  {w.topics.length > 0 ? (
                    <WizardTopicCard
                      topic={w.topics[0]!}
                      sortedExistingItems={w.sortedExistingItems}
                      customLabels={w.customLabels}
                      showItemsSection={w.showItemsSection}
                      onEdit={() => w.setTopicOpen(true)}
                      onOpenItemsDialog={() => w.setItemsDialogOpen(true)}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => w.setTopicOpen(true)}
                    >
                      Pick a topic
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {current === "info" && (
                <WizardStepShell title="Name" guidance="Who the page is about.">
                  <div className="space-y-4">
                    {field(
                      "Name",
                      false,
                      <Input
                        value={name}
                        maxLength={40}
                        placeholder="Name or nickname"
                        onChange={(e) => setName(e.target.value)}
                      />
                    )}
                    {field(
                      "Opening line",
                      true,
                      <Input
                        value={openingLine}
                        maxLength={50}
                        placeholder="Replaces the default opening prefix"
                        onChange={(e) => setOpeningLine(e.target.value)}
                      />
                    )}
                    {field(
                      "Context",
                      true,
                      <Input
                        value={context}
                        maxLength={40}
                        placeholder="e.g. turning 40 · Class of 2024"
                        onChange={(e) => setContext(e.target.value)}
                      />
                    )}
                  </div>
                </WizardStepShell>
              )}

              {current === "story" && (
                <WizardStepShell
                  title="About & reveal"
                  guidance="Introduce them — and what guests unlock when they pledge."
                >
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
                      "About",
                      true,
                      <Textarea
                        rows={3}
                        maxLength={300}
                        value={about}
                        placeholder="Two or three sentences — tease the topic and the cause, but don't give too much away."
                        onChange={(e) => setAbout(e.target.value)}
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
                        value={reveal}
                        placeholder="Guests see this only after they pledge. A quote, a memory, or a message."
                        onChange={(e) => setReveal(e.target.value)}
                      />
                    </div>
                  </div>
                </WizardStepShell>
              )}

              {current === "goal" && (
                <WizardStepShell
                  title="Goal"
                  guidance="Optional — understood as progress, never as pressure."
                >
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {[100, 250, 500].map((g) => (
                        <Button
                          key={g}
                          type="button"
                          size="sm"
                          variant={goalAmount === g ? "default" : "outline"}
                          onClick={() => {
                            setGoalAmount(g)
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
                          setGoalAmount(
                            Number.isFinite(n) && n > 0 ? n : undefined
                          )
                        }}
                      />
                    </div>
                    {field(
                      "Shared fund head start",
                      true,
                      <Input
                        className="w-40"
                        inputMode="numeric"
                        placeholder="£ amount"
                        value={fundSeed}
                        onChange={(e) => setFundSeed(e.target.value)}
                      />,
                      "Every favpoll has a shared fund. Put something in and guests can pledge from it without paying themselves."
                    )}
                  </div>
                </WizardStepShell>
              )}

              {current === "publish" && (
                <WizardStepShell
                  title="Publish"
                  guidance="How the favpoll appears, and when it closes."
                >
                  <div className="space-y-5 text-sm">
                    <label className="flex items-center justify-between gap-4">
                      <span>
                        <span className="font-medium">Listed</span>{" "}
                        <span className="text-muted-foreground">
                          — appears on the public favpolls page
                        </span>
                      </span>
                      <Switch
                        checked={isListed}
                        onCheckedChange={setIsListed}
                      />
                    </label>
                    {field(
                      "Close date",
                      true,
                      <Input
                        type="date"
                        className="w-44"
                        value={closeDate}
                        onChange={(e) => setCloseDate(e.target.value)}
                      />,
                      "90 days at most — it closes automatically either way."
                    )}
                  </div>
                </WizardStepShell>
              )}

              <div className="mt-10 flex items-center justify-end gap-2 border-t border-border pt-2">
                {!isFirst ? (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                  >
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {isLast ? (
                  <Button size="lg" disabled>
                    Publish — dead in this prototype
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={nextDisabled[current]}
                    onClick={() =>
                      setStepIdx((s) => Math.min(PROTO_STEPS.length - 1, s + 1))
                    }
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Topic overlay — production markup */}
        <ResponsiveOverlay
          open={w.topicOpen}
          onOpenChange={(o) => {
            w.setTopicOpen(o)
            if (!o) setTopicSearch("")
          }}
          title="Pick a topic"
          hideCloseButton
          headerClassName="px-5 pt-4 pb-2"
          bodyClassName="p-0"
          fullscreenOnMobile
          mobileSave={{
            label: "Done",
            onClick: () => {
              w.setTopicOpen(false)
              setTopicSearch("")
            },
          }}
          header={
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Search topics…"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && topicShowCreate) {
                    e.preventDefault()
                    handleCreateTopic()
                  }
                }}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
              />
              {topicShowCreate && (
                <InputGroupButton
                  variant="secondary"
                  onClick={handleCreateTopic}
                >
                  Add
                </InputGroupButton>
              )}
            </div>
          }
          footer={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  w.setTopicOpen(false)
                  setTopicSearch("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  w.setTopicOpen(false)
                  setTopicSearch("")
                }}
              >
                Done
              </Button>
            </div>
          }
        >
          <TopicStep
            topics={data.topics}
            categories={data.categories}
            value={w.topics}
            onChange={(v) => {
              w.setTopics(v)
              w.setTopicOpen(false)
              setTopicSearch("")
            }}
            hideItemsPanel
            suggestedTopics={w.suggestedTopics}
            primaryCharityName={w.primaryCharity?.name}
            search={topicSearch}
            onSearchChange={setTopicSearch}
          />
        </ResponsiveOverlay>

        {/* Charity overlay — production markup */}
        <ResponsiveOverlay
          open={w.charityOpen}
          onOpenChange={(o) => {
            w.setCharityOpen(o)
            if (!o) setCharitySearch("")
          }}
          title="Pick a charity"
          hideCloseButton
          headerClassName="px-5 pt-4 pb-2"
          bodyClassName="p-0"
          fullscreenOnMobile
          mobileSave={{
            label: "Done",
            onClick: () => {
              w.setCharityOpen(false)
              setCharitySearch("")
            },
          }}
          header={
            <input
              type="text"
              autoFocus
              placeholder="Search charities…"
              value={charitySearch}
              onChange={(e) => setCharitySearch(e.target.value)}
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
            />
          }
          footer={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  w.setCharityOpen(false)
                  setCharitySearch("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  w.setCharityOpen(false)
                  setCharitySearch("")
                }}
              >
                Done
              </Button>
            </div>
          }
        >
          <CharityStep
            charities={data.charities}
            value={w.charityIds}
            onChange={w.setCharityIds}
            search={charitySearch}
          />
        </ResponsiveOverlay>

        {w.topics.length > 0 && (
          <TopicItemsDialog
            open={w.itemsDialogOpen}
            onOpenChange={w.setItemsDialogOpen}
            topicTitle={w.topics[0]!.title}
            existingItems={w.dialogExistingItems}
            addedItems={w.customLabels}
            onAdd={w.handleAddItem}
            onRemove={w.handleRemoveItem}
            isNewTopic={w.topics[0]!.isCustom ?? false}
          />
        )}

        {process.env.NODE_ENV !== "production" && (
          <div className="fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-neutral-900 px-3 py-1.5 font-mono text-xs text-white shadow-xl">
            PROTOTYPE · shape, round 10
          </div>
        )}
      </main>
    </RegisterScope>
  )
}
