"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { uploadPersonPhoto } from "@/app/events/new/actions"
import { createEvent } from "@/app/events/new/actions"
import { updateEvent, updateClosesAt } from "@/app/events/[id]/edit/actions"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import { eventFormSchema, type EventFormValues } from "./schema"
import { PreviewPanel } from "./preview-panel"
import { CommandPanel } from "./command-panel"
import { SeedFundModal } from "./seed-fund-modal"
import { toast } from "sonner"
import type {
  Category,
  Charity,
  CanvasPollInput,
  TopicWithMeta,
  Register,
} from "@favpoll/types"

const NEW_TOPIC_DRAFT_KEY = "favpoll_new_topic_draft" // legacy key — kept for old links
const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  eventId?: string
  protagonistId?: string
  existingPollId?: string
  defaultValues?: Partial<EventFormValues>
  hasNewTopicDraft?: boolean
  initialClosesAt?: string
}

export function EventFormV2({
  charities,
  topics,
  categories,
  mode,
  eventId,
  protagonistId,
  existingPollId,
  defaultValues,
  hasNewTopicDraft = false,
  initialClosesAt,
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  // Edit mode: tracks the current closes_at, mutable via the countdown overlay
  const [editClosesAt, setEditClosesAt] = useState<string | undefined>(
    initialClosesAt
  )
  const [seedEventId, setSeedEventId] = useState<string | null>(null)

  // Holds the closesAt chosen in the publish overlay (create mode)
  const pendingClosesAt = useRef<Date | null>(null)

  const form = useForm<EventFormValues, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema as never),
    defaultValues: {
      register: "",
      grouping: "individual",
      subject: "someone",
      isListed: true,
      openingLine: "",
      name: "",
      causeLabel: "",
      context: "",
      about: "",
      reveal: "",
      charities: [],
      topics: [],
      ...defaultValues,
    },
  })

  async function onSubmit(values: EventFormValues) {
    setError(null)
    setSubmitting(true)
    try {
      let resolvedPhotoUrl = values.photoUrl ?? null
      if (values.photo) {
        const fd = new FormData()
        fd.append("photo", values.photo)
        resolvedPhotoUrl = await uploadPersonPhoto(fd)
      }

      const selectedTopic = values.topics[0]
      const topicMeta = topics.find((t) => t.id === selectedTopic.topicId)
      const isCustomTopic = selectedTopic.isCustom ?? false

      const poll: CanvasPollInput = {
        id: existingPollId,
        topicId: isCustomTopic ? "" : selectedTopic.topicId,
        topicIsCustom: isCustomTopic,
        customTopicTitle: isCustomTopic ? selectedTopic.title : "",
        customTopicItems: isCustomTopic
          ? (selectedTopic.customLabels ?? [])
          : [],
        reveal: values.reveal || null,
        infiniteItems:
          !isCustomTopic && topicMeta && !topicMeta.is_finite
            ? {
                canonicalItemIds: topicMeta.topic_items
                  .filter((i) => i.is_canonical)
                  .map((i) => i.id),
                customLabels: selectedTopic.customLabels ?? [],
              }
            : null,
      }

      const eventSubject = values.subject ?? "someone"
      const isCause = eventSubject === "cause"

      if (mode === "create") {
        const closesAt =
          pendingClosesAt.current ??
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        sessionStorage.removeItem(NEW_TOPIC_DRAFT_KEY)
        sessionStorage.removeItem(DRAFT_ADDITIONS_KEY)
        const { eventId: newId } = await createEvent({
          protagonistName: isCause ? "" : (values.name ?? ""),
          protagonistAbout: isCause ? null : values.about || null,
          photoUrl: isCause ? null : resolvedPhotoUrl,
          dateLabel: isCause ? null : values.context || null,
          category: values.category ?? null,
          grouping: values.grouping ?? "individual",
          eventSubject,
          causeLabel: isCause ? values.causeLabel?.trim() || null : null,
          openingLine: values.openingLine ?? null,
          description: isCause ? values.about?.trim() || null : null,
          charityIds: values.charities,
          closesAt: closesAt.toISOString(),
          isPrivate: false,
          isListed: values.isListed ?? true,
          potAmount: null,
          poll: {
            topicId: isCustomTopic ? null : poll.topicId,
            customTopic: isCustomTopic
              ? {
                  title: selectedTopic.title,
                  items: selectedTopic.customLabels ?? [],
                }
              : null,
            reveal: values.reveal || null,
            infiniteItems: isCustomTopic ? null : poll.infiniteItems,
            addedItems: isCustomTopic ? [] : (selectedTopic.customLabels ?? []),
          },
        })
        setSeedEventId(newId)
      } else {
        if (!eventId) throw new Error("Missing event data")
        if (!isCause && !protagonistId)
          throw new Error("Missing protagonist data")
        const closesAt = editClosesAt ?? new Date().toISOString()
        await updateEvent(eventId, protagonistId ?? "", {
          protagonistName: isCause ? "" : (values.name ?? ""),
          protagonistAbout: isCause ? null : values.about || null,
          photoUrl: isCause ? null : resolvedPhotoUrl,
          dateLabel: isCause ? null : values.context || null,
          category: values.category ?? null,
          grouping: values.grouping ?? "individual",
          eventSubject,
          causeLabel: isCause ? values.causeLabel?.trim() || null : null,
          openingLine: values.openingLine ?? null,
          description: isCause ? values.about?.trim() || null : null,
          charityIds: values.charities,
          closesAt,
          isPrivate: false,
          isListed: values.isListed ?? true,
          potAmount: null,
          poll,
        })
        router.push(`/events/${eventId}`)
      }
    } catch (err) {
      if (!(err instanceof Error)) throw err
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  // Watch topics reactively so the exit warning tracks the live value
  const watchedTopics = useWatch({ control: form.control, name: "topics" })
  const hasUnsavedDraft =
    mode === "create" &&
    ((watchedTopics[0]?.isCustom ?? false) ||
      (watchedTopics[0]?.customLabels?.length ?? 0) > 0)

  useEffect(() => {
    if (!hasUnsavedDraft) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "You have unsaved changes. Leave without publishing?"
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedDraft])

  function handleCancel() {
    if (hasUnsavedDraft) {
      if (
        !window.confirm("You have unsaved changes. Leave without publishing?")
      ) {
        return
      }
      sessionStorage.removeItem(NEW_TOPIC_DRAFT_KEY)
      sessionStorage.removeItem(DRAFT_ADDITIONS_KEY)
    }
    if (mode === "edit") router.back()
    else form.reset()
  }

  function handleSubmit(closesAt?: Date) {
    if (closesAt) pendingClosesAt.current = closesAt
    form.handleSubmit(onSubmit)()
  }

  async function handleClosesAtChange(iso: string) {
    if (mode === "edit" && eventId) {
      try {
        await updateClosesAt(eventId, iso)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update closing date",
          {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #ef4444",
            },
          }
        )
        return
      }
    }
    setEditClosesAt(iso)
  }

  if (seedEventId) {
    return (
      <SeedFundModal
        eventId={seedEventId}
        onComplete={() => router.push(`/events/${seedEventId}`)}
      />
    )
  }

  return (
    <Form {...form}>
      <FormInner
        form={form}
        charities={charities}
        topics={topics}
        categories={categories}
        mode={mode}
        submitting={submitting}
        error={error}
        showReveal={showReveal}
        onToggleReveal={() => setShowReveal((s) => !s)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        hasNewTopicDraft={hasNewTopicDraft}
        closesAt={editClosesAt}
        onClosesAtChange={handleClosesAtChange}
      />
    </Form>
  )
}

// Must be a child of <Form> so useWatch can access FormContext
type InnerProps = {
  form: ReturnType<typeof useForm<EventFormValues, unknown, EventFormValues>>
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  showReveal: boolean
  onToggleReveal: () => void
  onSubmit: (closesAt?: Date) => void
  onCancel: () => void
  hasNewTopicDraft: boolean
  /** ISO string from the DB; edit mode only */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

function FormInner({
  form,
  charities,
  topics,
  categories,
  mode,
  submitting,
  error,
  showReveal,
  onToggleReveal,
  onSubmit,
  onCancel,
  hasNewTopicDraft,
  closesAt,
  onClosesAtChange,
}: InnerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [personRevealExample, setPersonRevealExample] = useState<string | null>(
    null
  )
  // Track last generated values to detect manual edits before regenerating
  const lastGeneratedAbout = useRef<string | null>(null)
  const lastGeneratedReveal = useRef<string | null>(null)

  // Hydrate topic draft from sessionStorage on mount (client-side only)
  useEffect(() => {
    if (!hasNewTopicDraft) return
    try {
      // New format: favpoll_draft_additions { topicRef, addedItems }
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
                items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
                customLabels: addedItems,
              },
            ])
          }
        }
        return
      }
      // Legacy format: favpoll_new_topic_draft { title, items }
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

  async function handleRegenerate() {
    const values = form.getValues()
    const topic = values.topics?.[0]
    if (!topic || topic.isCustom || !topic.topicId) return
    const reg = values.register
    if (!reg) return

    const sub = (values.subject ?? "someone") as "someone" | "cause"
    const primaryCharityId = values.charities?.[0] ?? null

    // Confirm before overwriting manual edits
    const currentAbout = form.getValues("about") ?? ""
    const currentReveal = form.getValues("reveal") ?? ""
    const hasManualAbout =
      currentAbout && currentAbout !== lastGeneratedAbout.current
    const hasManualReveal =
      sub === "cause" &&
      currentReveal &&
      currentReveal !== lastGeneratedReveal.current
    if (hasManualAbout || hasManualReveal) {
      const field =
        hasManualAbout && hasManualReveal
          ? "about and reveal"
          : hasManualAbout
            ? "about"
            : "reveal"
      if (!window.confirm(`Replace your ${field} with a new suggestion?`))
        return
    }

    setIsGenerating(true)
    try {
      const result = await safeGenerateDraft({
        register: reg as Register,
        subject: sub,
        topicId: topic.topicId,
        primaryCharityId,
      })
      if (!result) {
        toast.error(
          "Couldn't generate a suggestion — you can write your own instead.",
          {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #ef4444",
            },
          }
        )
      } else {
        form.setValue("about", result.about)
        lastGeneratedAbout.current = result.about
        if (sub === "cause") {
          form.setValue("reveal", result.reveal)
          lastGeneratedReveal.current = result.reveal
        } else {
          setPersonRevealExample(result.reveal)
        }
      }
    } catch {
      toast.error(
        "Couldn't generate a suggestion — you can write your own instead.",
        {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #ef4444",
          },
        }
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="flex flex-col bg-muted md:h-[calc(100vh-3.5rem)] md:overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <PreviewPanel
            charities={charities}
            topics={topics}
            showReveal={showReveal}
            onToggleReveal={onToggleReveal}
            isGenerating={isGenerating}
            personRevealExample={personRevealExample}
            onRegenerate={handleRegenerate}
            closesAt={closesAt}
            onClosesAtChange={onClosesAtChange}
          />
        </div>
      </div>

      <CommandPanel
        mode={mode}
        submitting={submitting}
        error={error}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </>
  )
}
