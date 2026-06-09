"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  OCCASION_TYPES_BY_REGISTER,
  registerForOccasionType,
  isPluralByDefault,
  type Register,
} from "@/lib/registers"

const OCCASION_GROUP_ORDER: { register: Register; label: string }[] = [
  { register: "celebrating_one", label: "Celebrating a person" },
  { register: "celebrating_many", label: "Celebrating a couple or group" },
  { register: "remembering", label: "In memory of someone" },
  { register: "cause", label: "Supporting a cause" },
]

type Props = {
  occasionType: string
  isPlural: boolean
  onOccasionChange: (occasionType: string) => void
  onIsPluralChange: (v: boolean) => void
  onClear: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OccasionOverlay({
  occasionType,
  isPlural,
  onOccasionChange,
  onIsPluralChange,
  onClear,
  open,
  onOpenChange,
}: Props) {
  const [typeInput, setTypeInput] = useState(occasionType)

  function handleOpenChange(o: boolean) {
    if (o) setTypeInput(occasionType)
    onOpenChange(o)
  }

  function handleTypeInput(v: string) {
    setTypeInput(v)
    onOccasionChange(v)
  }

  function handleTypeSelect(t: string) {
    setTypeInput(t)
    onOccasionChange(t)
  }

  const derivedRegister = registerForOccasionType(occasionType || null)
  const showSwitch = derivedRegister === "celebrating_one"

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={handleOpenChange}
      title="Occasion"
      description="What is this event for?"
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
          {occasionType && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onClear()
                onOpenChange(false)
              }}
            >
              Clear
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Free-text input — always shown */}
        <div>
          <Input
            placeholder="e.g. Birthday, Retirement… (optional)"
            value={typeInput}
            maxLength={40}
            onChange={(e) => handleTypeInput(e.target.value)}
            className="bg-background placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Grouped occasion chips */}
        {OCCASION_GROUP_ORDER.map(({ register, label }) => {
          const types = OCCASION_TYPES_BY_REGISTER[register] ?? []
          if (types.length === 0) return null
          return (
            <div key={register}>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <Chip
                    key={t}
                    size="md"
                    selected={t === occasionType}
                    onClick={() => handleTypeSelect(t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          )
        })}

        {/* Plural switch — shown only for celebrating_one occasions */}
        {showSwitch && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
            <p className="text-sm font-medium">
              {isPlural ? "For a couple or group" : "For one person"}
            </p>
            <Switch checked={isPlural} onCheckedChange={onIsPluralChange} />
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  )
}
