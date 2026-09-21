"use client"

import { Search } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import type { Favourite } from "@favpoll/types"
import { hasFinePointer } from "@/lib/pointer"

// The settled picker (founder, 2026-09-16, after a tap-advance audition):
// chips TOGGLE — multi-select visible and self-evident — and the footer's
// primary commits ("Next" with a selection, "Give without picking" with
// none). Tap-advance was auditioned and rejected: it hid multi-pick
// behind step 2. ADD IS SEPARATE (option C, same day): the picker is
// pure select; a quiet list-end row opens a focused add view (the
// overlay swaps its content — never nested) where the act gets its
// consequence copy. The creatable-combobox "+ Add ‘X’" pill was
// auditioned and retired — one field doing two jobs was the muddle
// being organised away.

type PickerHeaderProps = {
  search: string
  onSearchChange: (v: string) => void
  topicTitle?: string
}

export function PickerHeader({
  search,
  onSearchChange,
  topicTitle,
}: PickerHeaderProps) {
  const topic = topicTitle?.toLowerCase()
  return (
    <div>
      <label
        htmlFor="pledge-picker-search"
        className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        {topic ? `Pick your favourite ${topic}` : "Your favourite"}
      </label>
      {/* The search glyph marks this as a FIELD, not a subtitle — a bare
          borderless input at the top of a busy list lacked shape
          (founder, 2026-09-16; same treatment across the picker
          overlays). */}
      <div className="flex items-center gap-2">
        <Search
          className="size-4 shrink-0 text-muted-foreground/50"
          aria-hidden="true"
        />
        <input
          id="pledge-picker-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus={hasFinePointer()}
          placeholder="Search…"
          className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}

type PickerPillsProps = {
  filteredItems: Favourite[]
  selectedIds: string[]
  search: string
  isInfinite?: boolean
  hasAddItem: boolean
  /** Adding is possible — the grid ends with the "+ Add your own" pill */
  canAdd: boolean
  /** A tap TOGGLES the pill — commit happens in the footer. */
  onToggle: (id: string) => void
  /** Opens the focused add view (seeded with the current search). */
  onEnterAdd: () => void
}

export function PickerPills({
  filteredItems,
  selectedIds,
  search,
  isInfinite,
  hasAddItem,
  canAdd,
  onToggle,
  onEnterAdd,
}: PickerPillsProps) {
  const searching = search.toLowerCase().trim().length > 0

  if (filteredItems.length === 0 && !searching) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground">
        {isInfinite && hasAddItem
          ? "No items yet — be the first to add one."
          : "No items available for this topic."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {filteredItems.map((item) => (
          <Chip
            key={item.id}
            size="lg"
            selected={selectedIds.includes(item.id)}
            onMouseDown={(e) => {
              e.preventDefault()
              onToggle(item.id)
            }}
          >
            {item.label}
          </Chip>
        ))}
        {/* The add ENTRY ends the grid (founder, 2026-09-18, after two
            auditions — header line and list-end link): you only need to
            add if yours isn't there, and you reach the END to find out.
            Long topics filter down via search, which floats the pill
            into view. An honest button — it opens the add view. */}
        {canAdd && (
          <Chip
            size="lg"
            className="border-dashed bg-background text-primary"
            onMouseDown={(e) => {
              e.preventDefault()
              onEnterAdd()
            }}
          >
            + Add your own
          </Chip>
        )}
      </div>

      {searching && filteredItems.length === 0 && (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No items found.
        </p>
      )}
    </div>
  )
}

type AddFavouriteViewProps = {
  topicTitle?: string
  addText: string
  onAddTextChange: (v: string) => void
  addingItem: boolean
  addError: string | null
  /** Enter submits, when there is text */
  onAdd: () => void
}

/** The focused add view (option C): one input, the consequence copy,
 *  and the footer's Back | Add twins (rendered by the dialog). */
export function AddFavouriteView({
  topicTitle,
  addText,
  onAddTextChange,
  addingItem,
  addError,
  onAdd,
}: AddFavouriteViewProps) {
  const topic = topicTitle?.toLowerCase()
  return (
    <div className="px-5 pt-4 pb-4">
      <label
        htmlFor="pledge-picker-add"
        className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        {topic ? `Add your own ${topic}` : "Add your own"}
      </label>
      <input
        id="pledge-picker-add"
        type="text"
        value={addText}
        onChange={(e) => onAddTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && addText.trim() && !addingItem) {
            e.preventDefault()
            onAdd()
          }
        }}
        // The guest CHOSE to add — the keyboard is wanted, every pointer
        autoFocus
        placeholder="Type a favourite…"
        className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Your favourite joins the poll for everyone to pick, and the organiser
        will see it.
      </p>
      {addError && <p className="mt-2 text-xs text-destructive">{addError}</p>}
    </div>
  )
}
