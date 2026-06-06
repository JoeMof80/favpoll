"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { REGISTER_OPTIONS } from "@/lib/registers"
import { cn } from "@/lib/utils"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  type PickerSize,
} from "./constants"

// Stable labels for the selected chip — not tied to the occasionType preset
const REGISTER_CHIP_LABELS: Record<string, string> = {
  remembering: "In memory of someone",
  celebrating_one: "Celebrating a person",
  celebrating_many: "Celebrating a couple or group",
  cause: "Supporting a cause",
  neutral: "Other / open",
}

type Props = {
  register: string
  onChange: (register: string, occasionType: string | null) => void
  onClear: () => void
  size?: PickerSize
}

export function RegisterPickerField({
  register,
  onChange,
  onClear,
  size = "md",
}: Props) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const anchorRef = useRef<HTMLDivElement>(null)

  const chipLabel = register ? (REGISTER_CHIP_LABELS[register] ?? null) : null

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleSelect(reg: string, oType: string | null) {
    onChange(reg, oType)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            CHIP_IN_INPUT,
            CHIP_IN_INPUT_SIZE[size],
            "cursor-pointer select-none"
          )}
          onClick={openDropdown}
        >
          {chipLabel ? (
            <Chip
              selected
              size={size}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClear()
              }}
              aria-label={`Clear ${chipLabel}`}
            >
              {chipLabel}
            </Chip>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 text-muted-foreground/50",
                CHIP_IN_INPUT_TEXT[size]
              )}
            >
              Select occasion
            </span>
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
          <div className="flex flex-wrap gap-1.5">
            {REGISTER_OPTIONS.map((o) => (
              <Chip
                key={`${o.register}-${o.occasionType ?? "null"}`}
                selected={
                  o.register === register && o.occasionType === null
                    ? register === o.register
                    : false
                }
                size={size}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(o.register, o.occasionType)
                }}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
