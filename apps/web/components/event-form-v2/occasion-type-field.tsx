"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { OCCASION_TYPES_BY_REGISTER, type Register } from "@/lib/registers"
import { cn } from "@/lib/utils"
import { INPUT_SIZE, type PickerSize } from "./constants"

type Props = {
  register: string
  value: string
  onChange: (v: string) => void
  size?: PickerSize
}

export function OccasionTypeField({
  register,
  value,
  onChange,
  size = "md",
}: Props) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [popoverWidth, setPopoverWidth] = useState(0)

  const suggested = OCCASION_TYPES_BY_REGISTER[register as Register] ?? []

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleSelect(v: string) {
    setInputValue(v)
    onChange(v)
    setOpen(false)
  }

  function handleInputChange(v: string) {
    setInputValue(v)
    onChange(v)
    if (!open && v) setOpen(true)
  }

  // Sync when value changes externally (e.g. register change resets it)
  if (value !== inputValue && !open) {
    setInputValue(value)
  }

  return (
    <Popover open={open && suggested.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={anchorRef}>
          <Input
            className={cn(
              INPUT_SIZE[size],
              "bg-background placeholder:text-muted-foreground/50"
            )}
            placeholder="e.g. Birthday, Retirement… (optional)"
            value={inputValue}
            maxLength={40}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={openDropdown}
            onBlur={() => setOpen(false)}
          />
        </div>
      </PopoverAnchor>
      {suggested.length > 0 && (
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
            className="max-h-48 overflow-y-auto p-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((t) => (
                <Chip
                  key={t}
                  selected={t === value}
                  size={size}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(t)
                  }}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
