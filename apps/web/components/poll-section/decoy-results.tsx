import type { Favourite } from "@favpoll/types"

type Props = {
  items: Favourite[]
  topicTitle: string
}

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

export function DecoyResults({ items, topicTitle }: Props) {
  // Sort alphabetically to avoid leaking real ranking order
  const sorted = [...items]
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 5)

  const decoyReveal = `${topicTitle} — pledge to see ${topicTitle.toLowerCase()}'s reveal`

  return (
    <div aria-hidden="true" tabIndex={-1}>
      {/* Fake reveal card */}
      <div className="mb-4 rounded-lg border border-[#AFA9EC] bg-[#EEEDFE] px-4 py-3">
        <p className="text-sm text-[#26215C] italic">{decoyReveal}</p>
      </div>

      {/* Fake ranking bars */}
      <ul role="list" aria-label="Results" className="space-y-3" tabIndex={-1}>
        {sorted.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-sm text-[#5F5E5A]">
              {item.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#EEEDFE]">
              <div
                className="h-full rounded-full bg-[#7F77DD]"
                style={{ width: `${DECOY_WIDTHS[i] ?? 10}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
