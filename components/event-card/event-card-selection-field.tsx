"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/i18n"

type Props = {
  selectedItemLabel: string | null
  amount: number | null // pounds
  isOpen: boolean
  onClick: () => void
}

export function EventCardSelectionField({
  selectedItemLabel,
  amount,
  isOpen,
  onClick,
}: Props) {
  const hasItem = selectedItemLabel !== null
  const hasAmount = amount !== null

  function buildChipText() {
    if (!hasItem) return null
    const allocation = "100%"
    if (!hasAmount) return `${selectedItemLabel} · ${allocation}`
    return `${selectedItemLabel} · ${allocation} · ${formatCurrency(amount * 100)}`
  }

  const chipText = buildChipText()
  const Chevron = isOpen ? ChevronUp : ChevronDown

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={chipText ?? "Select a favourite"}
      className="flex h-auto w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5 text-left font-normal hover:bg-background hover:border-[#AFA9EC] focus-visible:ring-1 focus-visible:ring-[#534AB7]"
    >
      {chipText ? (
        <span className="truncate text-sm font-medium text-[#534AB7]">
          {chipText}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          Select a favourite…
        </span>
      )}
      <Chevron
        className="ml-2 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Button>
  )
}
