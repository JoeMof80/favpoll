import { Chip } from "@/components/ui/chip"

type PollOptionsProps = {
  options: { label: string }[]
  selectedLabel?: string
  locked?: boolean
  topicTitle?: string
}

export function PollOptions({
  options,
  selectedLabel,
  locked = false,
  topicTitle,
}: PollOptionsProps) {
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
          key={opt.label}
          selected={opt.label === selectedLabel}
          role="radio"
          aria-checked={opt.label === selectedLabel}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  )
}
