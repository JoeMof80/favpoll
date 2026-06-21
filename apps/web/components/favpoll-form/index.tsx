"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { createFavpoll } from "@/app/favpolls/new/actions"
import { updateFavpoll, updateClosesAt } from "@/app/favpolls/[id]/edit/actions"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import { deriveRegister, getExampleName } from "@/lib/registers"
import { getFavpollHeadline } from "@/lib/display"
import { eventFormSchema, type FavpollFormValues } from "./schema"
import { CommandPanel } from "./command-panel"
import { SeedFundModal } from "./seed-fund-modal"
import { toast } from "sonner"
import type {
  Category,
  Charity,
  CanvasPollInput,
  TopicWithMeta,
  Register,
  FavpollGrouping,
} from "@favpoll/types"
import { EditableHero } from "./editable-hero"
import { EditablePollArea } from "./editable-poll-area"
import { EditableCountdown } from "./editable-countdown"
import { CharityBanner } from "../charity-banner"
import { Button } from "@/components/ui/button"

const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

// Register-keyed example context values shown when "Generate a suggestion" is triggered
const CONTEXT_SUGGESTIONS: Partial<Record<Register, string>> = {
  remembering: "1940 – 2025",
  celebrating_one: "turning 40",
  celebrating_many: "class of 2025",
}

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
  defaultValues?: Partial<FavpollFormValues>
  hasNewTopicDraft?: boolean
  initialClosesAt?: string
}

export function FavpollForm({
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

  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
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

  async function onSubmit(values: FavpollFormValues) {
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
                canonicalItemIds: topicMeta.favourites
                  .filter((i) => i.is_canonical)
                  .map((i) => i.id),
                customLabels: selectedTopic.customLabels ?? [],
              }
            : null,
      }

      const subject = values.subject ?? "someone"
      const isCause = subject === "cause"

      if (mode === "create") {
        const closesAt =
          pendingClosesAt.current ??
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        sessionStorage.removeItem(NEW_TOPIC_DRAFT_KEY)
        sessionStorage.removeItem(DRAFT_ADDITIONS_KEY)
        const { favpollId: newId } = await createFavpoll({
          protagonistName: isCause ? "" : (values.name ?? ""),
          protagonistAbout: isCause ? null : values.about || null,
          photoUrl: isCause ? null : resolvedPhotoUrl,
          dateLabel: isCause ? null : values.context || null,
          category: values.category ?? null,
          grouping: values.grouping ?? "individual",
          subject,
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
        await updateFavpoll(eventId, protagonistId ?? "", {
          protagonistName: isCause ? "" : (values.name ?? ""),
          protagonistAbout: isCause ? null : values.about || null,
          photoUrl: isCause ? null : resolvedPhotoUrl,
          dateLabel: isCause ? null : values.context || null,
          category: values.category ?? null,
          grouping: values.grouping ?? "individual",
          subject,
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
        router.push(`/favpolls/${eventId}`)
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
    else {
      form.reset()
      setShowReveal(false)
    }
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
        isListed={form.getValues("isListed") ?? true}
        onComplete={() => router.push(`/favpolls/${seedEventId}`)}
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
  form: ReturnType<
    typeof useForm<FavpollFormValues, unknown, FavpollFormValues>
  >
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
  // Track last generated values to detect manual edits before regenerating
  const lastGeneratedOpeningLine = useRef<string | null>(null)
  const lastGeneratedName = useRef<string | null>(null)
  const lastGeneratedContext = useRef<string | null>(null)
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
                items: t.favourites.map((i) => ({ id: i.id, label: i.label })),
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
    const grouping = (values.grouping ?? "individual") as FavpollGrouping
    const primaryCharityId = values.charities?.[0] ?? null

    const topicMeta = topics.find((t) => t.id === topic.topicId)
    const topicTitle = topicMeta?.title ?? topic.title ?? null

    // Computed suggestions for static fields
    const suggestedOpeningLine = getFavpollHeadline({
      register: reg,
      occasionType: null,
      name: "",
      subject: sub,
    }).prefix

    const suggestedName =
      sub !== "cause"
        ? getExampleName(topicTitle, undefined, grouping, reg as Register)
        : null
    const suggestedContext =
      sub !== "cause" ? (CONTEXT_SUGGESTIONS[reg as Register] ?? "") : null

    // Confirm before overwriting manual edits
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
      sub !== "cause" &&
      values.context &&
      values.context !== lastGeneratedContext.current
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
      if (!window.confirm(`Replace your ${list} with a new suggestion?`)) return
    }

    // Set static/computed fields immediately (no network call needed)
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

    // LLM call for about + reveal
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
        form.setValue("reveal", result.reveal)
        lastGeneratedReveal.current = result.reveal
        if (!showReveal) onToggleReveal()
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

  const category = useWatch({ control: form.control, name: "category" })
  const charityIds =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const selectedTopics =
    useWatch({ control: form.control, name: "topics" }) ?? []
  const grouping =
    useWatch({ control: form.control, name: "grouping" }) ?? "individual"

  // Don't render until an occasion is chosen — nothing meaningful to preview
  if (!category) return null

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  const firstTopicMeta = topics.find((t) => t.id === selectedTopics[0]?.topicId)
  const effReg = deriveRegister(category ?? null, grouping)
  const aboutPlaceholder = firstTopicMeta?.placeholders?.[effReg]?.about ?? ""
  const topicRevealPlaceholder =
    firstTopicMeta?.placeholders?.[effReg]?.reveal ?? ""

  return (
    <>
      <div className="overflow-x-clip bg-primary/5">
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background px-6 pb-24 md:px-16 md:pt-0 md:pb-24 md:drop-shadow-lg">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Left — hero + poll */}
            <div>
              <EditableHero
                isGenerating={isGenerating}
                onRegenerate={handleRegenerate}
                aboutPlaceholder={aboutPlaceholder}
              />
              <EditablePollArea
                topics={topics}
                showReveal={showReveal}
                onToggleReveal={onToggleReveal}
                isGenerating={isGenerating}
                onRegenerate={handleRegenerate}
                topicRevealPlaceholder={topicRevealPlaceholder}
              />
            </div>

            {/* Right — sticky meta */}
            <div className="sticky top-14 z-10 hidden space-y-4 self-start bg-background md:block md:pt-16">
              <EditableCountdown
                closesAt={closesAt}
                onClosesAtChange={onClosesAtChange}
              />
              <CharityBanner charities={displayCharities} totalRaised={0} />
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
        onCancel={onCancel}
      />
    </>
  )
}
