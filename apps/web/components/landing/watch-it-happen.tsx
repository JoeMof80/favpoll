"use client"

// The live section's artifact: the guest wall and the ranking bars moving
// TOGETHER, on a scripted loop — a pledge lands on the wall and its bar grows
// in the same beat. Uses the real GuestWall component (the same one the live
// display and favpoll page render), so the landing demos actual behaviour.
// Reduced motion: the final frame, static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { BrandedQR } from "@/components/branded-qr"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { RankingBar } from "@/components/ui/ranking-bar"

const GBP = (n: number) => `£${n}`
const MAX = 450 // fixed scale so bar growth reads as growth, not re-scaling

// Each beat: a wall arrival + the bar totals after it lands.
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

// Bar totals per step (step 0 = before any arrival): Purple, Blue, Red
const BARS: [number, number, number][] = [
  [350, 220, 165],
  [350, 290, 165], // Raj backs Blue
  [390, 290, 165], // Amara backs Purple
  [390, 290, 215], // Someone backs Red
]
const LABELS = ["Purple", "Blue", "Red"] as const

const BEAT_MS = 2600
const HOLD_MS = 3600

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

  return (
    <div className="grid items-center gap-6 md:grid-cols-2 lg:grid-cols-[1fr_auto_1.1fr_1.1fr]">
      {/* Brief explanation — the artifacts to its right act it out, in
          process order: scan → pledge lands on the wall → rankings move */}
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Pair your favpoll with a real life occasion and watch it unfold live, on
        a large display, as guests pledge.
      </p>

      {/* The way in — guests scan from the poster or table cards */}
      <div
        className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-4"
        aria-hidden="true"
      >
        <BrandedQR value="https://favpoll.com" size={88} />
        <p className="text-xs text-muted-foreground">scan to pledge</p>
      </div>

      {/* The wall — pledges landing. [&>div]:h-full stretches the card to
          match the display card so the loop never shifts layout. */}
      <div className="[&>div]:h-full" aria-hidden="true">
        <GuestWall entries={wallEntries} animate maxEntries={4} />
      </div>

      {/* The display — bars moving in the same beat */}
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
