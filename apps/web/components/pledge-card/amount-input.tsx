"use client"

import type { FavpollCardSize } from "@/components/favpoll-card/types"

export function AmountInput({
  id,
  value,
  onChange,
  size = "lg",
}: {
  id: string
  value: string
  onChange: (v: string) => void
  size?: FavpollCardSize
}) {
  const symbolClass =
    size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-sm"
  const inputClass =
    size === "lg"
      ? "py-3 pl-8 text-2xl"
      : size === "md"
        ? "py-2 pl-7 text-xl"
        : "py-1.5 pl-6 text-base"

  return (
    <div className="relative mt-2">
      <span
        className={`pointer-events-none absolute inset-y-0 left-3 flex items-center ${symbolClass} text-muted-foreground`}
        aria-hidden="true"
      >
        £
      </span>
      <input
        id={id}
        type="number"
        min="0.01"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border border-input bg-background pr-3 ${inputClass} font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none`}
        placeholder="0"
      />
    </div>
  )
}
