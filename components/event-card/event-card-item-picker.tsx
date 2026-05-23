"use client"

import { Chip } from "@/components/ui/chip"

type Item = {
  id: string
  label: string
}

type Props = {
  items: Item[]
  selectedId: string | null
  onSelect: (id: string, label: string) => void
}

export function EventCardItemPicker({ items, selectedId, onSelect }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose your favourite"
      className="flex flex-wrap gap-1.5 pt-0.5"
    >
      {items.map((item) => (
        <Chip
          key={item.id}
          role="radio"
          aria-checked={selectedId === item.id}
          selected={selectedId === item.id}
          onClick={() => onSelect(item.id, item.label)}
        >
          {item.label}
        </Chip>
      ))}
    </div>
  )
}
