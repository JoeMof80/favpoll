"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  MAX_CHARITIES,
  type PickerSize,
} from "./constants"

export function CharityField({
  charities,
  value,
  onChange,
  size = "md",
}: {
  charities: Charity[]
  value: string[]
  onChange: (ids: string[]) => void
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atMax = value.length >= MAX_CHARITIES
  const selected = charities.filter((c) => value.includes(c.id))

  const visible = charities.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else if (!atMax) {
      onChange([...value, id])
      setSearch("")
      inputRef.current?.focus()
    }
  }

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-end">
        {value.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{MAX_CHARITIES}
          </span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            className={cn(CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE[size])}
            onClick={() => inputRef.current?.focus()}
          >
            {selected.map((c) => (
              <Chip
                key={c.id}
                selected
                size={size}
                className="gap-1"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle(c.id)
                }}
                aria-label={`Remove ${c.name}`}
              >
                {c.name}
              </Chip>
            ))}
            {!atMax && (
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  if (!open) openDropdown()
                }}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Delete" || e.key === "Backspace") &&
                    !search &&
                    value.length > 0
                  ) {
                    e.preventDefault()
                    onChange(value.slice(0, -1))
                  }
                }}
                onFocus={openDropdown}
                onBlur={handleBlur}
                placeholder={
                  selected.length === 0 ? "Select a charity…" : "Add another…"
                }
                className={cn(
                  "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50",
                  CHIP_IN_INPUT_TEXT[size]
                )}
              />
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          style={{ width: popoverWidth || undefined }}
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) {
              e.preventDefault()
            }
          }}
        >
          <div
            className="max-h-60 overflow-y-auto p-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            {visible.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No results.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {visible.map((c) => (
                  <Chip
                    key={c.id}
                    selected={value.includes(c.id)}
                    size={size}
                    disabled={!value.includes(c.id) && atMax}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      toggle(c.id)
                    }}
                  >
                    {c.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
