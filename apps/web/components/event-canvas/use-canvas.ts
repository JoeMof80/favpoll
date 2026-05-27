import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent } from "@/app/events/new/actions"
import {
  OCCASION_PLACEHOLDERS,
  DEFAULT_PLACEHOLDERS,
  getAboutPlaceholder,
} from "@/lib/occasions"
import type {
  Category,
  Charity,
  CanvasPoll,
  CanvasPollInput,
  CanvasSubmitData,
  CanvasInitialData,
  TopicWithMeta,
} from "@favpoll/types"
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

  // Merge initial poll data safely — avoids spreading Partial<CanvasPoll> into CanvasState
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const initialPoll = {
    ...newPoll(preselectedTopicId ?? ""),
    ...(initialData?.poll ?? {}),
  } as CanvasPoll

  const [state, setState] = useState<CanvasState>({
    protagonistName: "",
    protagonistAbout: "",
    dateLabel: "",
    occasion: "",
    openingLine: "",
    description: "",
    charityIds: [],
    charitySearch: "",
    closesAt: "",
    isPrivate: false,
    potAmount: "",
    ...initialData,
    poll: initialPoll,
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

  function updatePoll(updates: Partial<CanvasPoll>) {
    setState((s) => ({ ...s, poll: { ...s.poll, ...updates } }))
  }

  function selectTopic(topic: TopicWithMeta) {
    updatePoll({
      topicId: topic.id,
      topicIsCustom: false,
      pickingTopic: false,
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
    if (!state.closesAt) return setError("Please set a closing date")

    const poll = state.poll
    if (!poll.topicId && !poll.topicIsCustom)
      return setError("Please select a favpoll topic")
    if (poll.topicIsCustom) {
      if (!poll.customTopicTitle.trim())
        return setError("Custom poll needs a title")
      if (poll.customTopicItems.filter((i) => i.trim()).length < 2)
        return setError("Custom poll needs at least 2 options")
    }

    setSubmitting(true)
    try {
      const { poll } = state
      const topic = topics.find((t) => t.id === poll.topicId)
      const pollInput: CanvasPollInput = {
        id: poll.id,
        topicId: poll.topicIsCustom ? null : poll.topicId || null,
        topicIsCustom: poll.topicIsCustom,
        customTopicTitle: poll.customTopicTitle,
        customTopicItems: poll.customTopicItems,
        reveal: poll.reveal || null,
        infiniteItems:
          !poll.topicIsCustom && topic && !topic.is_finite
            ? {
                canonicalItemIds: topic.topic_items
                  .filter((i) => topic.is_active === false || i.is_canonical)
                  .map((i) => i.id),
                customLabels: poll.curatedCustomLabels.filter((l) => l.trim()),
              }
            : null,
      }

      const submitData: CanvasSubmitData = {
        protagonistName: state.protagonistName,
        protagonistAbout: state.protagonistAbout || null,
        dateLabel: state.dateLabel || null,
        photoUrl,
        openingLine: state.openingLine || null,
        occasion: state.occasion,
        description: state.description || null,
        charityIds: state.charityIds,
        closesAt: state.closesAt,
        isPrivate: state.isPrivate,
        potAmount: state.potAmount ? parseFloat(state.potAmount) : null,
        poll: pollInput,
      }

      if (onSave) {
        await onSave(submitData)
      } else {
        const p = submitData.poll
        const { eventId: newId } = await createEvent({
          protagonistName: submitData.protagonistName,
          protagonistAbout: submitData.protagonistAbout ?? null,
          photoUrl: submitData.photoUrl ?? null,
          dateLabel: submitData.dateLabel,
          occasion: submitData.occasion,
          openingLine: submitData.openingLine,
          description: submitData.description,
          charityIds: submitData.charityIds,
          closesAt: submitData.closesAt,
          isPrivate: submitData.isPrivate,
          potAmount: submitData.potAmount,
          poll: {
            topicId: p.topicId,
            customTopic: p.topicIsCustom
              ? {
                  title: `Favourite ${p.customTopicTitle.trim()}`,
                  items: p.customTopicItems.filter((i) => i.trim()),
                }
              : null,
            reveal: p.reveal,
            infiniteItems: p.infiniteItems,
          },
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

  const firstTopic = topics.find((t) => t.id === state.poll.topicId)
  const topicAbout =
    firstTopic?.placeholders?.[state.occasion]?.about ??
    firstTopic?.placeholders?.["default"]?.about
  const placeholders = {
    ...(OCCASION_PLACEHOLDERS[state.occasion] ?? DEFAULT_PLACEHOLDERS),
    about: topicAbout ?? getAboutPlaceholder(state.occasion),
  }

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
    selectTopic,
    toggleCharity,
    handleSubmit,
  }
}
