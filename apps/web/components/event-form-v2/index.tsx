"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { uploadPersonPhoto } from "@/app/events/new/actions"
import { createEvent } from "@/app/events/new/actions"
import { updateEvent } from "@/app/events/[id]/edit/actions"
import { eventFormSchema, type EventFormValues } from "./schema"
import { FormPanel } from "./form-panel"
import { PreviewPanel } from "./preview-panel"
import { OnboardingInterstitial } from "./onboarding-interstitial"
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
  isFirstTime?: boolean
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
  isFirstTime = false,
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [previewSuffix, setPreviewSuffix] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState(true)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null)
  const [showInterstitial, setShowInterstitial] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("favpoll_show_onboarding")
    if ((isFirstTime && stored !== "0") || stored === "1") {
      setShowInterstitial(true)
    }
  }, [isFirstTime])

  function handleDismissInterstitial() {
    localStorage.setItem("favpoll_show_onboarding", "0")
    setShowInterstitial(false)
  }

  const form = useForm<EventFormValues, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema as never),
    defaultValues: {
      occasion: "",
      openingLine: "",
      name: "",
      context: "",
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

      const openingLine = values.openingLine ?? null

      if (mode === "create") {
        const { eventId: newId } = await createEvent({
          protagonistName: values.name,
          protagonistAbout: values.about || null,
          photoUrl: resolvedPhotoUrl,
          dateLabel: values.context || null,
          occasion: values.occasion,
          openingLine,
          description: null,
          charityIds: values.charities,
          closesAt: values.closesAt.toISOString(),
          isPrivate: values.isPrivate,
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
          occasion: values.occasion,
          openingLine,
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
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-primary/5">
        {/* Left panel — scrollable form */}
        <div className="flex w-full flex-col overflow-hidden bg-muted md:w-105 md:shrink-0 md:border-r md:border-border">
          <div className="flex-1 overflow-y-auto">
            {/* "How favpoll works" link — mobile only, shown after interstitial dismissed */}
            {!showInterstitial && (
              <div className="flex justify-end px-5 pt-3 md:hidden">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-[13px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    localStorage.setItem("favpoll_show_onboarding", "1")
                    setShowInterstitial(true)
                  }}
                >
                  How favpoll works →
                </Button>
              </div>
            )}
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
              photoFileName={photoFileName}
              onPhotoFileChange={setPhotoFileName}
              size="md"
            />
          </div>

          {/* Fixed save button */}
          <div
            className="shrink-0 border-t border-border bg-background px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {error && (
              <p role="alert" className="mb-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex items-center gap-2">
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    form.reset()
                    setPhotoFileName(null)
                    setPreviewSuffix(true)
                    setPreviewPhoto(true)
                  }}
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

        {/* Right panel — live preview (hidden on mobile, kept in DOM for useWatch) */}
        <div className="hidden h-full flex-1 overflow-y-auto md:flex">
          <PreviewPanel
            charities={charities}
            topics={topics}
            showReveal={showReveal}
            previewSuffix={previewSuffix}
            previewPhoto={previewPhoto}
            isFirstTime={isFirstTime}
          />
        </div>
      </div>

      {/* Mobile onboarding interstitial */}
      {showInterstitial && (
        <OnboardingInterstitial onDismiss={handleDismissInterstitial} />
      )}
    </Form>
  )
}
