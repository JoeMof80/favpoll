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
import { RankingBar } from "@/components/ui/ranking-bar"

const GBP = (n: number) => `£${n}`
const MAX = 450
const GOAL = 900

// step 0: sheet idle · 1: £50 picked · 2: Pledge pressed · 3: confirmed —
// Raj's £50 lands on the display (crosses the goal) · 4: Amara's £20
// arrives on its own · hold → reset.
const STEP_MS = [1600, 1000, 350, 2600, 4600]
const LAST = STEP_MS.length - 1

// Display state per step: [Purple, Blue, Red, Green] bars + running total —
// the bars sum exactly to the total at every step.
const BARS: [number, number, number, number][] = [
  [350, 220, 165, 120],
  [350, 220, 165, 120],
  [350, 220, 165, 120],
  [350, 270, 165, 120], // Raj's £50 on Blue → £905, goal crossed
  [370, 270, 165, 120], // Amara's £20 on Purple → £925
]
const TOTALS = [855, 855, 855, 905, 925]
const LABELS = ["Purple", "Blue", "Red", "Green"] as const
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

  const amountPicked = step >= 1
  const pledgePressed = step === 2
  const confirmed = step >= 3

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      {/* Heading + brief explanation — the room to its right acts it out */}
      <div className="max-w-md">
        <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
          Watch it live
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Pair your favpoll with a real life occasion and watch it unfold live,
          on a large display, as guests pledge.
        </p>
      </div>

      {/* The stage: display on the far wall, a guest's phone in the near
          foreground. The section itself is the room (tint + floor gradient
          + crop edge live on the #watch section wrapper). */}
      <div className="relative h-[22rem]" aria-hidden="true">
        {/* ── The display, in the distance ── */}
        <div
          className="absolute top-10 right-6 w-80 [transform:perspective(900px)_rotateY(-20deg)_rotateX(1deg)] rounded-lg border-[6px] border-foreground/80 bg-background p-4 shadow-md"
          style={{ transformOrigin: "right center" }}
        >
          <p className="truncate text-[10px] font-medium tracking-widest text-primary uppercase">
            In memory of Belinda Hartley
          </p>

          {/* Telethon strip — value and status on their own fixed-height
              lines so the frame never resizes as the message changes (a real
              display doesn't grow). */}
          <div className="mt-1">
            <p className="text-xl leading-tight font-medium text-foreground tabular-nums">
              {GBP(total)}
            </p>
            <p
              className={`truncate text-xs leading-tight ${
                goalReached
                  ? "font-medium text-success"
                  : "font-normal text-muted-foreground"
              }`}
            >
              {goalReached
                ? "goal reached — every pledge still counts"
                : `of the ${GBP(GOAL)} goal`}
            </p>
          </div>
          <div className="mt-1.5 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${goalReached ? "bg-success" : "bg-primary"}`}
              style={{
                width: `${Math.min(100, (total / GOAL) * 100)}%`,
                transition: reduced ? "none" : "width 700ms ease-out",
              }}
            />
          </div>

          {/* Topic heading — labels the bars, as the guest/live page does */}
          <p className="mb-1.5 text-[10px] font-medium tracking-widest text-primary uppercase">
            Favourite Colour
          </p>

          <div className="space-y-1.5 [&_span]:text-xs">
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

        {/* ── The phone, near — making the pledge. Cropped at the scene
            edge (only the top matters); side buttons + island for realism. */}
        <div className="absolute -bottom-56 left-[7%] h-[26rem] w-60 rounded-[3rem] border-[7px] border-foreground/80 bg-background shadow-2xl">
          {/* Side buttons */}
          <div className="absolute top-24 -left-[9px] h-8 w-[3px] rounded-full bg-foreground/80" />
          <div className="absolute top-36 -left-[9px] h-8 w-[3px] rounded-full bg-foreground/80" />
          <div className="absolute top-28 -right-[9px] h-12 w-[3px] rounded-full bg-foreground/80" />
          {/* Island */}
          <div className="absolute top-3 left-1/2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-foreground/80" />
          <div className="px-5 pt-12 pb-6">
            <p className="text-center text-[11px] font-medium tracking-widest text-primary uppercase">
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
