"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  REGISTER_OPTIONS,
  OCCASION_TYPES_BY_REGISTER,
  DEFAULT_OCCASION_TYPE,
  type Register,
} from "@/lib/registers"

// Stable labels for the selected register chip
const REGISTER_CHIP_LABELS: Record<string, string> = {
  remembering: "In memory of someone",
  celebrating_one: "Celebrating a person",
  celebrating_many: "Celebrating a couple or group",
  cause: "Supporting a cause",
  neutral: "Other / open",
}

type Props = {
  register: string
  occasionType: string
  isPlural: boolean
  onRegisterChange: (register: string, occasionType: string | null) => void
  onIsPluralChange: (v: boolean) => void
  onClear: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OccasionOverlay({
  register,
  occasionType,
  isPlural,
  onRegisterChange,
  onIsPluralChange,
  onClear,
  open,
  onOpenChange,
}: Props) {
  const [typeInput, setTypeInput] = useState(occasionType)
  const suggested = register
    ? (OCCASION_TYPES_BY_REGISTER[register as Register] ?? [])
    : []

  // Sync typeInput when overlay opens with the current occasionType
  function handleOpenChange(o: boolean) {
    if (o) setTypeInput(occasionType)
    onOpenChange(o)
  }

  function handleRegisterSelect(reg: string, oType: string | null) {
    // When no specific occasion_type comes with the chip, fall back to the
    // register's default so headline and placeholders resolve to the same register.
    const resolvedOType =
      oType ?? DEFAULT_OCCASION_TYPE[reg as Register] ?? null
    onRegisterChange(reg, resolvedOType)
    setTypeInput(resolvedOType ?? "")
    // Derive is_plural from the selected register chip
    if (reg === "celebrating_many") {
      onIsPluralChange(true)
    } else if (reg === "celebrating_one") {
      onIsPluralChange(false)
    }
  }

  function handleTypeInput(v: string) {
    setTypeInput(v)
    onRegisterChange(register, v || null)
  }

  function handleTypeSelect(t: string) {
    setTypeInput(t)
    onRegisterChange(register, t)
  }

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
          {register && (
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
        {/* Register selection */}
        <div>
          <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            What kind of event?
          </p>
          <div className="flex flex-wrap gap-2">
            {REGISTER_OPTIONS.map((o) => (
              <Chip
                key={`${o.register}-${o.occasionType ?? "null"}`}
                size="lg"
                selected={
                  o.register === register &&
                  (o.occasionType === null || o.occasionType === occasionType)
                }
                onClick={() => handleRegisterSelect(o.register, o.occasionType)}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Plural switch — shown for celebrating registers */}
        {(register === "celebrating_one" ||
          register === "celebrating_many") && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
            <p className="text-sm font-medium">
              {isPlural ? "For a couple or group" : "For one person"}
            </p>
            <Switch checked={isPlural} onCheckedChange={onIsPluralChange} />
          </div>
        )}

        {/* Occasion type — shown only once a register is selected */}
        {register && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              What is it? <span className="opacity-60">(optional)</span>
            </p>
            <Input
              placeholder="e.g. Birthday, Retirement… (optional)"
              value={typeInput}
              maxLength={40}
              onChange={(e) => handleTypeInput(e.target.value)}
              className="bg-background placeholder:text-muted-foreground/50"
            />
            {suggested.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggested.map((t) => (
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
            )}
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  )
}

export { REGISTER_CHIP_LABELS }
