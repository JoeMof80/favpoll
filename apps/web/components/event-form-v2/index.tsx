"use client"

import { useState } from "react"
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
import { eventFormSchema, type EventFormValues } from "./schema"
import { FormPanel } from "./form-panel"
import { PreviewPanel } from "./preview-panel"
import type {
  Category,
  Charity,
  CanvasPollInput,
  TopicWithMeta,
} from "@favpoll/types"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  eventId?: string
  protagonistId?: string
  existingPollId?: string
  defaultValues?: Partial<EventFormValues>
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
      occasionType: "",
      isPlural: false,
      openingLine: "",
      name: "",
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

      const resolvedOccasionType = values.occasionType || null

      if (mode === "create") {
        const { eventId: newId } = await createEvent({
          protagonistName: values.name,
          protagonistAbout: values.about || null,
          photoUrl: resolvedPhotoUrl,
          dateLabel: values.context || null,
          occasionType: resolvedOccasionType,
          openingLine: values.openingLine ?? null,
          description: null,
          charityIds: values.charities,
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
          isPlural: values.isPlural ?? false,
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
            infiniteItems: poll.infiniteItems,
          },
        })
        router.push(`/events/${newId}`)
      } else {
        if (!eventId || !protagonistId) throw new Error("Missing event data")
        await updateEvent(eventId, protagonistId, {
          protagonistName: values.name,
          protagonistAbout: values.about || null,
          photoUrl: resolvedPhotoUrl,
          dateLabel: values.context || null,
          occasionType: resolvedOccasionType,
          openingLine: values.openingLine ?? null,
          description: null,
          charityIds: values.charities,
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
          isPlural: values.isPlural ?? false,
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
        onCancel={() => {
          if (mode === "edit") router.back()
          else form.reset()
        }}
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
}: InnerProps) {
  const occasionTypeValue = useWatch({
    control: form.control,
    name: "occasionType",
  })
  const topicsValue = useWatch({ control: form.control, name: "topics" })
  const charitiesValue = useWatch({ control: form.control, name: "charities" })
  const nameValue = useWatch({ control: form.control, name: "name" })

  const missing: string[] = []
  if (!occasionTypeValue) missing.push("Occasion")
  if (!topicsValue?.[0]?.topicId && !topicsValue?.[0]?.isCustom)
    missing.push("favpoll topic")
  if (!charitiesValue?.length) missing.push("Charity")
  if (!nameValue) missing.push("Name")

  const isPublishable = missing.length === 0

  return (
    <>
      {/* Two-panel layout: flex-col on mobile, flex-row on desktop */}
      <div className="flex flex-col bg-primary/5 md:h-[calc(100vh-3.5rem)] md:flex-row md:overflow-hidden">
        {/* Left panel — pillars + publish bar */}
        <div className="flex w-full flex-col bg-muted md:w-105 md:shrink-0 md:overflow-hidden md:border-r md:border-border">
          <div className="flex-1 overflow-y-auto">
            <FormPanel
              charities={charities}
              topics={topics}
              categories={categories}
            />
          </div>

          {/* Fixed publish bar */}
          <div
            className="shrink-0 border-t border-border bg-background px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {error && (
              <p role="alert" className="mb-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Missing fields list */}
            {missing.length > 0 && (
              <ul className="mb-3 space-y-0.5 text-xs text-muted-foreground">
                {missing.map((m) => (
                  <li key={m} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {m}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground"
                onClick={onEventSettingsOpen}
              >
                Settings
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={submitting || !isPublishable}
                onClick={onSubmit}
              >
                {submitting
                  ? mode === "create"
                    ? "Creating…"
                    : "Saving…"
                  : mode === "create"
                    ? "Publish event"
                    : "Save changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right panel — live preview (stacks below on mobile, side-by-side on desktop) */}
        <div className="flex-1 overflow-y-auto">
          <PreviewPanel
            charities={charities}
            topics={topics}
            showReveal={showReveal}
            onToggleReveal={onToggleReveal}
          />
        </div>
      </div>

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
