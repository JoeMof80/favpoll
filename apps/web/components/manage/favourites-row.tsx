"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { addOrganizerItem } from "@/app/favpolls/[id]/actions"
import {
  hideFavpollPollFavourite,
  showFavpollPollFavourite,
} from "@/lib/actions/favpoll-poll-favourites"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import type { Favourite } from "@favpoll/types"

// THE FAVOURITES IN THE WIZARD'S DESIGN (founder, 2026-09-30): the
// wizard's topic card — the topic as the poll heading, the first five
// favourites as chips with "+N more", the pencil to change the topic
// (the wizard's picker, until step 4) or the lock — and its items
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
  editHref,
  onChanged,
}: {
  favpollId: string
  topicTitle: string | undefined
  favourites: ManageFavourite[]
  topicIsFinite: boolean
  topicLockReason: string | null
  readOnly?: boolean
  editHref: string
  onChanged: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

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
        onEdit={() => router.push(editHref)}
        onOpenItemsDialog={() => setOpen(true)}
        lockedReason={
          readOnly ? "This favpoll has closed." : (topicLockReason ?? undefined)
        }
      />
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
