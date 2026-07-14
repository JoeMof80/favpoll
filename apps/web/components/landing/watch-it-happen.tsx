"use client"

// The live section's artifact: a ROOM, in depth — the live display on the
// far wall (small, perspective-tilted, soft shadow) and a guest's iPhone in
// the foreground (large, hard shadow) making a pledge. The scripted loop:
// the phone picks £50 → Pledge presses → confirmation — and in the same
// beat the distant display reacts: the wall gains the pledge, the bar
// grows, and the running total crosses the £900 goal (the display's
// goal-as-milestone moment — the poll never stops at goal; the room just
// celebrates). A second guest's pledge then lands on its own, so the room
// reads as live rather than waiting for you.
// Figures end on the landing's agreed numbers: £855 → £925 over £900.
// Reduced motion: the final frame (goal reached), static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { RankingBar } from "@/components/ui/ranking-bar"

const GBP = (n: number) => `£${n}`
const MAX = 450
const GOAL = 900

// step 0: sheet idle · 1: £50 picked · 2: Pledge pressed · 3: confirmed —
// Raj's £50 lands on the display (crosses the goal) · 4: Amara's £20
// arrives on its own · hold → reset.
const STEP_MS = [1600, 1000, 350, 2600, 4600]
const LAST = STEP_MS.length - 1

const WALL_BASE: GuestWallEntry[] = [
  {
    id: "w-claire",
    name: "Claire",
    labels: ["Purple"],
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
]

// Display state per step: [Purple, Blue, Red] bars + running total.
const BARS: [number, number, number][] = [
  [350, 220, 165],
  [350, 220, 165],
  [350, 220, 165],
  [350, 270, 165], // Raj's £50 on Blue → £905, goal crossed
  [370, 270, 165], // Amara's £20 on Purple → £925
]
const TOTALS = [855, 855, 855, 905, 925]
const LABELS = ["Purple", "Blue", "Red"] as const
const PRESETS = ["£5", "£10", "£20", "£50"] as const

export function WatchItHappen() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced ? LAST : 0)

  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => setStep((s) => (s >= LAST ? 0 : s + 1)),
      STEP_MS[step]
    )
    return () => clearTimeout(id)
  }, [step, reduced])

  const bars = BARS[step]
  const total = TOTALS[step]
  const goalReached = total >= GOAL

  const wallEntries: GuestWallEntry[] = [
    ...(step >= 4
      ? [
          {
            id: "w-amara",
            name: "Amara",
            labels: ["Purple"],
            created_at: new Date().toISOString(),
          },
        ]
      : []),
    ...(step >= 3
      ? [
          {
            id: "w-raj",
            name: "Raj",
            labels: ["Blue"],
            created_at: new Date().toISOString(),
          },
        ]
      : []),
    ...WALL_BASE,
  ]

  const amountPicked = step >= 1
  const pledgePressed = step === 2
  const confirmed = step >= 3

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
      {/* Brief explanation — the room to its right acts it out */}
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Pair your favpoll with a real life occasion and watch it unfold live, on
        a large display, as guests pledge.
      </p>

      {/* The room: display on the far wall, a guest's phone in the near
          foreground. Depth = scale + perspective + shadow softness. */}
      <div
        className="relative h-96 overflow-hidden rounded-xl bg-primary/5"
        aria-hidden="true"
      >
        {/* Floor — grounds the scene */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/10 to-transparent" />

        {/* ── The display, in the distance ── */}
        <div
          className="absolute top-8 left-6 w-[58%] min-w-64 [transform:perspective(1200px)_rotateY(7deg)] rounded-lg border-[6px] border-foreground/75 bg-background p-4 shadow-md"
          style={{ transformOrigin: "left center" }}
        >
          <p className="truncate text-[9px] font-medium tracking-widest text-primary uppercase">
            In memory of Belinda Hartley
          </p>

          {/* Telethon strip: total vs goal (fixed-height line — no shift) */}
          <p className="mt-1 text-lg font-medium text-foreground">
            {GBP(total)}{" "}
            <span
              className={
                goalReached
                  ? "text-[10px] font-medium text-success"
                  : "text-[10px] font-normal text-muted-foreground"
              }
            >
              {goalReached
                ? "goal reached — every pledge still counts"
                : `of the ${GBP(GOAL)} goal`}
            </span>
          </p>
          <div className="mt-1 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${goalReached ? "bg-success" : "bg-primary"}`}
              style={{
                width: `${Math.min(100, (total / GOAL) * 100)}%`,
                transition: reduced ? "none" : "width 700ms ease-out",
              }}
            />
          </div>

          <div className="space-y-1.5">
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
                className="[&_span]:text-xs"
              />
            ))}
          </div>
        </div>

        {/* ── The guest wall, mid-distance beside the screen ── */}
        <div className="absolute top-10 right-3 hidden w-56 [transform:perspective(1200px)_rotateY(-6deg)_scale(0.92)] opacity-90 md:block lg:right-6">
          <GuestWall entries={wallEntries} animate maxEntries={3} />
        </div>

        {/* ── The phone, near — making the pledge ── */}
        <div className="absolute bottom-[-1.25rem] left-[54%] w-44 -translate-x-1/2 rounded-[2rem] border-[5px] border-foreground/80 bg-background shadow-2xl sm:left-[58%]">
          {/* Island */}
          <div className="absolute top-2 left-1/2 h-3.5 w-16 -translate-x-1/2 rounded-full bg-foreground/80" />
          <div className="px-3.5 pt-8 pb-6">
            <p className="text-center text-[9px] font-medium tracking-widest text-primary uppercase">
              Favourite colour
            </p>

            {!confirmed ? (
              <>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Your favourite
                </p>
                <p className="mt-1 w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  Blue
                </p>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Your pledge
                </p>
                <div className="mt-1 grid grid-cols-4 gap-1">
                  {PRESETS.map((p) => (
                    <span
                      key={p}
                      className={`rounded-md border px-1 py-1 text-center text-[11px] transition-colors ${
                        p === "£50" && amountPicked
                          ? "border-primary bg-secondary font-medium text-secondary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div
                  className={`mt-4 rounded-lg py-2 text-center text-xs font-medium transition-all ${
                    amountPicked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  } ${pledgePressed ? "scale-[0.97] brightness-95" : ""}`}
                >
                  Pledge{amountPicked ? " £50" : ""}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/15 text-success">
                  ✓
                </span>
                <p className="text-xs font-medium text-foreground">
                  £50 to Marie Curie
                </p>
                <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
                  Belinda&apos;s favourite is waiting for you
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
