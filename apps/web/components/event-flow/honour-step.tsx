"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  OCCASION_TYPES_BY_REGISTER,
  registerForOccasionType,
  type Register,
} from "@/lib/registers"

const OCCASION_GROUP_ORDER: { register: Register; label: string }[] = [
  { register: "celebrating_one", label: "Celebrating a person" },
  { register: "celebrating_many", label: "Celebrating a couple or group" },
  { register: "remembering", label: "In memory of someone" },
  { register: "cause", label: "Supporting a cause" },
]

type HonourStepProps = {
  value: { occasionType: string; isPlural: boolean }
  onChange: (v: { occasionType: string; isPlural: boolean }) => void
}

export function HonourStep({ value, onChange }: HonourStepProps) {
  const [typeInput, setTypeInput] = useState(value.occasionType)

  const derivedRegister = registerForOccasionType(value.occasionType || null)
  const showSwitch = derivedRegister === "celebrating_one"

  function handleTypeInput(v: string) {
    setTypeInput(v)
    const reg = registerForOccasionType(v || null)
    const autoPlural = reg === "celebrating_many"
    onChange({ occasionType: v, isPlural: autoPlural ? true : value.isPlural })
  }

  function handleTypeSelect(t: string) {
    setTypeInput(t)
    const reg = registerForOccasionType(t)
    const autoPlural = reg === "celebrating_many"
    onChange({ occasionType: t, isPlural: autoPlural ? true : false })
  }

  return (
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
                  selected={t === value.occasionType}
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
            {value.isPlural ? "For a couple or group" : "For one person"}
          </p>
          <Switch
            checked={value.isPlural}
            onCheckedChange={(v) =>
              onChange({ occasionType: value.occasionType, isPlural: v })
            }
          />
        </div>
      )}
    </div>
  )
}
