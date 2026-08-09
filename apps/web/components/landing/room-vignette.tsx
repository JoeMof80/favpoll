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
// The exemplar is a CELEBRATION — Jess's 30th, a dog-mad birthday — so the
// landing shows its range: the hero demo's featured scene is Belinda's
// memorial; the room is a party. Topic · charity · subject cohere the
// platonic way (dog lover → Favourite dog breed → Dogs Trust), the same
// teaching example as the About page's definition.
// Figures end on the landing's agreed numbers: £855 → £925 over £900.
// Reduced motion: the final frame (goal reached), static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { RankingBar } from "@/components/ui/ranking-bar"
import { formatPounds } from "@/lib/i18n"
import { Vignette } from "@/components/landing/vignette"

const MAX = 450
const GOAL = 900

// step 0: sheet idle · 1: £50 picked · 2: Pledge pressed · 3: confirmed —
// Raj's £50 lands on the display (crosses the goal) · 4: Amara's £20
// arrives on its own · hold → reset.
const STEP_MS = [1600, 1000, 350, 2600, 4600]
const LAST = STEP_MS.length - 1

// Display state per step: [Labrador, Cocker Spaniel, Border Terrier,
// Greyhound] bars + running total — the bars sum exactly to the total at
// every step.
const BARS: [number, number, number, number][] = [
  [350, 220, 165, 120],
  [350, 220, 165, 120],
  [350, 220, 165, 120],
  [350, 270, 165, 120], // Raj's £50 on Cocker Spaniel → £905, goal crossed
  [370, 270, 165, 120], // Amara's £20 on Labrador → £925
]
const TOTALS = [855, 855, 855, 905, 925]
const LABELS = [
  "Labrador",
  "Cocker Spaniel",
  "Border Terrier",
  "Greyhound",
] as const
const PRESETS = ["£5", "£10", "£20", "£50"] as const

export function RoomVignette() {
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
    // Same width as every other vignette (founder, 2026-08-09) — it was the
    // one section that sat wider, which read as a mistake rather than as
    // emphasis.
    //
    // Room made for the SCREEN rather than shared evenly (founder,
    // 2026-08-09). Narrowing the frame had shrunk both objects to keep them
    // apart, and the display came out 317 x 270 — the shape of a dialog, not
    // of a television, in the one section about putting favpoll on a
    // television. It now takes the width it needs (362 x 270) and the phone
    // gives it up, cropping at the frame's left edge — which is what a thing
    // in the near foreground does anyway.
    //
    // The frame supplies the crop, which is the part that matters: the phone
    // is absolutely positioned and taller than the stage on purpose, so
    // without overflow-hidden it spills out of whatever contains it.
    <Vignette bleed>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent"
      />
      <div className="relative px-6 py-10">
        {/* ONE STAGE, AUTHORED ONCE AND SCALED (2026-08-09). The display and
            the phone used to be sized independently against whatever width
            the frame happened to have, which worked at 1440 and buried the
            display under the phone at 390 — the whole scene fitted, so an
            overflow check passed, and only a screenshot showed the labels
            gone.
            The stage is now a fixed 624 x 352 room, and narrow frames scale
            the room rather than resize the furniture. The composition is
            therefore the same everywhere by construction, and there is one
            number per breakpoint to keep true instead of four. */}
        <div className="relative h-[165px] sm:h-[306px] md:h-[352px]">
          <div
            className="absolute top-0 left-0 h-[352px] w-[624px] origin-top-left scale-[0.47] sm:scale-[0.87] md:scale-100"
            aria-hidden="true"
          >
            {/* ── The display, in the distance ── */}
            <div
              className="absolute top-8 right-4 w-[28rem] [transform:perspective(900px)_rotateY(-20deg)_rotateX(1deg)] rounded-lg border-[6px] border-foreground/80 bg-background p-4 shadow-md"
              style={{ transformOrigin: "right center" }}
            >
              <p className="truncate text-[11px] font-medium tracking-widest text-primary uppercase">
                Jess&apos;s 30th birthday
              </p>

              {/* Telethon strip — value and status on their own fixed-height
              lines so the frame never resizes as the message changes (a real
              display doesn't grow). */}
              <div className="mt-1">
                <p className="text-2xl leading-tight font-medium text-foreground tabular-nums">
                  {formatPounds(total)}
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
                    : `of the ${formatPounds(GOAL)} goal`}
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
              <p className="mb-1.5 text-[11px] font-medium tracking-widest text-primary uppercase">
                Favourite Dog Breed
              </p>

              <div className="space-y-1.5 [&_span]:text-sm">
                {LABELS.map((label, i) => (
                  <RankingBar
                    key={label}
                    label={label}
                    amount={formatPounds(bars[i])}
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
            <div className="absolute -bottom-56 -left-6 h-[24rem] w-56 rounded-[3rem] border-[7px] border-foreground/80 bg-background shadow-2xl">
              {/* Side buttons */}
              <div className="absolute top-24 -left-[9px] h-8 w-[3px] rounded-full bg-foreground/80" />
              <div className="absolute top-36 -left-[9px] h-8 w-[3px] rounded-full bg-foreground/80" />
              <div className="absolute top-28 -right-[9px] h-12 w-[3px] rounded-full bg-foreground/80" />
              {/* Island */}
              <div className="absolute top-3 left-1/2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-foreground/80" />
              <div className="px-5 pt-12 pb-6">
                <p className="text-center text-[11px] font-medium tracking-widest text-primary uppercase">
                  Favourite dog breed
                </p>

                {!confirmed ? (
                  <>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Your favourite
                    </p>
                    <p className="mt-1 w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      Cocker Spaniel
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
                      £50 to Dogs Trust
                    </p>
                    <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
                      Jess&apos;s favourite is waiting for you
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
