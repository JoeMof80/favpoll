import { useState } from "react"
import { useRouter } from "next/navigation"
import { getWizardCopy, type WizardStep } from "@/lib/wizard-copy"
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

export const STEPS: WizardStep[] = ["honour", "charity", "love"]

export const STEP_LABELS: Record<WizardStep, string> = {
  honour: "Honour",
  charity: "Charity",
  love: "Love",
}

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

  const [step, setStep] = useState<WizardStep>("honour")
  const [category, setCategory] = useState<FavpollCategory | null>(null)
  const [grouping, setGrouping] = useState<FavpollGrouping>("individual")
  const [subject, setSubject] = useState<FavpollSubject>("someone")
  const [pronoun, setPronoun] = useState<Pronoun | undefined>(undefined)
  const [topics, setTopics] = useState<WizardTopics>([])
  const [charityIds, setCharityIds] = useState<string[]>([])
  const [loveOpen, setLoveOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)

  const stepIndex = STEPS.indexOf(step)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const copy = getWizardCopy(subject)

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

  const whoSelected =
    grouping !== "individual" || subject === "cause" || pronoun !== undefined

  const nextDisabled =
    step === "honour"
      ? !category || !whoSelected
      : step === "charity"
        ? charityIds.length === 0
        : topics.length === 0 ||
          (topics[0]?.isCustom === true &&
            customItemCount !== null &&
            customItemCount < 2)

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
    if (step === "honour") setStep("charity")
    else if (step === "charity") setStep("love")
  }

  function handleBack() {
    if (step === "love") setStep("charity")
    else if (step === "charity") setStep("honour")
  }

  function handleFinish() {
    const topic = topics[0]
    const params = new URLSearchParams({
      category: category ?? "",
      grouping,
      subject,
      charityIds: charityIds.join(","),
    })
    if (pronoun) {
      params.set("pronoun", pronoun)
    }
    if (topic) {
      if (topic.isCustom || customLabels.length > 0) {
        sessionStorage.setItem(
          DRAFT_ADDITIONS_KEY,
          JSON.stringify({
            topicRef: topic.isCustom
              ? { kind: "new", title: topic.title }
              : { kind: "existing", id: topic.topicId },
            addedItems: customLabels,
          })
        )
        params.set("draftAdditions", "1")
      } else {
        params.set("topicId", topic.topicId)
        params.set("topicTitle", topic.title)
      }
    }
    router.push(`/favpolls/new/details?${params}`)
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
    loveOpen,
    setLoveOpen,
    charityOpen,
    setCharityOpen,
    itemsDialogOpen,
    setItemsDialogOpen,
    copy,
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
    handleFinish,
  }
}
