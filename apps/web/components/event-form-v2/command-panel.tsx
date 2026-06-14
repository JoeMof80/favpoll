"use client"

import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  shortTopicLabel,
  deriveRegister,
  suggestClosingDate,
} from "@/lib/registers"
import { DateTimePicker } from "./date-time-picker"
import type {
  Category,
  Charity,
  EventCategory,
  EventGrouping,
  EventSubject,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"

type CommandPanelProps = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: (closesAt?: Date) => void
  onCancel: () => void
}

export function CommandPanel({
  charities,
  topics,
  categories,
  mode,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CommandPanelProps) {
  const form = useFormContext<EventFormValues>()

  const category = (useWatch({ control: form.control, name: "category" }) ??
    null) as EventCategory | null
  const grouping = (useWatch({ control: form.control, name: "grouping" }) ??
    "individual") as EventGrouping
  const topicsValue = useWatch({ control: form.control, name: "topics" }) ?? []
  const charitiesValue =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const nameValue = useWatch({ control: form.control, name: "name" }) ?? ""
  const causeLabelValue =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const subjectValue = (useWatch({ control: form.control, name: "subject" }) ??
    "someone") as EventSubject
  const isListed = useWatch({ control: form.control, name: "isListed" }) ?? true

  const [honourOpen, setHonourOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)
  const [loveOpen, setLoveOpen] = useState(false)

  const [publishOpen, setPublishOpen] = useState(false)
  const [publishClosesAt, setPublishClosesAt] = useState<Date | undefined>()

  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : null

  const topicLabel = topicsValue[0]
    ? shortTopicLabel(topicsValue[0].title)
    : null
  const charityNames = charities
    .filter((c) => charitiesValue.includes(c.id))
    .map((c) => c.name)

  const charityCount = charitiesValue.length
  const charityDescription =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  // Create mode: only Name/Cause must be filled before publishing
  // Edit mode: all fields must be filled before saving
  const missing: string[] = []
  if (mode === "edit") {
    if (!category) missing.push("Occasion")
    if (!charitiesValue?.length) missing.push("Charity")
    if (!topicsValue?.[0]?.topicId && !topicsValue?.[0]?.isCustom)
      missing.push("favpoll topic")
  }
  if (subjectValue === "cause") {
    if (!causeLabelValue) missing.push("Cause")
  } else {
    if (!nameValue) missing.push("Name")
  }

  const isPublishable = missing.length === 0

  function handlePublishClick() {
    const suggested = suggestClosingDate(category)
    setPublishClosesAt(new Date(suggested))
    setPublishOpen(true)
  }

  return (
    <>
      {/* Floating command panel */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:right-4 md:bottom-4 md:left-auto md:w-72 md:rounded-xl md:border md:shadow-lg">
        <div
          className="space-y-3 p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Three-pick summary */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Your event
            </p>
            {mode === "create" ? (
              /* Read-only text summary in create mode */
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {categoryLabel && (
                  <span className="text-sm text-foreground">
                    {categoryLabel}
                  </span>
                )}
                {charityNames.map((name) => (
                  <span key={name} className="text-sm text-foreground">
                    {name}
                  </span>
                ))}
                {topicLabel && (
                  <span className="text-sm text-foreground">{topicLabel}</span>
                )}
              </div>
            ) : (
              /* Clickable chips in edit mode */
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  selected={!!categoryLabel}
                  size="sm"
                  onClick={() => setHonourOpen(true)}
                >
                  {categoryLabel || "Occasion…"}
                </Chip>
                {charityNames.length > 0 ? (
                  charityNames.map((name) => (
                    <Chip
                      key={name}
                      selected
                      size="sm"
                      onClick={() => setCharityOpen(true)}
                    >
                      {name}
                    </Chip>
                  ))
                ) : (
                  <Chip size="sm" onClick={() => setCharityOpen(true)}>
                    Charity…
                  </Chip>
                )}
                <Chip
                  selected={!!topicLabel}
                  size="sm"
                  onClick={() => setLoveOpen(true)}
                >
                  {topicLabel || "Topic…"}
                </Chip>
              </div>
            )}
          </div>

          {/* Listed / Unlisted */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {isListed ? "Listed" : "Unlisted"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isListed
                  ? "Appears on the live events page."
                  : "Only reachable by people you give the link to."}
              </p>
            </div>
            <Switch
              checked={isListed}
              onCheckedChange={(v) => form.setValue("isListed", v)}
            />
          </div>

          {/* Missing fields */}
          {missing.length > 0 && (
            <ul className="space-y-0.5">
              {missing.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {m}
                </li>
              ))}
            </ul>
          )}

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
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
              onClick={
                mode === "create" ? handlePublishClick : () => onSubmit()
              }
            >
              {submitting
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                  ? "Publish"
                  : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Publish overlay — create mode only */}
      {mode === "create" && (
        <ResponsiveOverlay
          open={publishOpen}
          onOpenChange={(o) => !o && setPublishOpen(false)}
          title="When does the poll close?"
          footer={
            <div className="space-y-2">
              <Button
                type="button"
                className="w-full"
                disabled={submitting || !publishClosesAt}
                onClick={() => {
                  if (publishClosesAt) onSubmit(publishClosesAt)
                }}
              >
                {submitting ? "Creating…" : "Publish"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => setPublishOpen(false)}
              >
                ← Back
              </Button>
            </div>
          }
        >
          <DateTimePicker
            value={publishClosesAt}
            onChange={setPublishClosesAt}
          />
        </ResponsiveOverlay>
      )}

      {/* Edit-mode overlays only */}
      {mode === "edit" && (
        <>
          {/* Honour sheet */}
          <ResponsiveOverlay
            open={honourOpen}
            onOpenChange={setHonourOpen}
            title="Occasion"
            description="What is this event for?"
            footer={
              <Button
                type="button"
                className="w-full"
                onClick={() => setHonourOpen(false)}
              >
                Done
              </Button>
            }
          >
            <HonourStep
              value={{
                category,
                grouping,
                subject: subjectValue,
                causeLabel: causeLabelValue,
              }}
              onChange={({
                category: cat,
                grouping: grp,
                subject: sub,
                causeLabel: cl,
              }) => {
                const derived = deriveRegister(cat, grp)
                form.setValue("category", cat ?? undefined)
                form.setValue("grouping", grp)
                form.setValue("subject", sub)
                form.setValue("causeLabel", cl)
                form.setValue("register", derived)
                form.setValue("openingLine", "")
                form.setValue("isListed", derived !== "remembering")
              }}
            />
          </ResponsiveOverlay>

          {/* Charity sheet */}
          <ResponsiveOverlay
            open={charityOpen}
            onOpenChange={setCharityOpen}
            title="Charity"
            description={charityDescription}
            footer={
              <Button
                type="button"
                className="w-full"
                onClick={() => setCharityOpen(false)}
              >
                Done
              </Button>
            }
          >
            <CharityStep
              charities={charities}
              value={charitiesValue}
              onChange={(v) =>
                form.setValue("charities", v, { shouldValidate: true })
              }
            />
          </ResponsiveOverlay>

          {/* Love sheet */}
          <ResponsiveOverlay
            open={loveOpen}
            onOpenChange={setLoveOpen}
            title="favpoll topic"
            description="Choose what everyone votes on."
            footer={
              <Button
                type="button"
                className="w-full"
                onClick={() => setLoveOpen(false)}
              >
                Done
              </Button>
            }
          >
            <LoveStep
              topics={topics}
              categories={categories}
              value={topicsValue}
              onChange={(v) =>
                form.setValue("topics", v, { shouldValidate: true })
              }
            />
          </ResponsiveOverlay>
        </>
      )}
    </>
  )
}
