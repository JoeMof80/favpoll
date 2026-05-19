"use client"

import { EventHero } from "@/components/event-hero"
import { PollEditor } from "@/components/canvas/poll-editor"
import { CanvasSidebar } from "@/components/canvas/canvas-sidebar"
import { ShareScreen } from "@/components/canvas/share-screen"
import { OCCASIONS, OCCASION_LABELS } from "@/lib/occasions"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import type {
  Category,
  Charity,
  CanvasSubmitData,
  CanvasInitialData,
  TopicWithMeta,
} from "@/types"
import { useCanvas } from "./use-canvas"

// Re-export types that server pages import from here
export type {
  TopicWithMeta,
  CanvasPoll,
  CanvasSubmitData,
  CanvasInitialData,
} from "@/types"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  preselectedTopicId?: string | null
  mode: "create" | "edit"
  initialData?: CanvasInitialData
  onSave?: (data: CanvasSubmitData) => Promise<void>
  eventId?: string
  extensionCount?: number
  hardCloseAt?: string | null
}

export function EventCanvas(props: Props) {
  const {
    state,
    setPhotoUrl,
    submitting,
    error,
    shareLink,
    placeholders,
    router,
    set,
    updatePoll,
    removePollByTopicId,
    selectTopic,
    toggleCharity,
    handleSubmit,
  } = useCanvas(props)

  if (shareLink) {
    return (
      <ShareScreen
        shareLink={shareLink}
        onNavigate={(path) => router.push(path)}
      />
    )
  }

  return (
    <>
      {/* Occasion subheader — fixed below main nav (top-14) */}
      <div className="fixed top-14 left-0 right-0 z-30 border-b border-border bg-background">
        <div className="mx-auto max-w-330 px-6 py-2">
          <div
            role="radiogroup"
            aria-label="Occasion"
            className="flex gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {OCCASIONS.map((occ) => {
              const selected = state.occasion === occ.value
              return (
                <Chip
                  key={occ.value}
                  role="radio"
                  aria-checked={selected}
                  selected={selected}
                  onClick={() => {
                    set("occasion", occ.value)
                    set("occasionLabel", OCCASION_LABELS[occ.value] ?? "")
                  }}
                  className="shrink-0"
                >
                  {occ.label}
                </Chip>
              )
            })}
          </div>
        </div>
      </div>

      {/* pt-24 = top-14 header + ~10 subheader, pb-16 clears bottom bar */}
      <main className="mx-auto max-w-330 px-6 pt-24 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Polls */}
          <div>
            <EventHero
              mode="edit"
              occasion={state.occasion}
              occasionLabel={state.occasionLabel}
              protagonistName={state.protagonistName}
              protagonistBio={state.protagonistBio}
              dateLabel={state.dateLabel}
              initialPhotoUrl={props.initialData?.photoUrl}
              placeholders={placeholders}
              onOccasionLabelChange={(v) => set("occasionLabel", v)}
              onProtagonistNameChange={(v) => set("protagonistName", v)}
              onProtagonistBioChange={(v) => set("protagonistBio", v)}
              onDateLabelChange={(v) => set("dateLabel", v)}
              onPhotoUrlChange={setPhotoUrl}
            />
            {state.polls.map((poll) => (
              <PollEditor
                key={poll.key}
                poll={poll}
                topics={props.topics}
                categories={props.categories}
                occasion={state.occasion}
                placeholders={placeholders}
                onUpdatePoll={(updates) => updatePoll(poll.key, updates)}
                onSelectTopic={(topic) => selectTopic(poll.key, topic)}
                onRemoveCustomPoll={removePollByTopicId}
              />
            ))}
          </div>

          {/* Sidebar */}
          <CanvasSidebar
            charityIds={state.charityIds}
            charitySearch={state.charitySearch}
            charities={props.charities}
            closesAt={state.closesAt}
            isPrivate={state.isPrivate}
            potAmount={state.potAmount}
            extensionCount={props.extensionCount}
            hardCloseAt={props.hardCloseAt}
            eventId={props.eventId}
            onCharityToggle={toggleCharity}
            onCharitySearchChange={(v) => set("charitySearch", v)}
            onClosesAtChange={(v) => set("closesAt", v)}
            onIsPrivateChange={(v) => set("isPrivate", v)}
            onPotAmountChange={(v) => set("potAmount", v)}
          />
        </div>
      </main>

      {/* Fixed bottom bar — action buttons only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background">
        <div className="mx-auto flex max-w-330 items-center justify-end gap-2 px-6 py-3">
          {error && (
            <p role="alert" className="mr-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {props.mode === "edit" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? props.mode === "create"
                ? "Creating…"
                : "Saving…"
              : props.mode === "create"
                ? "Publish event"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </>
  )
}
