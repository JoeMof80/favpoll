"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { setFavpollTopic } from "@/app/favpolls/[id]/manage/actions"
import { hasFinePointer } from "@/lib/pointer"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { addOrganizerItem } from "@/app/favpolls/[id]/actions"
import {
  hideFavpollPollFavourite,
  showFavpollPollFavourite,
} from "@/lib/actions/favpoll-poll-favourites"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import type { Category, Favourite, TopicWithMeta } from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

/** The wizard's topic catalogue for the picker (loaded while the topic
 *  can still change). */
export type TopicPickerData = {
  topics: TopicWithMeta[]
  categories: Category[]
  suggested: TopicWithMeta[]
}

// THE FAVOURITES IN THE WIZARD'S DESIGN (founder, 2026-09-30): the
// wizard's topic card — the topic as the poll heading, the first five
// favourites as chips with "+N more", the pencil to the wizard's own
// topic picker in an overlay (step 4, 2026-09-30 — the wizard is
// creation only now) or the lock — and its items
// dialog for working the list: add (the organiser's own, the guest
// add's twin), hide from the poll, put back. Organiser-added
// favourites are the dialog's "Added by you"; the rest are the
// existing items.

export type ManageFavourite = {
  id: string
  rowId: string
  label: string
  /** favourites.source — "organiser" is "added by you". */
  source: string
  isGuestAdded: boolean
  isHidden: boolean
}

export function FavouritesGroup({
  favpollId,
  topicTitle,
  favourites,
  topicIsFinite,
  topicLockReason,
  readOnly = false,
  topicId,
  subsetId,
  picker,
  primaryCharityName,
  onChanged,
}: {
  favpollId: string
  topicTitle: string | undefined
  favourites: ManageFavourite[]
  topicIsFinite: boolean
  topicLockReason: string | null
  readOnly?: boolean
  topicId: string | null
  subsetId: string | null
  /** Null while the topic is locked or the favpoll closed. */
  picker: TopicPickerData | null
  primaryCharityName?: string
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [topicOpen, setTopicOpen] = useState(false)
  const [topicSearch, setTopicSearch] = useState("")
  const [switching, setSwitching] = useState(false)

  // The picker's notion of "selected": a subset entry's id is the
  // subset's, a topic entry's the topic's (favpoll-topic-rules §1).
  const pickerValue: FavpollFormValues["topics"] = topicId
    ? [
        {
          topicId,
          subsetId: subsetId ?? null,
          title: topicTitle ?? "",
          isCustom: false,
          items: [],
          customLabels: [],
        },
      ]
    : []

  async function pickTopic(v: FavpollFormValues["topics"]) {
    const next = v[0]
    setTopicOpen(false)
    setTopicSearch("")
    // A tap on the already-selected topic arrives as [] (the step's
    // toggle) — under the single-select grammar that tap just closes.
    if (!next) return
    if (
      next.topicId === topicId &&
      (next.subsetId ?? null) === (subsetId ?? null)
    )
      return
    setSwitching(true)
    try {
      await setFavpollTopic(favpollId, {
        topicId: next.topicId,
        subsetId: next.subsetId ?? null,
      })
      onChanged()
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't change the topic.",
        {
          style: TOAST_ERROR_STYLE,
        }
      )
    } finally {
      setSwitching(false)
    }
  }

  async function run(act: () => Promise<unknown>) {
    try {
      await act()
      onChanged()
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't save — try again.",
        {
          style: TOAST_ERROR_STYLE,
        }
      )
    }
  }

  const shown = favourites.filter((f) => !f.isHidden)
  const hidden = favourites.filter((f) => f.isHidden)
  const added = shown.filter((f) => f.source === "organiser" && !f.isGuestAdded)
  const existing = shown.filter(
    (f) => !(f.source === "organiser" && !f.isGuestAdded)
  )
  const title = topicTitle ?? "Topic"

  return (
    <div className="py-6">
      <WizardTopicCard
        topic={{
          topicId: "",
          title,
          isCustom: false,
          items: existing.map((f) => ({ id: f.id, label: f.label })),
          customLabels: added.map((f) => f.label),
        }}
        sortedExistingItems={
          existing.map((f) => ({ id: f.id, label: f.label })) as Favourite[]
        }
        customLabels={added.map((f) => f.label)}
        showItemsSection
        onEdit={() => setTopicOpen(true)}
        onOpenItemsDialog={() => setOpen(true)}
        lockedReason={
          readOnly
            ? "This favpoll has closed."
            : (topicLockReason ??
              (picker ? undefined : "The topic can't change right now."))
        }
      />
      {/* The wizard's topic overlay, verbatim in shape: single-select,
          a tap picks and closes, Cancel is the only other act. */}
      {picker && !readOnly && (
        <ResponsiveOverlay
          open={topicOpen}
          onOpenChange={(o) => {
            setTopicOpen(o)
            if (!o) setTopicSearch("")
          }}
          title="Pick a topic"
          dialogStyle={{ minHeight: "min(600px, 80vh)" }}
          hideCloseButton
          hideMobileTitleBar
          separators
          headerClassName="px-5 pt-4 pb-3"
          bodyClassName="p-0"
          fullscreenOnMobile
          header={
            <div>
              <span className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Pick a topic
              </span>
              <div className="flex items-center gap-2">
                <Search
                  className="size-4 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  autoFocus={hasFinePointer()}
                  placeholder="Search topics…"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          }
          footer={
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full md:text-base"
              disabled={switching}
              onClick={() => {
                setTopicOpen(false)
                setTopicSearch("")
              }}
            >
              Cancel
            </Button>
          }
        >
          <TopicStep
            topics={picker.topics}
            categories={picker.categories}
            value={pickerValue}
            onChange={(v) => void pickTopic(v)}
            suggestedTopics={picker.suggested}
            primaryCharityName={primaryCharityName}
            search={topicSearch}
            onSearchChange={setTopicSearch}
          />
        </ResponsiveOverlay>
      )}
      {!readOnly && (
        <TopicItemsDialog
          open={open}
          onOpenChange={setOpen}
          topicTitle={title}
          existingItems={existing.map((f) => ({ id: f.id, label: f.label }))}
          addedItems={added.map((f) => f.label)}
          onAdd={
            topicIsFinite
              ? () =>
                  toast.error("This topic's list is fixed.", {
                    style: TOAST_ERROR_STYLE,
                  })
              : (label) => void run(() => addOrganizerItem(favpollId, label))
          }
          onRemove={(label) => {
            const f = added.find((a) => a.label === label)
            if (f) void run(() => hideFavpollPollFavourite(f.rowId))
          }}
          onHide={(id) => {
            const f = existing.find((a) => a.id === id)
            if (f) void run(() => hideFavpollPollFavourite(f.rowId))
          }}
          hiddenItems={hidden.map((f) => ({ id: f.id, label: f.label }))}
          onRestore={(id) => {
            const f = hidden.find((a) => a.id === id)
            if (f) void run(() => showFavpollPollFavourite(f.rowId))
          }}
        />
      )}
    </div>
  )
}
