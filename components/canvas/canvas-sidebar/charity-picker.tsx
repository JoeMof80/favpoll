"use client"

import { useRef, useEffect, useState } from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import type { Charity } from "@/types"

export const MAX_CHARITIES = 3

type Props = {
  charities: Charity[]
  charityIds: string[]
  charitySearch: string
  onToggle: (id: string) => void
  onSearchChange: (v: string) => void
}

export function CharityPicker({
  charities,
  charityIds,
  charitySearch,
  onToggle,
  onSearchChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [dropdownWidth, setDropdownWidth] = useState(0)
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = charitySearch
    ? charities.filter((c) =>
        c.name.toLowerCase().includes(charitySearch.toLowerCase())
      )
    : charities

  const atMax = charityIds.length >= MAX_CHARITIES
  const selected = charities.filter((c) => charityIds.includes(c.id))

  function openDropdown() {
    if (anchorRef.current) {
      setDropdownWidth(anchorRef.current.getBoundingClientRect().width)
    }
    setOpen(true)
  }

  function handleBlur() {
    // Delay so clicks inside the popover register before closing
    setTimeout(() => setOpen(false), 150)
  }

  function handleToggle(id: string) {
    onToggle(id)
    onSearchChange("")
    inputRef.current?.focus()
  }

  // Clear search when closed
  useEffect(() => {
    if (!open) onSearchChange("")
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <SectionEyebrow variant="muted" className="font-semibold">
          Charity
        </SectionEyebrow>
        {charityIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {charityIds.length}/{MAX_CHARITIES}
          </p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div ref={anchorRef}>
            <input
              ref={inputRef}
              type="text"
              value={charitySearch}
              onChange={(e) => {
                onSearchChange(e.target.value)
                openDropdown()
              }}
              onFocus={openDropdown}
              onBlur={handleBlur}
              placeholder={
                atMax ? "Maximum charities selected" : "Select a charity…"
              }
              disabled={atMax}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </PopoverAnchor>

        <PopoverContent
          style={{ width: dropdownWidth || undefined }}
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-60 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No charities found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filtered.map((c) => {
                  const isSelected = charityIds.includes(c.id)
                  const disabled = !isSelected && atMax
                  return (
                    <Chip
                      key={c.id}
                      selected={isSelected}
                      disabled={disabled}
                      onMouseDown={(e) => {
                        // Prevent blur from firing before toggle
                        e.preventDefault()
                        handleToggle(c.id)
                      }}
                    >
                      {isSelected && (
                        <Check
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {c.name}
                    </Chip>
                  )
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onToggle(c.id)}
              className="h-auto rounded-full px-3 py-1.5 text-xs"
            >
              {c.name}
              <X
                className="ml-1 h-3 w-3 shrink-0"
                aria-label={`Remove ${c.name}`}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
