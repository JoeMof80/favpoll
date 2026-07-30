"use client"

import { useEffect, useRef, useState } from "react"
import { useWatch, useForm } from "react-hook-form"
import { Sparkles, Mars, Venus, NonBinary, CalendarHeart } from "lucide-react"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import { pickExampleName } from "@/lib/registers"
import { deriveRegister } from "@/lib/registers"
import { occasionsForRegister, type OccasionSpec } from "@/lib/occasions"
import { GroupIcon, PairIcon } from "@/components/icons/people"
import { getFavpollHeadline } from "@/lib/display"
import type { FavpollFormValues } from "./schema"
import { CommandPanel } from "./command-panel"
import { OccasionPicker } from "./occasion-picker"
import { GoalOverlay } from "./goal-overlay"
import { EditableHero } from "./editable-hero"
import { EditablePollArea } from "./editable-poll-area"
import { EditableCountdown } from "./editable-countdown"
import { CharityBanner } from "../charity-banner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import type {
  Charity,
  TopicWithMeta,
  Register,
  FavpollGrouping,
  FavpollCategory,
  Pronoun,
} from "@favpoll/types"

export const NEW_TOPIC_DRAFT_KEY = "favpoll_new_topic_draft"
export const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

// Context suggestions: pools, picked at random per generate click (like
// the names). The fundraiser case is register "cause" WITH a protagonist —
// it gets its own pool; faceless causes have no context line.
const CONTEXT_POOLS: Partial<Record<Register, readonly string[]>> = {
  remembering: ["1938 – 2024", "1942 – 2025", "1951 – 2026"],
  celebrating_one: [
    "turning 40",
    "turning 60",
    "retiring at last",
    "30 years of service",
  ],
  celebrating_many: ["class of 2025", "20 years married", "50 golden years"],
  cause: [
    "taking on the marathon",
    "100 miles in a month",
    "a year of early starts",
  ],
}

function pickContext(register: Register): string {
  const pool = CONTEXT_POOLS[register]
  if (!pool || pool.length === 0) return ""
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickVariant(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Maps the form's grouping onto the occasion catalogue's pair/group tags. */
function groupingFilterFor(
  grouping: FavpollGrouping
): "pair" | "group" | undefined {
  return grouping === "couple"
    ? "pair"
    : grouping === "group"
      ? "group"
      : undefined
}

// Who-icon chip styling, shared with the occasion chip so the pill's
// selected/unselected language stays uniform.
const PILL_CHIP_ON =
  "size-7 rounded-full bg-primary-foreground p-0 text-primary hover:bg-primary-foreground hover:text-primary sm:size-8 [&_svg]:!h-4 [&_svg]:!w-4 sm:[&_svg]:!h-4.5 sm:[&_svg]:!w-4.5"
const PILL_CHIP_OFF =
  "size-7 rounded-full p-0 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:size-8 [&_svg]:!h-4 [&_svg]:!w-4 sm:[&_svg]:!h-4.5 sm:[&_svg]:!w-4.5"

export type FormInnerProps = {
  form: ReturnType<
    typeof useForm<FavpollFormValues, unknown, FavpollFormValues>
  >
  charities: Charity[]
  topics: TopicWithMeta[]
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: (closesAt?: Date) => void
  hasNewTopicDraft: boolean
  /** ISO string from the DB; edit mode only */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function FormInner({
  form,
  charities,
  topics,
  mode,
  submitting,
  error,
  onSubmit,
  hasNewTopicDraft,
  closesAt,
  onClosesAtChange,
}: FormInnerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  // The occasion is ephemeral generation input — it targets the opening
  // line and context lookups but is never stored on the favpoll.
  const [occasion, setOccasion] = useState<OccasionSpec | null>(null)
  const [occasionOpen, setOccasionOpen] = useState(false)
  const lastGeneratedOpeningLine = useRef<string | null>(null)
  const lastGeneratedName = useRef<string | null>(null)
  const lastGeneratedCauseLabel = useRef<string | null>(null)
  const lastGeneratedContext = useRef<string | null>(null)
  const lastGeneratedAbout = useRef<string | null>(null)
  const lastGeneratedReveal = useRef<string | null>(null)

  useEffect(() => {
    if (!hasNewTopicDraft) return
    try {
      const newRaw = sessionStorage.getItem(DRAFT_ADDITIONS_KEY)
      if (newRaw) {
        const { topicRef, addedItems } = JSON.parse(newRaw) as {
          topicRef:
            | { kind: "new"; title: string }
            | { kind: "existing"; id: string }
          addedItems: string[]
        }
        if (topicRef.kind === "new") {
          form.setValue("topics", [
            {
              topicId: "",
              title: topicRef.title,
              isCustom: true,
              items: [],
              customLabels: addedItems,
            },
          ])
        } else {
          const t = topics.find((t) => t.id === topicRef.id)
          if (t) {
            form.setValue("topics", [
              {
                topicId: t.id,
                title: t.title,
                isCustom: false,
                items: t.favourites.map((i) => ({ id: i.id, label: i.label })),
                customLabels: addedItems,
              },
            ])
          }
        }
        return
      }
      const legacyRaw = sessionStorage.getItem(NEW_TOPIC_DRAFT_KEY)
      if (!legacyRaw) return
      const { title, items } = JSON.parse(legacyRaw) as {
        title: string
        items: string[]
      }
      form.setValue("topics", [
        { topicId: "", title, isCustom: true, items: [], customLabels: items },
      ])
    } catch {
      // malformed draft — leave form empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // occasionOverride: pass the occasion explicitly when the caller has
  // just changed it (state updates land after this synchronous read);
  // omit to use the currently selected occasion.
  async function handleRegenerate(occasionOverride?: OccasionSpec | null) {
    const values = form.getValues()
    const topic = values.topics?.[0]
    if (!topic) return
    if (!topic.isCustom && !topic.topicId) return
    if (topic.isCustom && !topic.title) return
    const reg = values.register
    if (!reg) return

    const occ = occasionOverride === undefined ? occasion : occasionOverride
    const sub = (values.subject ?? "someone") as "someone" | "cause"
    const grouping = (values.grouping ?? "individual") as FavpollGrouping
    const pronoun = sub !== "cause" ? (values.pronoun ?? undefined) : undefined
    const primaryCharityId = values.charities?.[0] ?? null

    const topicMeta = topics.find((t) => t.id === topic.topicId)
    const topicTitle = topicMeta?.title ?? topic.title ?? null

    // The occasion targets the deterministic fields: opening line and
    // context rotate through its variants; without one, fall back to the
    // register-level prefix and pools.
    const suggestedOpeningLine = occ
      ? pickVariant(occ.openingLines)
      : getFavpollHeadline({
          register: reg,
          occasionType: null,
          name: "",
          subject: sub,
        }).prefix

    const suggestedName =
      sub !== "cause"
        ? pickExampleName(pronoun, grouping, reg as Register, sub)
        : null
    const suggestedContext = occ
      ? pickVariant(occ.contexts)
      : sub !== "cause"
        ? pickContext(reg as Register)
        : null

    const manualFields: string[] = [
      values.openingLine &&
      values.openingLine !== lastGeneratedOpeningLine.current
        ? "opening line"
        : "",
      sub !== "cause" &&
      values.name &&
      values.name !== lastGeneratedName.current
        ? "name"
        : "",
      // Context is generated for both subjects now (persons locally,
      // causes by the model) — warn whenever a manual edit would go
      values.context && values.context !== lastGeneratedContext.current
        ? "context"
        : "",
      values.about && values.about !== lastGeneratedAbout.current
        ? "about"
        : "",
      values.reveal && values.reveal !== lastGeneratedReveal.current
        ? "reveal"
        : "",
    ].filter(Boolean)

    if (manualFields.length > 0) {
      const list =
        manualFields.length === 1
          ? manualFields[0]
          : manualFields.slice(0, -1).join(", ") + " and " + manualFields.at(-1)
      if (!window.confirm(`Replace your ${list} with a new example?`)) return
    }

    form.setValue("openingLine", suggestedOpeningLine)
    lastGeneratedOpeningLine.current = suggestedOpeningLine

    if (suggestedName !== null) {
      form.setValue("name", suggestedName)
      lastGeneratedName.current = suggestedName
    }
    if (suggestedContext !== null) {
      form.setValue("context", suggestedContext)
      lastGeneratedContext.current = suggestedContext
    }

    setIsGenerating(true)
    try {
      const result = await safeGenerateDraft({
        register: reg as Register,
        subject: sub,
        topicId: topic.isCustom ? "" : topic.topicId,
        primaryCharityId,
        pronoun:
          sub === "someone"
            ? grouping !== "individual"
              ? "they"
              : pronoun
            : undefined,
        // The name lets the model catch "not actually a person" (appeals,
        // funds) and fall back to protagonist-less grammar
        displayName:
          sub === "cause"
            ? (values.causeLabel ?? null)
            : (suggestedName ?? values.name ?? null),
        ...(topic.isCustom && {
          topicTitle: topic.title,
          itemLabels: topic.customLabels ?? [],
        }),
      })
      if (!result) {
        toast.error(
          "Couldn't generate an example — you can write your own instead.",
          { style: TOAST_ERROR_STYLE }
        )
      } else {
        form.setValue("about", result.about)
        lastGeneratedAbout.current = result.about
        form.setValue("reveal", result.reveal)
        lastGeneratedReveal.current = result.reveal
        // Cause hero fields (normalised structure, 2026-07-30): the model
        // suggests a cause name only when none was set, and a context
        // subline. Replacement of manual edits was already confirmed above.
        if (sub === "cause") {
          if (result.causeLabel && !values.causeLabel?.trim()) {
            form.setValue("causeLabel", result.causeLabel)
            lastGeneratedCauseLabel.current = result.causeLabel
          }
          // A selected occasion already stamped a deterministic context
          // above — the model's register-level one must not overwrite it.
          if (result.context && !occ) {
            form.setValue("context", result.context)
            lastGeneratedContext.current = result.context
          }
        }
      }
    } catch {
      toast.error(
        "Couldn't generate an example — you can write your own instead.",
        { style: TOAST_ERROR_STYLE }
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const category = useWatch({ control: form.control, name: "category" })
  const subjectWatch = useWatch({ control: form.control, name: "subject" })
  const pronounWatch = useWatch({ control: form.control, name: "pronoun" })
  const groupingWatch =
    useWatch({ control: form.control, name: "grouping" }) ?? "individual"

  // The who refinement (moved here from the wizard, 2026-07-30): pronoun
  // and pair/group only shape suggestions, so they live with Generate —
  // which also makes them editable after creation.
  const whoValue =
    groupingWatch === "couple"
      ? "couple"
      : groupingWatch === "group"
        ? "group"
        : (pronounWatch ?? "")

  // Tapping a who icon applies the refinement AND generates in one step
  // (founder, 2026-07-30): setValue is synchronous, so handleRegenerate's
  // form.getValues() sees the fresh who.
  function handleWhoGenerate(v: string) {
    const grouping: FavpollGrouping =
      v === "couple" ? "couple" : v === "group" ? "group" : "individual"
    const pronoun = v === "couple" || v === "group" ? undefined : (v as Pronoun)
    form.setValue("grouping", grouping, { shouldDirty: true })
    form.setValue("pronoun", pronoun, { shouldDirty: true })
    // Register depends on grouping (celebrating one vs many) — re-derive
    // so the generation uses the right grammar.
    const newRegister = deriveRegister(
      (form.getValues("category") as FavpollCategory | null) ?? null,
      grouping,
      form.getValues("subject") ?? "someone"
    )
    form.setValue("register", newRegister, { shouldDirty: true })
    // A who change can invalidate the selected occasion (She with
    // "Wedding" picked, Group with "Renewal of vows") — clear rather than
    // generate mismatched copy.
    let occ: OccasionSpec | null = occasion
    if (
      occ &&
      !occasionsForRegister(newRegister, groupingFilterFor(grouping)).includes(
        occ
      )
    ) {
      occ = null
      setOccasion(null)
    }
    void handleRegenerate(occ)
  }
  const registerWatch = useWatch({ control: form.control, name: "register" })

  // The occasion list narrows with the who selection (founder,
  // 2026-07-30): who → register → occasions, and Pair/Group narrow
  // celebrating_many further. A celebration has no occasion list until a
  // who is picked — the chip waits.
  const occasionReady =
    subjectWatch === "cause" || category !== "celebration" || whoValue !== ""
  const availableOccasions = registerWatch
    ? occasionsForRegister(
        registerWatch as Register,
        groupingFilterFor(groupingWatch)
      )
    : []

  function handleOccasionSelect(o: OccasionSpec | null) {
    setOccasion(o)
    void handleRegenerate(o)
  }

  const goalAmount = useWatch({ control: form.control, name: "goalAmount" })
  const charityIds =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const selectedTopics =
    useWatch({ control: form.control, name: "topics" }) ?? []
  const showSparkles = selectedTopics[0]?.isCustom
    ? !!selectedTopics[0]?.title
    : !!selectedTopics[0]?.topicId

  // No category and no cause subject means we didn't arrive through the
  // wizard — nothing to render. A cause favpoll legitimately has no
  // category (null since the 2026-07-13 remodel), so it must not be
  // caught by this guard.
  if (!category && subjectWatch !== "cause") return null

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  return (
    <>
      <div className="overflow-x-clip bg-primary/5">
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background px-6 pb-24 md:px-16 md:pt-0 md:pb-24 md:drop-shadow-lg">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Left — hero + poll */}
            <div>
              {showSparkles && (
                <div className="sticky top-16 z-30 flex h-0 items-start justify-center overflow-visible">
                  <div className="flex items-center gap-1 rounded-full bg-primary py-1 pr-1 pl-3 text-primary-foreground shadow-md">
                    {/* "Generate an example" is the group's TITLE; the
                        who icons are the triggers — one tap sets the
                        refinement and generates (founder, 2026-07-30).
                        Causes have no who: a single sparkle triggers.
                        The occasion chip narrows the deterministic
                        fields; its list depends on the who, so it waits
                        for one on celebrations. */}
                    <span className="flex items-center gap-1.5 pr-1 text-sm font-medium whitespace-nowrap">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {isGenerating ? (
                        "Generating…"
                      ) : (
                        <>
                          <span className="sm:hidden">Generate</span>
                          <span className="hidden sm:inline">
                            Generate an example
                          </span>
                        </>
                      )}
                    </span>
                    <div className="h-5 w-px shrink-0 bg-primary-foreground/30" />
                    {subjectWatch !== "cause" ? (
                      <div
                        role="group"
                        aria-label="Generate an example for…"
                        className="flex items-center gap-0.5"
                      >
                        {(
                          [
                            { value: "he", label: "He", icon: Mars },
                            { value: "she", label: "She", icon: Venus },
                            { value: "they", label: "They", icon: NonBinary },
                            { value: "couple", label: "Pair", icon: PairIcon },
                            { value: "group", label: "Group", icon: GroupIcon },
                          ] as const
                        ).map(({ value, label, icon: Icon }) => (
                          <Button
                            key={value}
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isGenerating}
                            aria-label={`Generate for ${label}`}
                            aria-pressed={whoValue === value}
                            title={label}
                            onClick={() => handleWhoGenerate(value)}
                            className={
                              whoValue === value ? PILL_CHIP_ON : PILL_CHIP_OFF
                            }
                          >
                            <Icon aria-hidden="true" />
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="icon"
                        disabled={isGenerating}
                        aria-label="Generate an example"
                        onClick={() => void handleRegenerate()}
                        className="size-7 rounded-full bg-primary-foreground p-0 text-primary hover:bg-primary-foreground/90 sm:size-8 [&_svg]:!h-4 [&_svg]:!w-4"
                      >
                        <Sparkles aria-hidden="true" />
                      </Button>
                    )}
                    <div className="h-5 w-px shrink-0 bg-primary-foreground/30" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isGenerating || !occasionReady}
                      aria-label={
                        occasion
                          ? `Occasion: ${occasion.label}`
                          : "Pick an occasion"
                      }
                      aria-pressed={occasion !== null}
                      title={occasion?.label ?? "Occasion"}
                      onClick={() => setOccasionOpen(true)}
                      className={
                        (occasion ? PILL_CHIP_ON : PILL_CHIP_OFF) +
                        " disabled:opacity-40"
                      }
                    >
                      <CalendarHeart aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
              <OccasionPicker
                open={occasionOpen}
                onOpenChange={setOccasionOpen}
                occasions={availableOccasions}
                selected={occasion}
                onSelect={handleOccasionSelect}
              />
              {/* Wrapped so a caller's click event can't land in the
                  occasionOverride parameter */}
              <EditableHero
                isGenerating={isGenerating}
                onRegenerate={() => void handleRegenerate()}
              />
              <EditablePollArea
                isGenerating={isGenerating}
                onRegenerate={() => void handleRegenerate()}
              />
            </div>

            {/* Right — meta. Flows below the poll on mobile; a sticky
                sidebar from lg. Kept reachable on mobile so goal +
                closing-date editing aren't desktop-only. */}
            <div className="space-y-4 self-start bg-background lg:sticky lg:top-14 lg:z-10 lg:pt-16">
              <EditableCountdown
                closesAt={closesAt}
                onClosesAtChange={onClosesAtChange}
              />
              <CharityBanner
                charities={displayCharities}
                totalRaised={0}
                goalAmount={goalAmount ?? null}
                onEditGoal={() => setGoalOpen(true)}
              />
              <GoalOverlay open={goalOpen} onOpenChange={setGoalOpen} />
              <div className="pointer-events-none opacity-40">
                <div className="rounded-lg border border-border bg-background px-5 py-4">
                  <p className="mt-1 text-sm text-muted-foreground">
                    <b>£0.00</b> available for guests who need help to pledge.
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 flex w-full"
                  >
                    Add to the shared fund
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CommandPanel
        mode={mode}
        submitting={submitting}
        error={error}
        onSubmit={onSubmit}
      />
    </>
  )
}
