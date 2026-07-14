"use client"

// The live section's artifact: the REAL live display page in miniature — the
// telethon banner (identity lower-third, the big total against the pledge
// goal, the QR as the room's call to action) with the rankings and guest wall
// beneath, inside the browser-style demo frame. A scripted loop lands each
// pledge on the wall, grows its bar, and ticks the total up the goal bar —
// the final arrival crosses the goal, the display's goal-as-milestone moment
// (the poll never stops at goal; the room just celebrates).
// Figures match the How It Works Watch card: £855 → £925 over a £900 goal.
// Reduced motion: the final frame (goal reached), static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { BrandedQR } from "@/components/branded-qr"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
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
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
      {/* Brief explanation — the display to its right acts it out */}
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Pair your favpoll with a real life occasion and watch it unfold live, on
        a large display, as guests pledge.
      </p>

      {/* The live display page in miniature, in the demo browser frame */}
      <div aria-hidden="true">
        <div className="flex h-9 shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-muted px-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="flex-1 text-center text-xs text-muted-foreground">
            favpoll.com/live · demo
          </span>
          <span className="w-9" />
        </div>
        <div className="rounded-b-xl border border-border bg-background p-5 shadow-lg">
          {/* ── Telethon banner: identity line, then the action row ── */}
          <div className="border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-3 border-b border-border pb-3">
              <div className="origin-left scale-[0.6]">
                <ProtagonistAvatar
                  name="Belinda Hartley"
                  photoUrl="/demo/belinda.jpg"
                />
              </div>
              <div className="-ml-4 min-w-0">
                <p className="truncate text-[10px] font-medium tracking-widest text-primary uppercase">
                  In memory of
                </p>
                <p className="truncate text-xl font-medium tracking-tight text-foreground">
                  Belinda Hartley
                </p>
              </div>
            </div>

            {/* Action row: goal progress + the room's QR */}
            <div className="flex items-stretch gap-5 pt-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
                    Pledge goal
                  </p>
                  {goalReached && (
                    <p className="text-xs font-medium text-success">
                      Goal reached — every further pledge still counts
                    </p>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                  <p className="text-2xl font-medium text-foreground">
                    {GBP(total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {GBP(GOAL)}
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                      goalReached ? "bg-success" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(100, (total / GOAL) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center justify-center gap-1">
                <BrandedQR value="https://favpoll.com" size={64} />
                <p className="text-[10px] text-muted-foreground">
                  scan to pledge
                </p>
              </div>
            </div>
          </div>

          {/* ── Below the banner: rankings + the wall, moving in one beat ── */}
          <div className="grid gap-5 pt-4 sm:grid-cols-[1.2fr_1fr]">
            <div className="space-y-2.5">
              {LABELS.map((label, i) => (
                <RankingBar
                  key={label}
                  label={label}
                  amount={GBP(bars[i])}
                  widthPercent={(bars[i] / MAX) * 100}
                  barClassName="transition-all duration-700 ease-out"
                />
              ))}
            </div>
            <div className="[&>div]:h-full">
              <GuestWall entries={wallEntries} animate maxEntries={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
