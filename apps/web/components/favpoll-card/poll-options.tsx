import { Chip } from "@/components/ui/chip"

type PollOptionsProps = {
  options: { id: string; label: string }[]
  selectedItemId?: string | null
  locked?: boolean
  topicTitle?: string
}

export function PollOptions({
  options,
  selectedItemId,
  locked = false,
  topicTitle,
}: PollOptionsProps) {
  const selectedLabel = options.find((o) => o.id === selectedItemId)?.label

  if (locked) {
    return (
      <div className="flex flex-wrap gap-2">
        {selectedLabel && (
          <Chip selected disabled>
            {selectedLabel}
          </Chip>
        )}
      </div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={`Choose your favourite ${topicTitle ?? "option"}`}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => (
        <Chip
          key={opt.id}
          selected={opt.id === selectedItemId}
          role="radio"
          aria-checked={opt.id === selectedItemId}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  )
}
