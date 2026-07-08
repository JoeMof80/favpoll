import { Users, PenLine } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { RankingBar } from "@/components/ui/ranking-bar"

// The organiser's "will my guests get it?" anxiety, answered: universal topics
// mean nobody is left out — and when the crowd is an in-group, the whole
// question and answer list can be custom. Mirrors InTheRoom's two-card grid.

const UNIVERSAL_TOPICS = [
  "Colour",
  "Season",
  "Biscuit",
  "Song",
  "Film",
  "Animal",
  "Ice cream",
  "Flower",
  "Drink",
]

const CUSTOM_BARS = [
  ["The fishbowl", "£45", 75],
  ["Third-floor corner", "£30", 50],
  ["The one with the sofa", "£25", 42],
] as const

export function AnyoneCanAnswer() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Universal by default */}
      <div className="flex flex-col rounded-xl border border-border bg-background p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            Universal by default
          </h3>
        </div>
        <p className="mb-5 text-base leading-relaxed text-muted-foreground">
          The best questions need no expertise and have no wrong answers — a
          grandmother and a grandson take part as equals, and nobody is left
          out.
        </p>
        <ul
          className="mt-auto flex flex-wrap gap-2"
          aria-label="Universal topics"
        >
          {UNIVERSAL_TOPICS.map((topic) => (
            <li key={topic} className="list-none">
              <Chip readOnly size="lg">
                {topic}
              </Chip>
            </li>
          ))}
        </ul>
      </div>

      {/* Custom when you want it */}
      <div className="flex flex-col rounded-xl border border-border bg-background p-5">
        <div className="mb-3 flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            Custom when you want it
          </h3>
        </div>
        <p className="mb-5 text-base leading-relaxed text-muted-foreground">
          Or make it entirely yours — your own question, your own answers. An
          office votes on its favourite meeting room; a club on its greatest
          ever kit.
        </p>

        {/* Mini custom-poll mock */}
        <div
          className="mt-auto space-y-2 rounded-lg border border-border bg-muted/40 p-4"
          aria-hidden="true"
        >
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Favourite meeting room
          </p>
          {CUSTOM_BARS.map(([label, amount, width], i) => (
            <RankingBar
              key={label}
              label={label}
              amount={amount}
              widthPercent={width}
              barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
