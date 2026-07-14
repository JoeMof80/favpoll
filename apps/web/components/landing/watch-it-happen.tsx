"use client"

// The live section's artifact: the guest wall and the ranking bars moving
// TOGETHER, on a scripted loop — a pledge lands on the wall, its bar grows,
// and the running total climbs the pledge goal in the same beat. The final
// arrival crosses the goal — the live display's goal-as-milestone moment
// (the poll never stops at goal; the room just celebrates). Uses the real
// GuestWall component (the same one the live display and favpoll page
// render), so the landing demos actual behaviour.
// Figures match the How It Works Watch card: £855 → £925 over a £900 goal.
// Reduced motion: the final frame (goal reached), static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { RankingBar } from "@/components/ui/ranking-bar"

const GBP = (n: number) => `£${n}`
const MAX = 450 // fixed scale so bar growth reads as growth, not re-scaling
const GOAL = 900

// Each beat: a wall arrival + the poll state after it lands.
const INITIAL_WALL: GuestWallEntry[] = [
  {
    id: "w-claire",
    name: "Claire",
    labels: ["Purple"],
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
]

const ARRIVALS: { entry: Omit<GuestWallEntry, "created_at"> }[] = [
  { entry: { id: "w-raj", name: "Raj", labels: ["Blue"] } },
  { entry: { id: "w-amara", name: "Amara", labels: ["Purple"] } },
  { entry: { id: "w-someone", name: null, labels: ["Red"] } },
]

// Per step (step 0 = before any arrival): bar totals + the running total.
// The last arrival tips the total over the £900 goal.
const BARS: [number, number, number][] = [
  [350, 220, 165],
  [350, 235, 165], // Raj backs Blue (+£15 → £870)
  [370, 235, 165], // Amara backs Purple (+£20 → £890)
  [370, 235, 200], // Someone backs Red (+£35 → £925 — goal reached)
]
const TOTALS = [855, 870, 890, 925]
const LABELS = ["Purple", "Blue", "Red"] as const

const BEAT_MS = 2600
const HOLD_MS = 4200

export function WatchItHappen() {
  const reduced = useReducedMotion()
  const lastStep = ARRIVALS.length
  const [step, setStep] = useState(reduced ? lastStep : 0)

  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => setStep((s) => (s >= lastStep ? 0 : s + 1)),
      step === lastStep ? HOLD_MS : BEAT_MS
    )
    return () => clearTimeout(id)
  }, [step, reduced, lastStep])

  const wallEntries: GuestWallEntry[] = [
    ...ARRIVALS.slice(0, step)
      .map(({ entry }) => ({
        ...entry,
        created_at: new Date().toISOString(),
      }))
      .reverse(),
    ...INITIAL_WALL,
  ]
  const bars = BARS[step]
  const total = TOTALS[step]
  const goalReached = total >= GOAL

  return (
    <div className="grid items-center gap-6 md:grid-cols-3 lg:grid-cols-[1fr_1.1fr_1.1fr]">
      {/* Brief explanation — the artifacts to its right act it out:
          a pledge lands on the wall → the rankings and goal move */}
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Pair your favpoll with a real life occasion and watch it unfold live, on
        a large display, as guests pledge.
      </p>

      {/* The wall — pledges landing. [&>div]:h-full stretches the card to
          match the display card so the loop never shifts layout. */}
      <div className="[&>div]:h-full" aria-hidden="true">
        <GuestWall entries={wallEntries} animate maxEntries={4} />
      </div>

      {/* The display — the pledge goal and the bars moving in the same beat */}
      <div
        className="h-full space-y-2 rounded-lg border border-border bg-card px-5 py-4"
        aria-hidden="true"
      >
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-primary uppercase">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Live display
        </p>

        {/* The telethon strip: running total against the goal; the last
            arrival crosses it and the display celebrates (fixed-height
            line so the loop never shifts layout). */}
        <div className="border-b border-border pb-2.5">
          <p className="text-lg font-medium text-foreground">
            {GBP(total)}{" "}
            <span
              className={
                goalReached
                  ? "text-xs font-medium text-success"
                  : "text-xs font-normal text-muted-foreground"
              }
            >
              {goalReached
                ? "goal reached — every pledge still counts"
                : `of the ${GBP(GOAL)} goal`}
            </span>
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${goalReached ? "bg-success" : "bg-primary"}`}
              style={{
                width: `${Math.min(100, (total / GOAL) * 100)}%`,
                transition: reduced ? "none" : "width 700ms ease-out",
              }}
            />
          </div>
        </div>

        {LABELS.map((label, i) => (
          <RankingBar
            key={label}
            label={label}
            amount={GBP(bars[i])}
            widthPercent={Math.round((bars[i] / MAX) * 100)}
            barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
            barStyle={{
              transition: reduced ? "none" : "width 700ms ease-out",
            }}
          />
        ))}
      </div>
    </div>
  )
}
