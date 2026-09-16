"use client"

import { Search } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import type { Favourite } from "@favpoll/types"
import { hasFinePointer } from "@/lib/pointer"

// The settled picker (founder, 2026-09-16, after a tap-advance audition):
// chips TOGGLE — multi-select visible and self-evident — and the footer's
// primary commits ("Next →" with a selection, "Give anyway →" with none).
// Tap-advance was auditioned and rejected: it hid multi-pick behind step 2.
// Adding your own is the creatable-combobox convention and nothing else:
// the search PLACEHOLDER advertises the dual purpose ("Search or add…"),
// and while typing an "+ Add ‘X’" pill appears whenever nothing matches
// exactly — adding auto-selects the new chip. A standing "+ Add your own"
// pill was also auditioned and rejected as a fake button (it only moved
// focus; on a phone its whole effect was "the keyboard appeared").

type PickerHeaderProps = {
  search: string
  onSearchChange: (v: string) => void
  /** Enter in the search adds, when the add pill is showing */
  onAdd: () => void
  topicTitle?: string
  showCreate: boolean
  /** Adding is possible — the placeholder advertises the combobox's
   *  dual purpose; a finite topic stays search-only. */
  canAdd?: boolean
}

export function PickerHeader({
  search,
  onSearchChange,
  onAdd,
  topicTitle,
  showCreate,
  canAdd = false,
}: PickerHeaderProps) {
  const topic = topicTitle?.toLowerCase()
  // The eyebrow carries the ASK (the step's title is sr-only on mobile —
  // a visible title above this said the same thing twice), so the
  // placeholder no longer restates the topic.
  const placeholder = canAdd ? "Search or add your own…" : "Search…"
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && showCreate) {
              e.preventDefault()
              onAdd()
            }
          }}
          autoFocus={hasFinePointer()}
          placeholder={placeholder}
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
  /** No exact match for the typed text — the "+ Add ‘X’" pill shows */
  showCreate: boolean
  addingItem: boolean
  addError: string | null
  isInfinite?: boolean
  hasAddItem: boolean
  /** A tap TOGGLES the pill — commit happens in the footer. */
  onToggle: (id: string) => void
  onAdd: () => void
}

export function PickerPills({
  filteredItems,
  selectedIds,
  search,
  showCreate,
  addingItem,
  addError,
  isInfinite,
  hasAddItem,
  onToggle,
  onAdd,
}: PickerPillsProps) {
  const searching = search.toLowerCase().trim().length > 0

  if (filteredItems.length === 0 && !searching) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground">
        {isInfinite && hasAddItem
          ? "No options yet — start typing to add one."
          : "No options available for this topic."}
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

        {/* Creatable-combobox affordance: while typing with no exact
            match, the concrete "+ Add ‘X’" pill. Discovery lives in the
            search placeholder ("Search or add…"), never a fake button. */}
        {showCreate && (
          <Chip
            size="lg"
            className="border-dashed bg-background text-primary"
            disabled={addingItem}
            onMouseDown={(e) => {
              e.preventDefault()
              onAdd()
            }}
          >
            {addingItem ? "Adding…" : `+ Add “${search.trim()}”`}
          </Chip>
        )}
      </div>

      {searching && !showCreate && filteredItems.length === 0 && (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No options found.
        </p>
      )}
      {addError && <p className="text-xs text-destructive">{addError}</p>}

      {/* The no-favourite exit lives in the FOOTER next to Cancel
          (founder, 2026-09-16): a list-end link sank below the fold on
          long topics. See step1Footer in index.tsx. */}
    </div>
  )
}
