"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { uploadPersonPhoto } from "@/app/events/new/actions"
import { createEvent } from "@/app/events/new/actions"
import { updateEvent } from "@/app/events/[id]/edit/actions"
import { OCCASION_LABELS } from "@/lib/occasions"
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
  const [previewSuffix, setPreviewSuffix] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(false)

  const form = useForm<EventFormValues, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema as never),
    defaultValues: {
      occasion: "",
      name: "",
      suffix: "",
      about: "",
      reveal: "",
      charities: [],
      sharedFund: 0,
      isPrivate: false,
      topics: [],
      ...defaultValues,
    },
  })

  async function onSubmit(values: EventFormValues) {
    setError(null)
    setSubmitting(true)
    try {
      // Upload photo if a new file was selected
      let resolvedPhotoUrl = values.photoUrl ?? null
      if (values.photo) {
        const fd = new FormData()
        fd.append("photo", values.photo)
        resolvedPhotoUrl = await uploadPersonPhoto(fd)
      }

      const selectedTopic = values.topics[0]
      const topicMeta = topics.find((t) => t.id === selectedTopic.topicId)

      const poll: CanvasPollInput = {
        id: existingPollId,
        topicId: selectedTopic.topicId,
        topicIsCustom: false,
        customTopicTitle: "",
        customTopicItems: [],
        reveal: null,
        infiniteItems:
          topicMeta && !topicMeta.is_finite
            ? {
                canonicalItemIds: topicMeta.topic_items
                  .filter((i) => i.is_canonical)
                  .map((i) => i.id),
                customLabels: [],
              }
            : null,
      }

      const occasionLabel = OCCASION_LABELS[values.occasion] ?? null

      if (mode === "create") {
        const { eventId: newId } = await createEvent({
          protagonistName: values.name,
          protagonistAbout: values.about || null,
          photoUrl: resolvedPhotoUrl,
          dateLabel: values.suffix || null,
          occasion: values.occasion,
          occasionLabel,
          description: null,
          charityIds: values.charities,
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
          potAmount: values.sharedFund > 0 ? values.sharedFund : null,
          poll: {
            topicId: poll.topicId,
            customTopic: null,
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
          dateLabel: values.suffix || null,
          occasion: values.occasion,
          occasionLabel,
          description: null,
          charityIds: values.charities,
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
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
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left panel — scrollable form */}
        <div className="flex w-[420px] shrink-0 flex-col overflow-hidden border-r border-border bg-muted">
          {/* Fixed header */}
          <div className="shrink-0 border-b border-border px-5 py-3">
            <h1 className="text-sm font-semibold text-foreground">
              {mode === "create" ? "Create a New Event" : "Edit Event"}
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FormPanel
              charities={charities}
              topics={topics}
              categories={categories}
              previewSuffix={previewSuffix}
              onToggleSuffix={() => setPreviewSuffix((s) => !s)}
              previewPhoto={previewPhoto}
              onTogglePhoto={() => setPreviewPhoto((p) => !p)}
              onRevealFocus={() => setShowReveal(true)}
              onRevealBlur={() => setShowReveal(false)}
            />
          </div>

          {/* Fixed save button */}
          <div className="shrink-0 border-t border-border px-5 py-4">
            {error && (
              <p role="alert" className="mb-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                className="flex-1"
                disabled={submitting || !form.formState.isValid}
                onClick={form.handleSubmit(onSubmit)}
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

        {/* Right panel — live preview */}
        <div className="flex-1 overflow-y-auto bg-primary/5">
          <PreviewPanel
            charities={charities}
            topics={topics}
            showReveal={showReveal}
            previewSuffix={previewSuffix}
            previewPhoto={previewPhoto}
          />
        </div>
      </div>
    </Form>
  )
}
