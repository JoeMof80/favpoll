"use client"

// PROTOTYPE, round 11 (founder: keep the triple, Opening line first;
// merge Goal into Publish; bigger inputs) — see NOTES.md. The production
// wizard's exact shape — rail, step shell, overlays, nav — with THREE
// steps appended after Topic: Name (opening line → name → context, the
// page's own order), About & reveal, and Publish (goal, head start,
// listed, close date, button). No live preview; the payoff is landing on
// the real page after Publish.
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import {
  Check,
  BookOpen,
  Calendar,
  CalendarIcon,
  Clock2Icon,
  Flag,
  Gift,
  Shapes,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroPhotoOverlay } from "@/components/favpoll-form/hero-photo-overlay"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  addDays,
  CLOSE_DATE_PRESETS,
} from "@/components/favpoll-form/date-helpers"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { useWizardState } from "@/components/new-favpoll-wizard/use-wizard-state"
import { WizardCharityCard } from "@/components/new-favpoll-wizard/wizard-charity-card"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import type { WizardData } from "@/components/new-favpoll-wizard/use-wizard-state"
import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { deriveRegister } from "@/lib/registers"
import { cn } from "@/lib/utils"

type ProtoStep = "event" | "charity" | "topic" | "info" | "story" | "publish"

const PROTO_STEPS: ProtoStep[] = [
  "event",
  "charity",
  "topic",
  "info",
  "story",
  "publish",
]

const STEP_LABELS: Record<ProtoStep, string> = {
  event: "Event",
  charity: "Charity",
  topic: "Topic",
  info: "Info",
  story: "Story",
  publish: "Details",
}

const STEP_ICONS: Record<ProtoStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  publish: Flag,
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

// Bigger inputs (founder, round 11) — the wizard column is generous, so
// the fields wear full text size instead of shadcn's md:text-sm shrink.
const INPUT_SIZE = "h-11 md:text-base"
const TEXTAREA_SIZE = "md:text-base"

// The production step shell minus the guidance line (founder, round 13:
// "they feel glib") — the heading and the fields say it all.
// Register-aware ghost text (founder, round 17): once the Event is
// picked, the placeholders speak that kind's voice — guidance without
// prefilled text the organiser would have to notice and delete. The
// opening line's ghost shows the register's default prefix: what the page
// says if the field is left alone.
type Placeholders = {
  openingLine: string
  name: string
  context: string
  about: string
  reveal: string
}

const DEFAULT_PLACEHOLDERS: Placeholders = {
  openingLine: "Replaces the default opening prefix",
  name: "Name or nickname",
  context: "e.g. turning 40 · Class of 2024",
  about:
    "Two or three sentences — tease the topic and the cause, but don't give too much away.",
  reveal:
    "Guests see this only after they pledge. A quote, a memory, or a message.",
}

const PLACEHOLDERS: Record<string, Placeholders> = {
  memorial: {
    openingLine: "e.g. In loving memory of",
    name: "e.g. Margaret Whitfield",
    context: "e.g. 1941 – 2026",
    about:
      "e.g. A headmistress for forty-one years with a gift for knowing every pupil's name. There was a season she always loved most.",
    reveal: "e.g. Autumn, always. She said it felt like coming home.",
  },
  celebration: {
    openingLine: "e.g. Celebrating",
    name: "e.g. Poppy Chen",
    context: "e.g. Sweet Sixteen",
    about:
      "e.g. Sixteen on Saturday, and the family can't agree on one thing: the correct ice cream. Settle it with a pledge.",
    reveal: "e.g. Mint choc chip is the best, of course.",
  },
  fundraiser: {
    openingLine: "e.g. Cheering on",
    name: "e.g. Marcus Bell",
    context: "e.g. London Marathon run",
    about:
      "e.g. Running his first marathon for Mind. Whichever hat is leading on the day, he'll wear for all 26.2 miles.",
    reveal:
      "e.g. Thank you for your pledge — if we reach the goal, I'll eat the hat as well.",
  },
}

function ProtoShell({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 py-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-medium tracking-widest text-primary uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// The dropdown close-date picker (founder, round 28): the compact
// DateTimePicker shape — button → calendar dropdown, time beside — with
// the overlay's preset chips inside the dropdown. A preset or a day pick
// closes it; time edits in place. First pick defaults to end of day.
function ProtoDateTimePicker({
  value,
  onChange,
}: {
  value: Date | undefined
  onChange: (d: Date) => void
}) {
  const [open, setOpen] = useState(false)
  const dateStr = value
    ? value.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a close date"
  const timeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "23:59"
  const base = () => {
    if (value) return new Date(value)
    const d = new Date()
    d.setHours(23, 59, 0, 0)
    return d
  }
  function handleDaySelect(d: Date | undefined) {
    if (!d) return
    const next = base()
    next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    onChange(next)
    setOpen(false)
  }
  function handlePreset(days: number) {
    const b = base()
    const next = addDays(new Date(), days)
    next.setHours(b.getHours(), b.getMinutes(), 0, 0)
    onChange(next)
    setOpen(false)
  }
  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number)
    const next = base()
    next.setHours(h ?? 23, m ?? 59, 0, 0)
    onChange(next)
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              INPUT_SIZE,
              "w-56 justify-start gap-2 bg-background! font-normal"
            )}
          >
            <CalendarIcon
              className="h-4 w-4 shrink-0 text-muted-foreground/50"
              aria-hidden
            />
            <span className={cn(!value && "text-muted-foreground/50")}>
              {dateStr}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Card size="sm" className="w-fit shadow-none ring-0">
            <CardContent className="flex gap-3">
              <CalendarPicker
                mode="single"
                captionLayout="dropdown"
                selected={value}
                defaultMonth={value ?? today}
                startMonth={today}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                disabled={{ before: today }}
                onSelect={handleDaySelect}
                className="p-0"
              />
              <div className="flex flex-col gap-1.5">
                {CLOSE_DATE_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    type="button"
                    variant="outline"
                    size="xs"
                    className="rounded-full"
                    onClick={() => handlePreset(p.days)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      <InputGroup className={cn(INPUT_SIZE, "w-32 bg-background")}>
        <InputGroupInput
          type="time"
          step="60"
          value={timeStr}
          onChange={handleTimeChange}
          className="appearance-none tabular-nums [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        <InputGroupAddon align="inline-end">
          <Clock2Icon className="h-4 w-4 text-muted-foreground/50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

// The rail tracks the answers as they accumulate (founder, round 25):
// each step shows a tick once its content is in, and the chosen thing
// itself — the charity's name, the topic, the name — as a one-line
// summary beneath the label.
function ProtoRail({
  current,
  summary,
  done,
}: {
  current: ProtoStep
  summary: Record<ProtoStep, string>
  done: Record<ProtoStep, boolean>
}) {
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
                "min-w-0 space-y-1 transition-opacity",
                isActive || done[s] ? "opacity-100" : "opacity-60"
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
                {done[s] && (
                  <Check
                    aria-label="Done"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                )}
              </div>
              {summary[s] && (
                <p className="truncate pl-7.5 text-sm text-muted-foreground">
                  {summary[s]}
                </p>
              )}
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

  // The appended steps' fields — plain local state; the real build would
  // publish these from the final step.
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState("")
  const [openingLine, setOpeningLine] = useState("")
  const [context, setContext] = useState("")
  const [about, setAbout] = useState("")
  const [reveal, setReveal] = useState("")
  const [goalAmount, setGoalAmount] = useState<number | undefined>(undefined)
  const [goalDraft, setGoalDraft] = useState("")
  const [isListed, setIsListed] = useState(true)
  const [closesAt, setClosesAt] = useState<Date | undefined>(undefined)
  const [photoOpen, setPhotoOpen] = useState(false)

  // The real photo flow (HeroPhotoOverlay + crop) reads a form context;
  // this scoped form carries just photo/photoUrl/name for it.
  const photoForm = useForm<FavpollFormValues>({
    defaultValues: { name: "" },
  })
  const photoUrl = photoForm.watch("photoUrl")
  useEffect(() => {
    photoForm.setValue("name", name)
  }, [name, photoForm])

  const ph = PLACEHOLDERS[w.category ?? ""] ?? DEFAULT_PLACEHOLDERS
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

  const railSummary: Record<ProtoStep, string> = {
    event: w.category
      ? w.category.charAt(0).toUpperCase() + w.category.slice(1)
      : "",
    charity: w.selectedCharities.map((c) => c.name).join(", "),
    topic: w.topics[0]?.title ?? "",
    info: name.trim(),
    story: about.trim(),
    publish: [
      goalAmount ? `£${goalAmount} goal` : null,
      closesAt
        ? `closes ${closesAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : null,
      isListed ? null : "unlisted",
    ]
      .filter(Boolean)
      .join(" · "),
  }

  const railDone: Record<ProtoStep, boolean> = {
    event: !!w.category,
    charity: w.charityIds.length > 0,
    topic:
      w.topics.length > 0 &&
      !(w.topics[0]?.isCustom === true && w.customLabels.length < 2),
    info: !!name.trim(),
    story: !!about.trim(),
    publish: false,
  }

  const nextDisabled: Record<ProtoStep, boolean> = {
    event: !w.category,
    charity: w.charityIds.length === 0,
    topic:
      w.topics.length === 0 ||
      (w.topics[0]?.isCustom === true && w.customLabels.length < 2),
    info: !name.trim(),
    story: !about.trim(),
    publish: false,
  }

  const field = (
    label: string,
    opt: boolean,
    node: React.ReactNode,
    hint?: string
  ) => (
    <label className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:space-y-0 sm:gap-x-6 sm:gap-y-1.5">
      <span className="block font-medium sm:pt-3">
        {label}
        {!opt && <span className="text-muted-foreground"> *</span>}
      </span>
      <div className="min-w-0">{node}</div>
      {hint && (
        <span className="block text-xs text-muted-foreground sm:col-start-2">
          {hint}
        </span>
      )}
    </label>
  )

  return (
    <RegisterScope palette={palette}>
      <main>
        <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
          <ProtoRail current={current} summary={railSummary} done={railDone} />

          <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
            <div className="mx-auto w-full max-w-2xl">
              <ProtoProgressStrip current={current} />

              {current === "event" && (
                <ProtoShell title="Event">
                  <EventStep value={w.category} onChange={w.setCategory} />
                </ProtoShell>
              )}

              {current === "charity" && (
                <ProtoShell title="Charity">
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
                </ProtoShell>
              )}

              {current === "topic" && (
                <ProtoShell title="Topic">
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
                </ProtoShell>
              )}

              {current === "info" && (
                <ProtoShell title="Info">
                  {/* The page's own order (founder, round 11): opening line
                      above the name, context beneath — exactly as the hero
                      renders them. */}
                  <div className="space-y-5">
                    {field(
                      "Opening line",
                      true,
                      <Input
                        className={INPUT_SIZE}
                        value={openingLine}
                        maxLength={50}
                        placeholder={ph.openingLine}
                        onChange={(e) => setOpeningLine(e.target.value)}
                      />
                    )}
                    {field(
                      w.category === "fundraiser" ? "Name or cause" : "Name",
                      false,
                      <Input
                        className={INPUT_SIZE}
                        value={name}
                        maxLength={40}
                        placeholder={ph.name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    )}
                    {field(
                      "Context",
                      true,
                      <Input
                        className={INPUT_SIZE}
                        value={context}
                        maxLength={40}
                        placeholder={ph.context}
                        onChange={(e) => setContext(e.target.value)}
                      />
                    )}
                    <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
                      <span className="font-medium">Photo</span>
                      <span className="flex items-center gap-3">
                        {photoUrl && (
                          <img
                            src={photoUrl}
                            alt=""
                            className="h-11 w-11 rounded-lg border border-border object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPhotoOpen(true)}
                        >
                          {photoUrl ? "Change photo" : "Add a photo"}
                        </Button>
                      </span>
                    </div>
                  </div>
                </ProtoShell>
              )}

              {current === "story" && (
                <ProtoShell
                  title="Story"
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={fillExample}
                    >
                      ✦ Generate an example
                    </Button>
                  }
                >
                  <div className="space-y-5">
                    {field(
                      "About",
                      false,
                      <Textarea
                        className={TEXTAREA_SIZE}
                        rows={4}
                        maxLength={300}
                        value={about}
                        placeholder={ph.about}
                        onChange={(e) => setAbout(e.target.value)}
                      />
                    )}
                    {field(
                      "The reveal",
                      true,
                      <Textarea
                        className={TEXTAREA_SIZE}
                        rows={4}
                        maxLength={280}
                        value={reveal}
                        placeholder={ph.reveal}
                        onChange={(e) => setReveal(e.target.value)}
                      />
                    )}
                  </div>
                </ProtoShell>
              )}

              {current === "publish" && (
                <ProtoShell title="Details">
                  <div className="space-y-6">
                    <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:space-y-0 sm:gap-x-6 sm:gap-y-1.5">
                      <span className="block font-medium sm:pt-3">
                        Pledge goal
                      </span>
                      <div className="flex gap-2">
                        {[100, 250, 500].map((g) => (
                          <Button
                            key={g}
                            type="button"
                            className="h-11 px-5 md:text-base"
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
                          className={cn(INPUT_SIZE, "w-32")}
                          inputMode="numeric"
                          placeholder="£ other"
                          aria-label="Custom goal amount"
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
                    </div>
                    <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6 sm:gap-y-1.5">
                      <span className="font-medium">Close date</span>
                      <ProtoDateTimePicker
                        value={closesAt}
                        onChange={setClosesAt}
                      />
                      <span className="block text-xs text-muted-foreground sm:col-start-2">
                        90 days at most — it closes automatically either way.
                      </span>
                    </div>
                    <label className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
                      <span className="font-medium">Listed</span>
                      <span className="flex items-center gap-3">
                        <Switch
                          checked={isListed}
                          onCheckedChange={setIsListed}
                        />
                        <span className="text-muted-foreground">
                          appears on the public favpolls page
                        </span>
                      </span>
                    </label>
                  </div>
                </ProtoShell>
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

        <FormProvider {...photoForm}>
          <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
        </FormProvider>

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
            PROTOTYPE · shape, round 29
          </div>
        )}
      </main>
    </RegisterScope>
  )
}
