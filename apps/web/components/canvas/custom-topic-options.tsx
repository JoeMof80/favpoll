"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InlineOptionInput } from "./inline-option-input"
import { RemovablePill } from "./removable-pill"

type Props = {
  items: string[]
  onAdd: (label: string) => void
  onRemove: (index: number) => void
}

export function CustomTopicOptions({ items, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")

  function save() {
    const label = draft.trim()
    if (!label) {
      setDraft("")
      setAdding(false)
      return
    }
    if (items.some((i) => i.toLowerCase() === label.toLowerCase())) {
      setError("This option already exists")
      return
    }
    onAdd(label)
    setDraft("")
    setError("")
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <RemovablePill key={i} label={item} onRemove={() => onRemove(i)} />
        ))}

        {adding ? (
          <div className="flex flex-col gap-1">
            <InlineOptionInput
              value={draft}
              onChange={(v) => {
                setDraft(v)
                setError("")
              }}
              onConfirm={save}
              onCancel={() => {
                setDraft("")
                setError("")
                setAdding(false)
              }}
            />
            {error && <p className="pl-3 text-xs text-destructive">{error}</p>}
          </div>
        ) : items.length < 10 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdding(true)}
            className="h-auto rounded-full border-dashed px-3 py-1.5 text-xs text-muted-foreground"
          >
            Add option
          </Button>
        ) : null}
      </div>

      {items.length < 2 && (
        <p className="text-xs text-muted-foreground">
          Add at least 2 options to continue
        </p>
      )}
    </div>
  )
}
