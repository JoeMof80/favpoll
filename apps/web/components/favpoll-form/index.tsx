"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { createFavpoll } from "@/app/favpolls/new/actions"
import { updateFavpoll, updateClosesAt } from "@/app/favpolls/[id]/edit/actions"
import { favpollFormSchema, type FavpollFormValues } from "./schema"
import {
  FormInner,
  NEW_TOPIC_DRAFT_KEY,
  DRAFT_ADDITIONS_KEY,
} from "./form-inner"
import { SeedFundModal } from "./seed-fund-modal"
import { toast } from "sonner"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
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
  favpollId?: string
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
  favpollId,
  protagonistId,
  existingPollId,
  defaultValues,
  hasNewTopicDraft = false,
  initialClosesAt,
}: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editClosesAt, setEditClosesAt] = useState<string | undefined>(
    initialClosesAt
  )
  const [seedFavpollId, setSeedFavpollId] = useState<string | null>(null)

  const pendingClosesAt = useRef<Date | null>(null)

  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
    resolver: zodResolver(favpollFormSchema as never),
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
          pronoun: isCause ? null : (values.pronoun ?? null),
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
        setSeedFavpollId(newId)
      } else {
        if (!favpollId) throw new Error("Missing favpoll data")
        if (!isCause && !protagonistId)
          throw new Error("Missing protagonist data")
        const closesAt = editClosesAt ?? new Date().toISOString()
        await updateFavpoll(favpollId, protagonistId ?? "", {
          protagonistName: isCause ? "" : (values.name ?? ""),
          protagonistAbout: isCause ? null : values.about || null,
          photoUrl: isCause ? null : resolvedPhotoUrl,
          dateLabel: isCause ? null : values.context || null,
          category: values.category ?? null,
          grouping: values.grouping ?? "individual",
          subject,
          causeLabel: isCause ? values.causeLabel?.trim() || null : null,
          pronoun: isCause ? null : (values.pronoun ?? null),
          openingLine: values.openingLine ?? null,
          description: isCause ? values.about?.trim() || null : null,
          charityIds: values.charities,
          closesAt,
          isPrivate: false,
          isListed: values.isListed ?? true,
          potAmount: null,
          poll,
        })
        router.push(`/favpolls/${favpollId}`)
      }
    } catch (err) {
      if (!(err instanceof Error)) throw err
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

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
    }
  }

  function handleSubmit(closesAt?: Date) {
    if (closesAt) pendingClosesAt.current = closesAt
    form.handleSubmit(onSubmit)()
  }

  async function handleClosesAtChange(iso: string) {
    if (mode === "edit" && favpollId) {
      try {
        await updateClosesAt(favpollId, iso)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update closing date",
          { style: TOAST_ERROR_STYLE }
        )
        return
      }
    }
    setEditClosesAt(iso)
  }

  if (seedFavpollId) {
    return (
      <SeedFundModal
        favpollId={seedFavpollId}
        isListed={form.getValues("isListed") ?? true}
        onComplete={() => router.push(`/favpolls/${seedFavpollId}`)}
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        hasNewTopicDraft={hasNewTopicDraft}
        closesAt={editClosesAt}
        onClosesAtChange={handleClosesAtChange}
      />
    </Form>
  )
}
