"use client"

import { useState } from "react"
import { Lock, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  CharityStep,
  type RegisterPick,
} from "@/components/favpoll-flow/charity-step"
import { CharityRow } from "@/components/charity-row"
import { SettingsGroup, SettingsRow } from "@/components/manage/settings-rows"
import { findOrCreateRegisterCharity } from "@/app/favpolls/new/actions"
import { setFavpollCharities } from "@/app/favpolls/[id]/manage/actions"
import { hasFinePointer } from "@/lib/pointer"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import type { Charity } from "@favpoll/types"

// THE CHARITIES, changed in place (step 3, 2026-09-29): the wizard's
// single-select picker — a tap picks and closes, Cancel is the only
// other act — opened from a row's pencil (REPLACE that charity) or the
// "Add another charity" row (APPEND, up to three). The set is managed
// on the rows (remove), never in the overlay: the wizard's grammar
// (2026-09-15). A lock reason replaces every control.

type Current = {
  charity: Charity & { created_at?: string }
}

export function CharityRows({
  favpollId,
  charities,
  pickerCharities,
  amountEach,
  lockReason,
  readOnly = false,
  consentGatingActive = false,
  eventCategory,
  onChanged,
}: {
  favpollId: string
  charities: Current[]
  pickerCharities: Charity[]
  amountEach: number
  /** Why the set can't change — an appeal's fixed charity, or other
   *  people's money in. Null when it can. */
  lockReason: string | null
  readOnly?: boolean
  consentGatingActive?: boolean
  eventCategory?: "celebration" | "memorial" | "fundraiser" | null
  onChanged: () => void
}) {
  const editable = !readOnly && !lockReason
  const [open, setOpen] = useState(false)
  const [replaceId, setReplaceId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [extra, setExtra] = useState<Charity[]>([])
  const [busy, setBusy] = useState(false)

  const ids = charities.map((c) => c.charity.id)
  const list = [
    ...pickerCharities,
    ...extra.filter((x) => !pickerCharities.some((c) => c.id === x.id)),
  ]

  function openPicker(replace?: string) {
    setReplaceId(replace ?? null)
    setOpen(true)
  }
  function closePicker() {
    setOpen(false)
    setSearch("")
    setReplaceId(null)
  }

  async function commit(next: string[]) {
    setBusy(true)
    try {
      await setFavpollCharities(favpollId, next)
      onChanged()
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Couldn't save the charity — try again.",
        { style: TOAST_ERROR_STYLE }
      )
    } finally {
      setBusy(false)
    }
  }

  async function pick(id: string) {
    const next = ids.includes(id)
      ? ids
      : replaceId
        ? ids.map((i) => (i === replaceId ? id : i))
        : ids.length < 3
          ? [...ids, id]
          : ids
    closePicker()
    if (next.join(",") !== ids.join(",")) await commit(next)
  }

  async function registerAdd(p: RegisterPick) {
    const c = await findOrCreateRegisterCharity({
      registeredNumber: p.registeredNumber,
      displayName: p.displayName,
    })
    setExtra((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]))
    await pick(c.id)
  }

  return (
    <>
      <SettingsGroup
        title="Charities"
        description="Every pledge is split equally between them."
      >
        {charities.map(({ charity }, i) => (
          <SettingsRow
            key={charity.id}
            label={charities.length > 1 ? `Charity ${i + 1}` : "Charity"}
            // STATUS ONLY — favpoll owns the consent outreach, not the
            // organiser (founder, 2026-09-14).
            description={
              charity.consent_status && charity.consent_status !== "approved"
                ? charity.consent_status === "declined"
                  ? "The charity has declined — pledges here are paused."
                  : `Pledges are held until ${charity.name} agrees to receive them.`
                : undefined
            }
          >
            <span className="flex w-full items-center gap-3">
              <span className="min-w-0 flex-1">
                <CharityRow
                  charity={{
                    ...charity,
                    created_at: charity.created_at ?? "",
                  }}
                  amountRaised={amountEach}
                  size="sm"
                />
              </span>
              {editable ? (
                <span className="inline-flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    disabled={busy}
                    onClick={() => openPicker(charity.id)}
                    aria-label={`Replace ${charity.name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  {ids.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={busy}
                      onClick={() =>
                        commit(ids.filter((i) => i !== charity.id))
                      }
                      aria-label={`Remove ${charity.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </span>
              ) : lockReason ? (
                <Lock
                  className="size-4 text-muted-foreground"
                  aria-label={lockReason}
                />
              ) : null}
            </span>
          </SettingsRow>
        ))}
        {editable && ids.length < 3 && (
          <SettingsRow
            label="Add another charity"
            description="Up to three; pledges are split equally."
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => openPicker()}
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add
            </Button>
          </SettingsRow>
        )}
        {lockReason && (
          <SettingsRow label="Changing the charity" description={lockReason} />
        )}
      </SettingsGroup>

      <ResponsiveOverlay
        separators
        open={open}
        onOpenChange={(o) => (o ? setOpen(true) : closePicker())}
        title="Pick a charity"
        hideCloseButton
        hideMobileTitleBar
        dialogStyle={{ minHeight: "min(600px, 80vh)" }}
        headerClassName="px-5 pt-4 pb-3"
        bodyClassName="p-0"
        fullscreenOnMobile
        header={
          <div>
            <span className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {replaceId ? "Replace the charity" : "Pick a charity"}
            </span>
            <div className="flex items-center gap-2">
              <Search
                className="size-4 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
              <input
                type="text"
                autoFocus={hasFinePointer()}
                placeholder="Search charities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        }
        footer={
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full md:text-base"
            onClick={closePicker}
          >
            Cancel
          </Button>
        }
      >
        <CharityStep
          charities={list}
          value={ids}
          onPick={(id) => void pick(id)}
          search={search}
          onRegisterAdd={registerAdd}
          onSeedSearch={setSearch}
          eventCategory={eventCategory}
        />
      </ResponsiveOverlay>
      {/* consent-first posture: the picker's own rows say when a charity
          hasn't yet agreed; nothing more to add here. */}
      {consentGatingActive ? null : null}
    </>
  )
}
