"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent, uploadPersonPhoto } from "./actions"
import type { Category, Charity } from "@/types"
import type { TopicWithMeta } from "./page"
import { Button } from "@/components/ui/button"

type Step =
  | "person"
  | "occasion"
  | "charity"
  | "topic"
  | "curate"
  | "closing"
  | "pot"
  | "done"

type FormState = {
  personName: string
  occasion: string
  occasionCustom: string
  charityId: string
  selectedTopicId: string
  topicIsCustom: boolean
  customTopicTitle: string
  customTopicItems: string[]
  topicFraming: string
  topicQuote: string
  closesAt: string
  isPrivate: boolean
  potAmount: string
  curatedItemIds: string[]
  curatedCustomLabels: string[]
}

const STEP_LABELS: Record<Step, string> = {
  person: "Who is this for?",
  occasion: "What is the occasion?",
  charity: "Choose a charity",
  topic: "Choose a topic",
  curate: "Curate your options",
  closing: "Set closing date",
  pot: "Shared fund (optional)",
  done: "Done",
}

const OCCASIONS = [
  {
    value: "memorial",
    label: "Memorial",
    description: "Honouring someone who has passed",
  },
  {
    value: "birthday",
    label: "Birthday",
    description: "Celebrating a birthday",
  },
  {
    value: "retirement",
    label: "Retirement",
    description: "Marking the end of a career",
  },
  { value: "wedding", label: "Wedding", description: "Celebrating a marriage" },
  { value: "other", label: "Other", description: "Another special occasion" },
]

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  preselectedTopicId: string | null
}

export function CreateEventWizard({
  charities,
  topics,
  categories,
  preselectedTopicId,
}: Props) {
  const router = useRouter()

  const [step, setStep] = useState<Step>("person")
  const [form, setForm] = useState<FormState>({
    personName: "",
    occasion: "",
    occasionCustom: "",
    charityId: "",
    selectedTopicId: preselectedTopicId ?? "",
    topicIsCustom: false,
    customTopicTitle: "",
    customTopicItems: ["", ""],
    topicFraming: "",
    topicQuote: "",
    closesAt: "",
    isPrivate: false,
    potAmount: "",
    curatedItemIds: [],
    curatedCustomLabels: [],
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [topicCategory, setTopicCategory] = useState<string | null>(null)

  const selectedTopic = topics.find((t) => t.id === form.selectedTopicId)
  const needsCuration = !form.topicIsCustom && !!selectedTopic && !selectedTopic.is_finite

  const STEPS: Step[] = [
    "person",
    "occasion",
    "charity",
    "topic",
    ...(needsCuration ? (["curate"] as Step[]) : []),
    "closing",
    "pot",
  ]

  const currentStepIndex = STEPS.indexOf(step)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const url = await uploadPersonPhoto(fd)
      setPhotoUrl(url)
    } catch {
      setPhotoUrl(null)
    } finally {
      setPhotoUploading(false)
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function next() {
    setError(null)
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1]
      if (nextStep === "curate") {
        // Pre-populate with all master items when entering curate
        const masterIds = (selectedTopic?.topic_items ?? [])
          .filter((i) => i.is_master)
          .map((i) => i.id)
        setForm((prev) => ({ ...prev, curatedItemIds: masterIds, curatedCustomLabels: [] }))
      }
      setStep(nextStep)
    }
  }

  function back() {
    setError(null)
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const visibleTopics =
    topicCategory === null
      ? topics
      : topics.filter((t) => t.category_ids.includes(topicCategory))

  const occasionValue =
    form.occasion === "other" && form.occasionCustom.trim()
      ? form.occasionCustom.trim()
      : form.occasion

  const canContinue = () => {
    if (step === "person") return form.personName.trim().length > 0
    if (step === "occasion") return occasionValue.length > 0
    if (step === "charity") return form.charityId.length > 0
    if (step === "topic") {
      if (form.topicIsCustom) {
        const validItems = form.customTopicItems.filter((i) => i.trim())
        return form.customTopicTitle.trim().length > 0 && validItems.length >= 2
      }
      return form.selectedTopicId.length > 0
    }
    if (step === "curate") {
      const totalItems =
        form.curatedItemIds.length +
        form.curatedCustomLabels.filter((l) => l.trim()).length
      return totalItems >= 2
    }
    if (step === "closing") return form.closesAt.length > 0
    return true
  }

  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    try {
      const { eventId } = await createEvent({
        personName: form.personName,
        photoUrl,
        occasion: occasionValue,
        charityId: form.charityId,
        topicId: form.topicIsCustom ? null : form.selectedTopicId || null,
        customTopic: form.topicIsCustom
          ? {
              title: form.customTopicTitle,
              items: form.customTopicItems.filter((i) => i.trim()),
            }
          : null,
        topicFraming: form.topicFraming || null,
        topicQuote: form.topicQuote || null,
        closesAt: form.closesAt,
        isPrivate: form.isPrivate,
        potAmount: form.potAmount ? parseFloat(form.potAmount) : null,
        infiniteItems:
          !form.topicIsCustom && selectedTopic && !selectedTopic.is_finite
            ? {
                masterItemIds: form.curatedItemIds,
                customLabels: form.curatedCustomLabels.filter((l) => l.trim()),
              }
            : null,
      })
      setShareLink(`/events/${eventId}`)
      setStep("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "done" && shareLink) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Your event is ready</p>
          <h1 className="mt-1 text-2xl font-medium text-foreground">
            Share with guests
          </h1>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="font-mono text-sm break-all text-foreground">
            {typeof window !== "undefined" ? window.location.origin : ""}
            {shareLink}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              navigator.clipboard.writeText(window.location.origin + shareLink)
            }
          >
            Copy link
          </Button>
          <Button className="flex-1" onClick={() => router.push(shareLink)}>
            View event
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStepIndex ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-medium text-foreground">
          {STEP_LABELS[step]}
        </h1>
      </div>

      {/* Person */}
      {step === "person" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="personName"
              className="mb-1.5 block text-sm text-foreground"
            >
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="personName"
              type="text"
              value={form.personName}
              onChange={(e) => update("personName", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g. Rebecca, Mum and Dad, The Johnson Family"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Can be a person, couple, family, team, or any group.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-sm text-foreground">Photo (optional)</p>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                  Photo
                </div>
              )}
              <div>
                <label
                  htmlFor="personPhoto"
                  className="cursor-pointer rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus-within:ring-2 focus-within:ring-ring hover:bg-muted"
                >
                  {photoUploading
                    ? "Uploading…"
                    : photoPreview
                      ? "Change"
                      : "Upload"}
                  <input
                    id="personPhoto"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePhotoChange}
                    disabled={photoUploading}
                  />
                </label>
                {photoPreview && !photoUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null)
                      setPhotoUrl(null)
                    }}
                    className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Occasion */}
      {step === "occasion" && (
        <div className="space-y-2">
          <ul className="space-y-2" role="list">
            {OCCASIONS.map((occ) => (
              <li key={occ.value}>
                <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors has-checked:border-primary has-checked:bg-secondary/40">
                  <input
                    type="radio"
                    name="occasion"
                    value={occ.value}
                    checked={form.occasion === occ.value}
                    onChange={() => update("occasion", occ.value)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {occ.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {occ.description}
                    </p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          {form.occasion === "other" && (
            <div className="pt-1">
              <label
                htmlFor="occasionCustom"
                className="mb-1.5 block text-sm text-foreground"
              >
                Describe the occasion
              </label>
              <input
                id="occasionCustom"
                type="text"
                value={form.occasionCustom}
                onChange={(e) => update("occasionCustom", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="e.g. Bar Mitzvah, Graduation, Anniversary"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* Charity */}
      {step === "charity" && (
        <ul className="space-y-2" role="list">
          {charities.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No charities available yet.
            </li>
          )}
          {charities.map((charity) => (
            <li key={charity.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors has-checked:border-primary has-checked:bg-secondary/40">
                <input
                  type="radio"
                  name="charity"
                  value={charity.id}
                  checked={form.charityId === charity.id}
                  onChange={() => update("charityId", charity.id)}
                  className="accent-primary"
                />
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary"
                  aria-hidden="true"
                >
                  {charity.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {charity.name}
                  </p>
                  {charity.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {charity.description}
                    </p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}

      {/* Topic */}
      {step === "topic" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose one topic for guests to vote on.
          </p>

          {/* Category filter */}
          {!form.topicIsCustom && (
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                onClick={() => setTopicCategory(null)}
                className={`rounded-full px-3 py-1 text-xs transition-colors focus:ring-2 focus:ring-ring focus:outline-none ${topicCategory === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setTopicCategory(topicCategory === cat.id ? null : cat.id)
                  }
                  className={`rounded-full px-3 py-1 text-xs transition-colors focus:ring-2 focus:ring-ring focus:outline-none ${topicCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Topic list — hidden when adding custom */}
          {!form.topicIsCustom && (
            <>
              {visibleTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No topics in this category.
                </p>
              ) : (
                <ul className="space-y-2" role="list">
                  {visibleTopics.map((topic) => {
                    const preview = topic.topic_items
                      .slice(0, 4)
                      .map((i) => i.label)
                      .join(", ")
                    return (
                      <li key={topic.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors has-checked:border-primary has-checked:bg-secondary/40">
                          <input
                            type="radio"
                            name="topic"
                            value={topic.id}
                            checked={form.selectedTopicId === topic.id}
                            onChange={() => update("selectedTopicId", topic.id)}
                            className="mt-0.5 accent-primary"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {topic.title}
                            </p>
                            {preview && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {preview}
                                {topic.topic_items.length > 4
                                  ? ` +${topic.topic_items.length - 4} more`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* Personalise selected topic */}
              {form.selectedTopicId && (
                <div className="space-y-3 rounded-lg border border-border bg-card px-4 py-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Personalise (optional)
                  </p>
                  <div>
                    <label
                      htmlFor="topicFraming"
                      className="mb-1 block text-xs text-muted-foreground"
                    >
                      Your framing
                    </label>
                    <input
                      id="topicFraming"
                      type="text"
                      value={form.topicFraming}
                      onChange={(e) => update("topicFraming", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="e.g. Rebecca's was purple — what's yours?"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="topicQuote"
                      className="mb-1 block text-xs text-muted-foreground"
                    >
                      Quote or memory
                    </label>
                    <textarea
                      id="topicQuote"
                      value={form.topicQuote}
                      onChange={(e) => update("topicQuote", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="A short quote or memory"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  update("topicIsCustom", true)
                  update("selectedTopicId", "")
                }}
                className="text-sm text-primary underline-offset-2 hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
              >
                My topic isn&rsquo;t listed — add a custom one
              </button>
            </>
          )}

          {/* Custom topic form */}
          {form.topicIsCustom && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
                Custom topics are added to your event only. They may not appear
                in the all-time universal rankings.
              </div>

              <div>
                <label
                  htmlFor="customTopicTitle"
                  className="mb-1.5 block text-sm text-foreground"
                >
                  Question or topic <span aria-hidden="true">*</span>
                </label>
                <input
                  id="customTopicTitle"
                  type="text"
                  value={form.customTopicTitle}
                  onChange={(e) => update("customTopicTitle", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="e.g. Favourite holiday destination"
                  autoFocus
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-foreground">
                  Options{" "}
                  <span className="text-muted-foreground">(at least 2)</span>
                </p>
                <ul className="space-y-2">
                  {form.customTopicItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const next = [...form.customTopicItems]
                          next[i] = e.target.value
                          update("customTopicItems", next)
                        }}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder={`Option ${i + 1}`}
                        aria-label={`Option ${i + 1}`}
                      />
                      {form.customTopicItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              "customTopicItems",
                              form.customTopicItems.filter((_, j) => j !== i)
                            )
                          }
                          className="text-muted-foreground hover:text-destructive focus:outline-none"
                          aria-label={`Remove option ${i + 1}`}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {form.customTopicItems.length < 10 && (
                  <button
                    type="button"
                    onClick={() =>
                      update("customTopicItems", [...form.customTopicItems, ""])
                    }
                    className="mt-2 text-sm text-primary underline-offset-2 hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
                  >
                    + Add option
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => update("topicIsCustom", false)}
                className="text-sm text-muted-foreground underline-offset-2 hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
              >
                ← Back to topic list
              </button>
            </div>
          )}
        </div>
      )}

      {/* Curate */}
      {step === "curate" && selectedTopic && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which options to show your guests. They can also add their
            own during the event.
          </p>

          <ul className="space-y-2" role="list">
            {(selectedTopic.topic_items.filter((i) => i.is_master)).map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors has-checked:border-primary has-checked:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={form.curatedItemIds.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        update("curatedItemIds", [...form.curatedItemIds, item.id])
                      } else {
                        update(
                          "curatedItemIds",
                          form.curatedItemIds.filter((id) => id !== item.id),
                        )
                      }
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{item.label}</span>
                </label>
              </li>
            ))}
          </ul>

          <div>
            <p className="mb-2 text-sm text-foreground">Add your own options</p>
            <ul className="space-y-2">
              {form.curatedCustomLabels.map((label, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => {
                      const next = [...form.curatedCustomLabels]
                      next[i] = e.target.value
                      update("curatedCustomLabels", next)
                    }}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder={`Custom option ${i + 1}`}
                    aria-label={`Custom option ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "curatedCustomLabels",
                        form.curatedCustomLabels.filter((_, j) => j !== i),
                      )
                    }
                    className="text-muted-foreground hover:text-destructive focus:outline-none"
                    aria-label={`Remove custom option ${i + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                update("curatedCustomLabels", [...form.curatedCustomLabels, ""])
              }
              className="mt-2 text-sm text-primary underline-offset-2 hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      {/* Closing date */}
      {step === "closing" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="closesAt"
              className="mb-1.5 block text-sm text-foreground"
            >
              Closing date and time <span aria-hidden="true">*</span>
            </label>
            <input
              id="closesAt"
              type="datetime-local"
              value={form.closesAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => update("closesAt", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              After this time the event is read-only and final totals are shown.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => update("isPrivate", e.target.checked)}
              className="accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Private event
              </p>
              <p className="text-xs text-muted-foreground">
                Only people you invite can view this event.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Shared fund */}
      {step === "pot" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A shared fund lets you deposit a sum that can be allocated to guests
            who cannot make their own pledge. Unallocated funds go to the
            charity when the event closes.
          </p>
          <div>
            <label
              htmlFor="potAmount"
              className="mb-1.5 block text-sm text-foreground"
            >
              Fund amount (£) — leave blank to skip
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                aria-hidden="true"
              >
                £
              </span>
              <input
                id="potAmount"
                type="number"
                min="0"
                step="1"
                value={form.potAmount}
                onChange={(e) => update("potAmount", e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-7 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {currentStepIndex > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={submitting}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step !== "pot" ? (
          <Button
            type="button"
            onClick={next}
            disabled={!canContinue()}
            className="flex-1"
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "Creating…" : "Create event"}
          </Button>
        )}
      </div>
    </div>
  )
}
