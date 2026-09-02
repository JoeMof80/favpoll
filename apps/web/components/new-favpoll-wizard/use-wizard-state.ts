import { useState } from "react"
import { useRouter } from "next/navigation"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import { createFavpoll, uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { updateFavpoll } from "@/app/favpolls/[id]/edit/actions"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import { groupingForWho, subjectForWho, type WhoValue } from "@/lib/who"
import { deriveRegister } from "@/lib/registers"
import type {
  Category,
  Charity,
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
  Favourite,
  Pronoun,
  TopicWithMeta,
} from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

export const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

export { STEPS, STEP_LABELS }

type WizardTopics = FavpollFormValues["topics"]

export type WizardData = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  suggestedTopicIds?: Record<string, string[]>
}

/**
 * Edit-mode configuration (extended-wizard Phase 2): the wizard renders
 * prefilled at /favpolls/[id]/edit, the rail is clickable, the final
 * button is Save (updateFavpoll), and — once the favpoll has taken any
 * money (a pledge or a shared-fund top-up) — Event, Charity and Topic
 * lock: their steps render read-only and the server refuses changes.
 */
export type WizardEditConfig = {
  favpollId: string
  protagonistId: string | null
  existingPollId: string | null
  /** True once any pledge or shared-fund top-up exists. */
  locked: boolean
  initialClosesAt: string | null
  initial: {
    category: FavpollCategory | null
    grouping: FavpollGrouping
    subject: FavpollSubject
    pronoun: Pronoun | undefined
    charityIds: string[]
    topics: WizardTopics
    openingLine: string
    name: string
    context: string
    photoUrl: string | null
    about: string
    reveal: string
    goalAmount: number | undefined
    isListed: boolean
    isPrivate: boolean
  }
}

// The three-notch visibility axis. Listed = browsable on /favpolls;
// unlisted = by link, not by browsing; private = the page itself gates
// on sign-in and link previews show a placeholder. is_listed/is_private
// stay separate columns — this is the one place they meet as one control.
export type WizardVisibility = "listed" | "unlisted" | "private"

function whoFor(
  subject: FavpollSubject,
  grouping: FavpollGrouping,
  pronoun: Pronoun | undefined
): WhoValue | "" {
  if (subject === "cause") return "cause"
  if (grouping === "couple") return "couple"
  if (grouping === "group") return "group"
  return pronoun ?? ""
}

function sortTopicItems(items: Favourite[]): Favourite[] {
  return [...items].sort((a, b) => {
    const aOrder = a.display_order ?? Infinity
    const bOrder = b.display_order ?? Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.label.localeCompare(b.label)
  })
}

export function useWizardState(data: WizardData, edit?: WizardEditConfig) {
  const isEdit = !!edit
  const init = edit?.initial
  const router = useRouter()

  const [step, setStep] = useState<WizardStep>("event")
  const [category, setCategory] = useState<FavpollCategory | null>(
    init?.category ?? null
  )
  const [grouping, setGrouping] = useState<FavpollGrouping>(
    init?.grouping ?? "individual"
  )
  const [subject, setSubject] = useState<FavpollSubject>(
    init?.subject ?? "someone"
  )
  const [pronoun, setPronoun] = useState<Pronoun | undefined>(init?.pronoun)
  const [topics, setTopics] = useState<WizardTopics>(init?.topics ?? [])
  const [charityIds, setCharityIds] = useState<string[]>(init?.charityIds ?? [])
  const [topicOpen, setTopicOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)

  // The appended steps' fields (Info · Story · Details).
  const [openingLine, setOpeningLine] = useState(init?.openingLine ?? "")
  const [name, setName] = useState(init?.name ?? "")
  const [context, setContext] = useState(init?.context ?? "")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    init?.photoUrl ?? null
  )
  const [about, setAbout] = useState(init?.about ?? "")
  const [reveal, setReveal] = useState(init?.reveal ?? "")
  const [who, setWho] = useState<WhoValue | "">(
    init ? whoFor(init.subject, init.grouping, init.pronoun) : ""
  )
  const [goalAmount, setGoalAmount] = useState<number | undefined>(
    init?.goalAmount
  )
  const [goalDraft, setGoalDraft] = useState(
    init?.goalAmount ? String(init.goalAmount) : ""
  )
  const [closesAt, setClosesAt] = useState<Date | undefined>(
    edit?.initialClosesAt ? new Date(edit.initialClosesAt) : undefined
  )
  const [visibilityOverride, setVisibilityOverride] =
    useState<WizardVisibility | null>(
      init
        ? init.isPrivate
          ? "private"
          : init.isListed
            ? "listed"
            : "unlisted"
        : null
    )

  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seedFavpollId, setSeedFavpollId] = useState<string | null>(null)

  const register = deriveRegister(category, grouping, subject)

  // Visibility follows the register — memorials default to link-only
  // (the old rule: isListed = register !== "remembering") — until the
  // organiser touches the control.
  const visibility =
    visibilityOverride ?? (register === "remembering" ? "unlisted" : "listed")
  const isListed = visibility === "listed"
  const isPrivate = visibility === "private"

  const stepIndex = STEPS.indexOf(step)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const customLabels = topics[0]?.customLabels ?? []
  const customItemCount = topics[0]?.isCustom ? customLabels.length : null

  const selectedTopic =
    topics[0] && !topics[0].isCustom
      ? (data.topics.find((t) => t.id === topics[0].topicId) ?? null)
      : null

  const sortedExistingItems = selectedTopic
    ? sortTopicItems(selectedTopic.favourites)
    : []

  const dialogExistingItems = sortedExistingItems.map((i) => ({
    id: i.id,
    label: i.label,
  }))

  const showItemsSection =
    topics.length > 0 && (topics[0]?.isCustom || !!selectedTopic)

  const isCause = subject === "cause"

  // Money has moved: Event, Charity and Topic are read-only (Phase 2
  // locking; the server enforces the same rule in updateFavpoll).
  const stepLocked: Record<WizardStep, boolean> = {
    event: !!edit?.locked,
    charity: !!edit?.locked,
    topic: !!edit?.locked,
    info: false,
    story: false,
    details: false,
  }

  const topicDone =
    topics.length > 0 &&
    !(
      topics[0]?.isCustom === true &&
      customItemCount !== null &&
      customItemCount < 2
    )

  const nextDisabled =
    step === "event"
      ? !category
      : step === "charity"
        ? charityIds.length === 0
        : step === "topic"
          ? !topicDone
          : step === "info"
            ? !name.trim()
            : step === "story"
              ? !about.trim()
              : false

  const selectedCharities = data.charities.filter((c) =>
    charityIds.includes(c.id)
  )

  const primaryCharity =
    data.charities.find((c) => c.id === charityIds[0]) ?? null

  const suggestedTopics = (
    primaryCharity
      ? ((data.suggestedTopicIds ?? {})[primaryCharity.id] ?? [])
      : []
  )
    .map((id) => data.topics.find((t) => t.id === id))
    .filter((t): t is TopicWithMeta => !!t)

  // THE RAIL'S PURPOSE (founder, 2026-09-02): a glanceable AUDIT OF
  // CHOICES — nouns you chose, never sentences you wrote. Identities
  // and named states only; no counts, no prose excerpts. See the
  // doctrine comment in wizard-step-rail.tsx.
  const VISIBILITY_LABELS: Record<WizardVisibility, string> = {
    listed: "Listed",
    unlisted: "Link only",
    private: "Private",
  }
  const railSummary: Record<WizardStep, string> = {
    event: category ? category.charAt(0).toUpperCase() + category.slice(1) : "",
    charity:
      selectedCharities.length <= 2
        ? selectedCharities.map((c) => c.name).join(" & ")
        : `${selectedCharities[0].name} + ${selectedCharities.length - 1} more`,
    topic: topics[0]?.title ?? "",
    info: name.trim(),
    story: reveal.trim() ? "Reveal" : "",
    // Visibility always shows — the register-derived default (memorials
    // open link-only) is a fact worth surfacing before it is touched.
    details: [
      goalAmount ? `£${goalAmount} goal` : null,
      closesAt
        ? `closes ${closesAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : null,
      VISIBILITY_LABELS[visibility],
    ]
      .filter(Boolean)
      .join(" · "),
  }

  const railDone: Record<WizardStep, boolean> = {
    event: !!category,
    charity: charityIds.length > 0,
    topic: topicDone,
    info: !!name.trim(),
    story: !!about.trim(),
    // Settings has defaults, so "done" means TOUCHED — the old hardcoded
    // false meant the step could never earn its tick (option B fix).
    details:
      !!closesAt || goalAmount !== undefined || visibilityOverride !== null,
  }

  function handleAddItem(label: string) {
    const current = topics[0]
    if (!current) return
    const existing = current.customLabels ?? []
    const canonicalLabels = selectedTopic?.favourites.map((i) => i.label) ?? []
    if (
      [...existing, ...canonicalLabels].some(
        (l) => l.toLowerCase() === label.toLowerCase()
      )
    )
      return
    setTopics([{ ...current, customLabels: [...existing, label] }])
  }

  function handleRemoveItem(label: string) {
    const current = topics[0]
    if (!current) return
    setTopics([
      {
        ...current,
        customLabels: (current.customLabels ?? []).filter((l) => l !== label),
      },
    ])
  }

  function handleNext() {
    setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]!)
  }

  function handleBack() {
    setStep(STEPS[Math.max(stepIndex - 1, 0)]!)
  }

  function goToStep(target: WizardStep) {
    setStep(target)
  }

  // Which steps a click may open. Edit mode: all of them (the favpoll
  // exists; every answer is revisitable). Create mode: only steps
  // already passed — a forward jump would skip the step gates
  // (nextDisabled), so onward travel stays with the Next button.
  function canJumpTo(target: WizardStep) {
    return isEdit || STEPS.indexOf(target) < stepIndex
  }

  // The who axis lives on the Name field. Cause and Pair/Group are
  // structural, not just generation metadata — they drive the register
  // and route the About into protagonist vs description at publish.
  // Pronouns are NEVER inferred from the name.
  function handleWho(value: WhoValue) {
    setWho(value)
    setGrouping(groupingForWho(value))
    setSubject(subjectForWho(value))
    setPronoun(
      value === "he" || value === "she" || value === "they" ? value : undefined
    )
  }

  // Cause only exists under Fundraiser (the who dropdown hides it
  // elsewhere) — subject "cause" overrides the category in
  // deriveRegister, so leaving it selected would silently turn a
  // memorial into a cause. Switching type away resets the who axis
  // to neutral instead of stranding a hidden answer.
  function handleCategory(value: FavpollCategory | null) {
    setCategory(value)
    if (value !== "fundraiser" && who === "cause") {
      setWho("")
      setGrouping("individual")
      setSubject("someone")
      setPronoun(undefined)
    }
  }

  // One-click generation: by the Story step the wizard already holds
  // register, charity, topic, name, context and who — the full
  // calibration set. No dialog (extended-wizard verdict).
  async function generateExample() {
    const topic = topics[0]
    if (!topic || generating) return
    setGenerating(true)
    try {
      const result = await safeGenerateDraft({
        register,
        subject,
        topicId: topic.isCustom ? "" : topic.topicId,
        topicTitle: topic.isCustom ? topic.title : undefined,
        itemLabels: topic.isCustom ? (topic.customLabels ?? []) : undefined,
        primaryCharityId: primaryCharity?.id ?? null,
        pronoun,
        displayName: name.trim() || null,
      })
      if (!result) return
      setAbout(result.about)
      setReveal(result.reveal)
      if (isCause) {
        if (!name.trim() && result.causeLabel) setName(result.causeLabel)
        if (!context.trim() && result.context) setContext(result.context)
      }
    } finally {
      setGenerating(false)
    }
  }

  // Publish (create) or Save (edit) — the whole payload in one call.
  // Create: SeedFundModal then offers the fund head start (a payment
  // needs the created favpoll), and onComplete navigates. Edit: navigate
  // straight back to the page.
  async function handleFinish() {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      let resolvedPhotoUrl = photoUrl
      if (photo) {
        const fd = new FormData()
        fd.append("photo", photo)
        resolvedPhotoUrl = await uploadPersonPhoto(fd)
      }

      const selected = topics[0]
      if (!selected) throw new Error("Missing topic")
      const topicMeta = data.topics.find((t) => t.id === selected.topicId)
      const isCustomTopic = selected.isCustom ?? false

      const resolvedClosesAt =
        closesAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

      sessionStorage.removeItem(DRAFT_ADDITIONS_KEY)

      if (edit) {
        await updateFavpoll(edit.favpollId, edit.protagonistId ?? "", {
          protagonistName: isCause ? "" : name,
          protagonistAbout: isCause ? null : about || null,
          photoUrl: resolvedPhotoUrl,
          dateLabel: context || null,
          category: category ?? null,
          grouping,
          subject,
          causeLabel: isCause ? name.trim() || null : null,
          pronoun: isCause ? null : (pronoun ?? null),
          openingLine: openingLine || null,
          description: isCause ? about.trim() || null : null,
          charityIds,
          closesAt: resolvedClosesAt.toISOString(),
          isPrivate,
          isListed,
          potAmount: null,
          goalAmount: goalAmount ?? null,
          poll: {
            id: edit.existingPollId ?? undefined,
            topicId: isCustomTopic ? null : selected.topicId,
            topicIsCustom: isCustomTopic,
            customTopicTitle: isCustomTopic ? selected.title : "",
            customTopicItems: isCustomTopic
              ? (selected.customLabels ?? [])
              : [],
            reveal: reveal || null,
            infiniteItems:
              !isCustomTopic && topicMeta && !topicMeta.is_finite
                ? {
                    canonicalItemIds: topicMeta.favourites
                      .filter((i) => i.is_canonical)
                      .map((i) => i.id),
                    customLabels: selected.customLabels ?? [],
                  }
                : null,
          },
        })
        router.push(`/favpolls/${edit.favpollId}`)
        return
      }

      const { favpollId } = await createFavpoll({
        protagonistName: isCause ? "" : name,
        protagonistAbout: isCause ? null : about || null,
        photoUrl: resolvedPhotoUrl,
        dateLabel: context || null,
        category: category ?? null,
        grouping,
        subject,
        causeLabel: isCause ? name.trim() || null : null,
        pronoun: isCause ? null : (pronoun ?? null),
        openingLine: openingLine || null,
        description: isCause ? about.trim() || null : null,
        charityIds,
        closesAt: resolvedClosesAt.toISOString(),
        isPrivate,
        isListed,
        potAmount: null,
        goalAmount: goalAmount ?? null,
        poll: {
          topicId: isCustomTopic ? null : selected.topicId,
          customTopic: isCustomTopic
            ? {
                title: selected.title,
                items: selected.customLabels ?? [],
              }
            : null,
          reveal: reveal || null,
          infiniteItems:
            !isCustomTopic && topicMeta && !topicMeta.is_finite
              ? {
                  canonicalItemIds: topicMeta.favourites
                    .filter((i) => i.is_canonical)
                    .map((i) => i.id),
                  customLabels: selected.customLabels ?? [],
                }
              : null,
          addedItems: isCustomTopic ? [] : (selected.customLabels ?? []),
        },
      })
      setSeedFavpollId(favpollId)
    } catch (err) {
      if (!(err instanceof Error)) throw err
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  function completeSeed() {
    if (seedFavpollId) router.push(`/favpolls/${seedFavpollId}`)
  }

  return {
    step,
    stepIndex,
    isFirst,
    isLast,
    category,
    grouping,
    subject,
    pronoun,
    topics,
    charityIds,
    topicOpen,
    setTopicOpen,
    charityOpen,
    setCharityOpen,
    itemsDialogOpen,
    setItemsDialogOpen,
    customLabels,
    selectedTopic,
    sortedExistingItems,
    dialogExistingItems,
    showItemsSection,
    nextDisabled,
    selectedCharities,
    primaryCharity,
    suggestedTopics,
    handleCategory,
    setGrouping,
    setSubject,
    setPronoun,
    setTopics,
    setCharityIds,
    handleAddItem,
    handleRemoveItem,
    handleNext,
    handleBack,
    goToStep,
    canJumpTo,
    // Info · Story · Details
    openingLine,
    setOpeningLine,
    name,
    setName,
    context,
    setContext,
    photo,
    setPhoto,
    photoUrl,
    setPhotoUrl,
    about,
    setAbout,
    reveal,
    setReveal,
    who,
    handleWho,
    goalAmount,
    setGoalAmount,
    goalDraft,
    setGoalDraft,
    closesAt,
    setClosesAt,
    visibility,
    setVisibility: (v: WizardVisibility) => setVisibilityOverride(v),
    isCause,
    isEdit,
    stepLocked,
    railSummary,
    railDone,
    generating,
    generateExample,
    submitting,
    error,
    seedFavpollId,
    completeSeed,
    handleFinish,
  }
}

export type WizardState = ReturnType<typeof useWizardState>
