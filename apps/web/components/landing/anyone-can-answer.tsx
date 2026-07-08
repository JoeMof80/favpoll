import { RankingBar } from "@/components/ui/ranking-bar"

// One point, one artifact: universal topics mean nobody is left out — and
// when the crowd is an in-group, the whole question and answer list can be
// custom (the meeting-room mock). The hero demo already showcases the
// built-in topics, so the custom favpoll is the new information here.

const CUSTOM_BARS = [
  ["The fishbowl", "£45", 75],
  ["Third-floor corner", "£30", 50],
  ["The one with the sofa", "£25", 42],
] as const

export function AnyoneCanAnswer() {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Colour, season, biscuit — the built-in questions need no expertise, so
        everyone takes part as equals. Or write your own question and answers,
        for an office, a club, a family.
      </p>

      {/* Mini custom-poll mock */}
      <div
        className="space-y-2 rounded-xl border border-border bg-background p-5"
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
  )
}
