import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent } from "@/app/events/new/actions"
import { OCCASION_PLACEHOLDERS, DEFAULT_PLACEHOLDERS } from "@/lib/occasions"
import type {
  Category,
  Charity,
  CanvasPoll,
  CanvasSubmitData,
  CanvasInitialData,
  TopicWithMeta,
} from "@/types"
import { MAX_CHARITIES, newPoll, type CanvasState } from "./utils"

export type UseCanvasOptions = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  preselectedTopicId?: string | null
  mode: "create" | "edit"
  initialData?: CanvasInitialData
  onSave?: (data: CanvasSubmitData) => Promise<void>
}

export function useCanvas({
  topics,
  preselectedTopicId,
  initialData,
  onSave,
}: UseCanvasOptions) {
  const router = useRouter()

  const [state, setState] = useState<CanvasState>({
    protagonistName: "",
    protagonistBio: "",
    dateLabel: "",
    occasion: "",
    occasionLabel: "",
    description: "",
    charityIds: [],
    charitySearch: "",
    closesAt: "",
    isPrivate: false,
    potAmount: "",
    polls: [newPoll(preselectedTopicId ?? "")],
    ...initialData,
  })

  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialData?.photoUrl ?? null
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)

  function set<K extends keyof CanvasState>(key: K, value: CanvasState[K]) {
    setState((s) => ({ ...s, [key]: value }))
  }

  function updatePoll(key: string, updates: Partial<CanvasPoll>) {
    setState((s) => ({
      ...s,
      polls: s.polls.map((p) => (p.key === key ? { ...p, ...updates } : p)),
    }))
  }

  function removePoll(key: string) {
    setState((s) => ({ ...s, polls: s.polls.filter((p) => p.key !== key) }))
  }

  function removePollByTopicId(topicId: string) {
    setState((s) => ({ ...s, polls: s.polls.filter((p) => p.topicId !== topicId) }))
  }

  function selectTopic(pollKey: string, topic: TopicWithMeta) {
    updatePoll(pollKey, {
      topicId: topic.id,
      topicIsCustom: false,
      pickingTopic: false,
      prioritizedItemIds: [],
      prioritizedCustomLabels: [],
      curatedCustomLabels: [],
    })
  }

  function toggleCharity(id: string) {
    setState((s) => ({
      ...s,
      charityIds: s.charityIds.includes(id)
        ? s.charityIds.filter((c) => c !== id)
        : s.charityIds.length >= MAX_CHARITIES
          ? s.charityIds
          : [...s.charityIds, id],
      charitySearch: "",
    }))
  }

  async function handleSubmit() {
    setError(null)

    if (!state.protagonistName.trim()) return setError("Please enter a name")
    if (!state.occasion) return setError("Please select an occasion")
    if (state.charityIds.length === 0)
      return setError("Please select at least one charity")
    if (state.polls.length === 0)
      return setError("Please add at least one poll")
    if (!state.closesAt) return setError("Please set a closing date")

    for (const poll of state.polls) {
      if (!poll.topicId && !poll.topicIsCustom)
        return setError("All polls need a topic selected")
      if (poll.topicIsCustom) {
        if (!poll.customTopicTitle.trim())
          return setError("Custom poll needs a title")
        if (poll.customTopicItems.filter((i) => i.trim()).length < 2)
          return setError("Custom poll needs at least 2 options")
      }
    }

    setSubmitting(true)
    try {
      const submitData: CanvasSubmitData = {
        protagonistName: state.protagonistName,
        protagonistBio: state.protagonistBio || null,
        dateLabel: state.dateLabel || null,
        photoUrl,
        occasionLabel: state.occasionLabel || null,
        occasion: state.occasion,
        description: state.description || null,
        charityIds: state.charityIds,
        closesAt: state.closesAt,
        isPrivate: state.isPrivate,
        potAmount: state.potAmount ? parseFloat(state.potAmount) : null,
        polls: state.polls.map((poll) => {
          const topic = topics.find((t) => t.id === poll.topicId)
          return {
            id: poll.id,
            topicId: poll.topicIsCustom ? null : poll.topicId || null,
            topicIsCustom: poll.topicIsCustom,
            customTopicTitle: poll.customTopicTitle,
            customTopicItems: poll.customTopicItems,
            framing: poll.framing || null,
            reveal: poll.reveal || null,
            infiniteItems:
              !poll.topicIsCustom && topic && !topic.is_finite
                ? {
                    prioritizedItemIds: poll.prioritizedItemIds,
                    canonicalItemIds: [
                      ...poll.prioritizedItemIds,
                      ...topic.topic_items
                        .filter(
                          (i) =>
                            (topic.is_active === false || i.is_canonical) &&
                            !poll.prioritizedItemIds.includes(i.id)
                        )
                        .map((i) => i.id),
                    ],
                    customLabels: poll.curatedCustomLabels.filter((l) =>
                      l.trim()
                    ),
                  }
                : null,
          }
        }),
      }

      if (onSave) {
        await onSave(submitData)
      } else {
        const { eventId: newId } = await createEvent({
          protagonistName: submitData.protagonistName,
          protagonistBio: submitData.protagonistBio ?? null,
          photoUrl: submitData.photoUrl ?? null,
          dateLabel: submitData.dateLabel,
          occasion: submitData.occasion,
          occasionLabel: submitData.occasionLabel,
          description: submitData.description,
          charityIds: submitData.charityIds,
          closesAt: submitData.closesAt,
          isPrivate: submitData.isPrivate,
          potAmount: submitData.potAmount,
          polls: submitData.polls.map((p) => ({
            topicId: p.topicId,
            customTopic: p.topicIsCustom
              ? {
                  title: `Favourite ${p.customTopicTitle.trim()}`,
                  items: p.customTopicItems.filter((i) => i.trim()),
                }
              : null,
            framing: p.framing,
            reveal: p.reveal,
            infiniteItems: p.infiniteItems,
          })),
        })
        setShareLink(`/events/${newId}`)
      }
    } catch (err) {
      // Re-throw Next.js redirect/notFound — they're not real errors
      if (!(err instanceof Error)) throw err
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const placeholders =
    OCCASION_PLACEHOLDERS[state.occasion] ?? DEFAULT_PLACEHOLDERS

  return {
    state,
    setState,
    photoUrl,
    setPhotoUrl,
    submitting,
    error,
    shareLink,
    placeholders,
    router,
    set,
    updatePoll,
    removePollByTopicId,
    selectTopic,
    toggleCharity,
    handleSubmit,
  }
}
