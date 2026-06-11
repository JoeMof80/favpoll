"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { uploadPersonPhoto } from "@/app/events/new/actions"
import { createEvent } from "@/app/events/new/actions"
import { updateEvent } from "@/app/events/[id]/edit/actions"
import { generateDraft } from "@/lib/actions/generate-draft"
import { RateLimitError } from "@/lib/actions/generate-draft-utils"
import { eventFormSchema, type EventFormValues } from "./schema"
import { PreviewPanel } from "./preview-panel"
import { CommandPanel } from "./command-panel"
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
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [eventSettingsOpen, setEventSettingsOpen] = useState(false)
  const [isPrivateDraft, setIsPrivateDraft] = useState(false)
  const [sharedFundDraft, setSharedFundDraft] = useState("0")

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
      sharedFund: 0,
      isPrivate: false,
      topics: [],
      // Default closes_at to 30 days from now so schema validation passes on mount
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
          isListed: values.isListed ?? true,
          potAmount: values.sharedFund > 0 ? values.sharedFund : null,
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
        router.push(`/events/${newId}`)
      } else {
        if (!eventId) throw new Error("Missing event data")
        if (!isCause && !protagonistId)
          throw new Error("Missing protagonist data")
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
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
          isListed: values.isListed ?? true,
          potAmount: values.sharedFund > 0 ? values.sharedFund : null,
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
        eventSettingsOpen={eventSettingsOpen}
        onEventSettingsOpen={() => {
          setIsPrivateDraft(form.getValues("isPrivate"))
          setSharedFundDraft(String(form.getValues("sharedFund") || 0))
          setEventSettingsOpen(true)
        }}
        onEventSettingsClose={() => setEventSettingsOpen(false)}
        onEventSettingsSave={() => {
          form.setValue("isPrivate", isPrivateDraft)
          form.setValue("sharedFund", parseFloat(sharedFundDraft) || 0)
          setEventSettingsOpen(false)
        }}
        isPrivateDraft={isPrivateDraft}
        onIsPrivateDraftChange={setIsPrivateDraft}
        sharedFundDraft={sharedFundDraft}
        onSharedFundDraftChange={setSharedFundDraft}
        onSubmit={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
        hasNewTopicDraft={hasNewTopicDraft}
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
  eventSettingsOpen: boolean
  onEventSettingsOpen: () => void
  onEventSettingsClose: () => void
  onEventSettingsSave: () => void
  isPrivateDraft: boolean
  onIsPrivateDraftChange: (v: boolean) => void
  sharedFundDraft: string
  onSharedFundDraftChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  hasNewTopicDraft: boolean
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
  eventSettingsOpen,
  onEventSettingsOpen,
  onEventSettingsClose,
  onEventSettingsSave,
  isPrivateDraft,
  onIsPrivateDraftChange,
  sharedFundDraft,
  onSharedFundDraftChange,
  onSubmit,
  onCancel,
  hasNewTopicDraft,
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

  // Generate charity-aware About/Reveal on mount for canonical topics only
  useEffect(() => {
    if (mode !== "create") return
    const values = form.getValues()
    const topic = values.topics?.[0]
    if (!topic || topic.isCustom || !topic.topicId) return
    const reg = values.register
    if (!reg) return

    const sub = (values.subject ?? "someone") as "someone" | "cause"
    const primaryCharityId = values.charities?.[0] ?? null

    setIsGenerating(true)
    generateDraft({
      register: reg as Register,
      subject: sub,
      topicId: topic.topicId,
      primaryCharityId,
    })
      .then((result) => {
        if (!form.getValues("about")) {
          form.setValue("about", result.about)
          lastGeneratedAbout.current = result.about
        }
        if (sub === "cause") {
          if (!form.getValues("reveal")) {
            form.setValue("reveal", result.reveal)
            lastGeneratedReveal.current = result.reveal
          }
        } else {
          setPersonRevealExample(result.reveal)
        }
      })
      .catch(() => {
        // Silent — static placeholder remains as fallback
      })
      .finally(() => setIsGenerating(false))
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
      const result = await generateDraft({
        register: reg as Register,
        subject: sub,
        topicId: topic.topicId,
        primaryCharityId,
      })
      form.setValue("about", result.about)
      lastGeneratedAbout.current = result.about
      if (sub === "cause") {
        form.setValue("reveal", result.reveal)
        lastGeneratedReveal.current = result.reveal
      } else {
        setPersonRevealExample(result.reveal)
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        toast.warning(
          "Too many requests — wait a few minutes before regenerating.",
          {
            style: {
              background: "#fffbeb",
              color: "#854d0e",
              border: "1px solid #f59e0b",
            },
          }
        )
      } else {
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
      }
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
          />
        </div>
      </div>

      <CommandPanel
        charities={charities}
        topics={topics}
        categories={categories}
        mode={mode}
        submitting={submitting}
        error={error}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onEventSettingsOpen={onEventSettingsOpen}
      />

      {/* Event settings overlay */}
      <ResponsiveOverlay
        open={eventSettingsOpen}
        onOpenChange={(o) => !o && onEventSettingsClose()}
        title="Event settings"
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={onEventSettingsSave}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onEventSettingsClose}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
            <div>
              <p className="text-sm font-medium">
                {isPrivateDraft ? "Private event" : "Public event"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPrivateDraft
                  ? "Only guests you invite can view and pledge."
                  : "Anyone can find this event and make a pledge."}
              </p>
            </div>
            <Switch
              checked={isPrivateDraft}
              onCheckedChange={onIsPrivateDraftChange}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Shared fund</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Seed a communal pot so guests without funds can still participate.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">£</span>
              <input
                type="number"
                min="0"
                step="1"
                value={sharedFundDraft}
                onChange={(e) => onSharedFundDraftChange(e.target.value)}
                placeholder="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  )
}
