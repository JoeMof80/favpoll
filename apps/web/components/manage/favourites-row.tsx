"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Pencil, Plus, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SettingsGroup, SettingsRow } from "@/components/manage/settings-rows"
import { addOrganizerItem } from "@/app/favpolls/[id]/actions"
import {
  hideFavpollPollFavourite,
  showFavpollPollFavourite,
} from "@/lib/actions/favpoll-poll-favourites"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import { cn } from "@/lib/utils"

// THE FAVOURITES, changed in place (step 3, 2026-09-29): a chip's ×
// HIDES it from the poll (the record keeps it, faded, with its
// pledges), a faded chip's ↺ restores it, and "Add a favourite" is the
// organiser's own add on an open-ended topic (the guest add's twin,
// addOrganizerItem). Changing the TOPIC itself is the wizard's picker
// still — a door here, or the lock's reason once guests have pledged.

export type ManageFavourite = {
  id: string
  rowId: string
  label: string
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
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  async function run(key: string, act: () => Promise<unknown>) {
    setBusy(key)
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
    } finally {
      setBusy(null)
    }
  }

  async function add() {
    const label = draft.trim()
    if (!label) return
    await run("add", () => addOrganizerItem(favpollId, label))
    setDraft("")
  }

  const shown = favourites.filter((f) => !f.isHidden)
  const hidden = favourites.filter((f) => f.isHidden)

  return (
    <SettingsGroup title={topicTitle ? `Favourite ${topicTitle}` : "Topic"}>
      <SettingsRow
        label="Topic"
        description={
          topicLockReason ??
          (readOnly ? undefined : "Pick a different topic in the wizard.")
        }
      >
        <span className="inline-flex items-center gap-2">
          {topicTitle ?? <span className="text-muted-foreground">None</span>}
          {!readOnly &&
            (topicLockReason ? (
              <Lock
                className="size-4 text-muted-foreground"
                aria-label={topicLockReason}
              />
            ) : (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Link href={editHref} aria-label="Change the topic">
                  <Pencil className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ))}
        </span>
      </SettingsRow>

      <SettingsRow
        label="Favourites"
        description={
          shown.length > 0
            ? `${shown.length} in the poll${
                shown.some((f) => f.isGuestAdded)
                  ? " · tinted = added by guests"
                  : ""
              }${readOnly ? "" : " · × hides one from the poll"}`
            : "No favourites in the poll."
        }
        stacked
      >
        <div className="flex flex-wrap gap-1.5">
          {shown.map((f) => (
            <Chip
              key={f.id}
              size="sm"
              readOnly={readOnly}
              onRemove={
                readOnly
                  ? undefined
                  : () =>
                      void run(f.rowId, () => hideFavpollPollFavourite(f.rowId))
              }
              disabled={busy === f.rowId}
              className={cn(
                f.isGuestAdded && "border-primary bg-primary/10 text-primary"
              )}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </SettingsRow>

      {hidden.length > 0 && (
        <SettingsRow
          label="Hidden"
          description="Kept on the record with their pledges, out of the poll."
          stacked
        >
          <div className="flex flex-wrap gap-1.5">
            {hidden.map((f) => (
              <span key={f.id} className="inline-flex items-center gap-0.5">
                <Chip size="sm" readOnly className="opacity-40">
                  {f.label}
                </Chip>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={busy === f.rowId}
                    onClick={() =>
                      void run(f.rowId, () => showFavpollPollFavourite(f.rowId))
                    }
                    aria-label={`Put ${f.label} back in the poll`}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
              </span>
            ))}
          </div>
        </SettingsRow>
      )}

      {!readOnly && !topicIsFinite && (
        <SettingsRow
          label="Add a favourite"
          description="Your own addition to the list, for guests to pick."
          stacked
        >
          <InputGroup className="max-w-md bg-background">
            <InputGroupInput
              value={draft}
              maxLength={60}
              placeholder="e.g. Edinburgh"
              aria-label="Add a favourite"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void add()
                }
              }}
            />
            <InputGroupButton
              type="button"
              disabled={!draft.trim() || busy === "add"}
              onClick={() => void add()}
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add
            </InputGroupButton>
          </InputGroup>
        </SettingsRow>
      )}
    </SettingsGroup>
  )
}
