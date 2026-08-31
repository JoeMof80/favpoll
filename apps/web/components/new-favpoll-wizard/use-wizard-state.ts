import { useState } from "react"
import { useRouter } from "next/navigation"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import { createFavpoll, uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import {
  groupingForWho,
  subjectForWho,
  type WhoValue,
} from "@/components/favpoll-form/generate-example-dialog"
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

function sortTopicItems(items: Favourite[]): Favourite[] {
  return [...items].sort((a, b) => {
    const aOrder = a.display_order ?? Infinity
    const bOrder = b.display_order ?? Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.label.localeCompare(b.label)
  })
}

export function useWizardState(data: WizardData) {
  const router = useRouter()

  const [step, setStep] = useState<WizardStep>("event")
  const [category, setCategory] = useState<FavpollCategory | null>(null)
  const [grouping, setGrouping] = useState<FavpollGrouping>("individual")
  const [subject, setSubject] = useState<FavpollSubject>("someone")
  const [pronoun, setPronoun] = useState<Pronoun | undefined>(undefined)
  const [topics, setTopics] = useState<WizardTopics>([])
  const [charityIds, setCharityIds] = useState<string[]>([])
  const [topicOpen, setTopicOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)

  // The appended steps' fields (Info · Story · Details).
  const [openingLine, setOpeningLine] = useState("")
  const [name, setName] = useState("")
  const [context, setContext] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [about, setAbout] = useState("")
  const [reveal, setReveal] = useState("")
  const [who, setWho] = useState<WhoValue | "">("")
  const [goalAmount, setGoalAmount] = useState<number | undefined>(undefined)
  const [goalDraft, setGoalDraft] = useState("")
  const [closesAt, setClosesAt] = useState<Date | undefined>(undefined)
  const [listedOverride, setListedOverride] = useState<boolean | null>(null)

  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seedFavpollId, setSeedFavpollId] = useState<string | null>(null)

  const register = deriveRegister(category, grouping, subject)

  // Listed follows the register — memorials default unlisted (the
  // details page's rule: register !== "remembering") — until the
  // organiser touches the switch.
  const isListed = listedOverride ?? register !== "remembering"

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

  // The rail tracks the answers: a tick once a step's content is in, and
  // the chosen thing itself as a one-line summary.
  const railSummary: Record<WizardStep, string> = {
    event: category ? category.charAt(0).toUpperCase() + category.slice(1) : "",
    charity: selectedCharities.map((c) => c.name).join(", "),
    topic: topics[0]?.title ?? "",
    info: name.trim(),
    story: about.trim(),
    details: [
      goalAmount ? `£${goalAmount} goal` : null,
      closesAt
        ? `closes ${closesAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
        : null,
      isListed ? null : "unlisted",
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
    details: false,
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

  // Publish — the whole payload in one call, exactly as the form's
  // create branch did. SeedFundModal then offers the fund head start
  // (a payment needs the created favpoll), and onComplete navigates.
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
        isPrivate: false,
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
    setCategory,
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
    isListed,
    setIsListed: (v: boolean) => setListedOverride(v),
    isCause,
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
