"use client"

import { Button } from "@/components/ui/button"

export function AmountPresets({
  amounts,
  value,
  onChange,
}: {
  amounts: number[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      {amounts.map((amount) => {
        const active = value === String(amount)
        return (
          <Button
            key={amount}
            type="button"
            variant={active ? "default" : "ghost"}
            size="xs"
            onClick={() => onChange(String(amount))}
            className={`flex-1 rounded-md ${!active ? "bg-muted" : ""}`}
          >
            £{amount}
          </Button>
        )
      })}
    </div>
  )
}
