"use client"

import { useEffect, useRef, useState } from "react"
import { useWatch, useForm } from "react-hook-form"
import { Sparkles } from "lucide-react"
import { safeGenerateDraft } from "@/lib/actions/generate-draft"
import { getExampleName } from "@/lib/registers"
import { getFavpollHeadline } from "@/lib/display"
import type { FavpollFormValues } from "./schema"
import { CommandPanel } from "./command-panel"
import { EditableHero } from "./editable-hero"
import { EditablePollArea } from "./editable-poll-area"
import { EditableCountdown } from "./editable-countdown"
import { CharityBanner } from "../charity-banner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type {
  Charity,
  TopicWithMeta,
  Category,
  Register,
  FavpollGrouping,
} from "@favpoll/types"

export const NEW_TOPIC_DRAFT_KEY = "favpoll_new_topic_draft"
export const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

const CONTEXT_SUGGESTIONS: Partial<Record<Register, string>> = {
  remembering: "1940 – 2025",
  celebrating_one: "turning 40",
  celebrating_many: "class of 2025",
}

export type FormInnerProps = {
  form: ReturnType<
    typeof useForm<FavpollFormValues, unknown, FavpollFormValues>
  >
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: (closesAt?: Date) => void
  onCancel: () => void
  hasNewTopicDraft: boolean
  /** ISO string from the DB; edit mode only */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function FormInner({
  form,
  charities,
  topics,
  categories,
  mode,
  submitting,
  error,
  onSubmit,
  onCancel,
  hasNewTopicDraft,
  closesAt,
  onClosesAtChange,
}: FormInnerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const lastGeneratedOpeningLine = useRef<string | null>(null)
  const lastGeneratedName = useRef<string | null>(null)
  const lastGeneratedContext = useRef<string | null>(null)
  const lastGeneratedAbout = useRef<string | null>(null)
  const lastGeneratedReveal = useRef<string | null>(null)

  useEffect(() => {
    if (!hasNewTopicDraft) return
    try {
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

  const showSparkles =
    !!selectedTopics[0]?.topicId && !selectedTopics[0]?.isCustom

  if (!category) return null

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  return (
    <>
      <div className="overflow-x-clip bg-primary/5">
        <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background px-6 pb-24 md:px-16 md:pt-0 md:pb-24 md:drop-shadow-lg">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Left — hero + poll */}
            <div className="relative">
              {showSparkles && (
                <div className="pointer-events-none absolute inset-x-0 top-6 z-30 flex justify-center md:top-16">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                    onClick={handleRegenerate}
                    className="pointer-events-auto gap-2 rounded-full px-4 shadow-md"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {isGenerating ? "Generating…" : "Generate a suggestion"}
                  </Button>
                </div>
              )}
              <EditableHero
                isGenerating={isGenerating}
                onRegenerate={handleRegenerate}
              />
              <EditablePollArea
                isGenerating={isGenerating}
                onRegenerate={handleRegenerate}
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
