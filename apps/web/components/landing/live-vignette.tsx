"use client"

// The live section's artefact: a pledge landing and the goal moving in the
// SAME BEAT — which is the one thing this section claims and the one thing
// its previous artefact could not show.
//
// WHY THE ROOM WENT (founder, 2026-08-19: "we need to emphasise the real time
// effect of the pledge landing and the goal updating simultaneously", and
// before that "maybe this is the wrong vignette").
//
// The room had two jobs and they fought. "On a big screen in a room" needs
// distance and perspective, so the display was drawn small and tilted on a far
// wall; "watch it change as pledges land" needs the numbers legible. The stage
// was authored at 624 x 352 and scaled 0.47 at base, so the display's 10px
// labels rendered at 4.3px on a phone — measured. The room won and the
// real-time effect was invisible, which is why nobody noticed the wall
// promised in that file's header had never been built.
//
// A callout magnifying the wall beside the room was tried first and rejected:
// it bolted legibility onto the side of the problem rather than removing it.
//
// So the screen is CROPPED rather than shrunk — the same move the keepsake and
// the print pack landed on the day before. Show the part that carries the
// beat, at a size it can be read, instead of the whole object at a size it
// cannot. The bezel keeps "this is on a display"; the depth of field is what
// the section could not afford.
//
// The phone stays because simultaneity needs two ends, but it is the CAUSE and
// the screen is the subject — which also fixes an old inversion, since the
// section is called Live display and the phone used to be the larger object.
//
// The wall is not here. The founder asked for it, then named the goal as the
// real point; one frame carrying both ideas is how the last one failed. It is
// covered in the section's bullets instead.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { formatPounds } from "@/lib/i18n"
import { Vignette } from "@/components/landing/vignette"

const GOAL = 900

// 0: idle · 1: Pledge pressed · 2: it lands — £905, goal crossed · 3: someone
// else's £20 arrives on its own, so the screen reads as live rather than as
// waiting for you · hold → reset.
const STEP_MS = [1500, 380, 2600, 2800]
const LAST = STEP_MS.length - 1
const TOTALS = [855, 855, 905, 925]

// The wall, ON the screen — which is where it lives in the product, and what
// gives the screen enough to hold. Rows arrive with the money: Raj's with his
// £50 on the beat the goal is crossed, then Amara's on its own.
const WALL = [
  { name: "Priya", label: "Labrador" },
  { name: "Raj", label: "Cocker Spaniel" },
  { name: "Amara", label: "Labrador" },
] as const
const WALL_VISIBLE = [1, 1, 2, 3]

export function LiveVignette() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced ? 2 : 0)

  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => setStep((s) => (s >= LAST ? 0 : s + 1)),
      STEP_MS[step]
    )
    return () => clearTimeout(id)
  }, [step, reduced])

  const total = TOTALS[step]
  const reached = total >= GOAL
  const pressed = step === 1
  const pct = Math.min(100, (total / GOAL) * 100)

  return (
    <Vignette>
      <div
        aria-hidden="true"
        className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6"
      >
        {/* THE CAUSE. Cropped to the moment — the amount already chosen and
            the button about to go — because the picking is step three's job
            on this page, not this artefact's. */}
        <div className="w-[92px] shrink-0 rounded-[1.1rem] border-4 border-foreground/80 bg-background p-2 shadow-sm sm:w-[116px]">
          {/* A speaker bar and a very round bezel, against the screen's square
              corners and its stand. Without the two cues these were a pair of
              rounded rectangles of similar weight, and the section is called
              Live DISPLAY — the reader has to be able to tell which is the
              screen. */}
          <div className="mx-auto mb-1.5 h-1 w-6 rounded-full bg-foreground/25" />
          <p className="text-center text-[10px] text-muted-foreground">
            Your pledge
          </p>
          <p className="mt-0.5 text-center text-lg font-medium sm:text-xl">
            £50
          </p>
          <div
            className={`mt-2 rounded-md py-1.5 text-center text-[11px] font-medium transition-all duration-200 ${
              step >= 2
                ? "bg-success/15 text-success"
                : "bg-primary text-primary-foreground"
            } ${pressed ? "scale-[0.96] brightness-95" : ""}`}
          >
            {step >= 2 ? "Sent" : "Pledge"}
          </div>
        </div>

        {/* The beat travelling between them. It is the only thing in the frame
            that says the two are one event rather than two pictures. */}
        <div className="flex shrink-0 items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition-all duration-300 ${
                step >= 1
                  ? "bg-primary opacity-100"
                  : "bg-primary/30 opacity-40"
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            />
          ))}
        </div>

        {/* THE SUBJECT — the screen. Capped rather than flex-1: left to fill
            the frame it stretched to ~900px against four lines of content and
            came out a letterbox with a stand under it, which is what the
            founder saw ("this looks ridiculous"). A screen is a shape, not
            whatever width is going spare. */}
        <div className="w-full min-w-0 sm:max-w-[420px] sm:flex-1">
          <div className="rounded-md border-[5px] border-foreground/80 bg-background p-3 shadow-md sm:p-4">
            <p className="text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
              Pledge goal
            </p>
            <p className="mt-1 flex items-baseline gap-1.5">
              {/* tabular-nums so the number does not jitter its own width as
                  it ticks — the movement should read as the total changing,
                  not as the layout twitching. */}
              <span className="text-2xl font-medium tabular-nums sm:text-3xl">
                {formatPounds(total)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                of {formatPounds(GOAL)}
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  reached ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p
              className={`mt-1.5 text-[10px] transition-colors duration-300 ${
                reached ? "text-success" : "text-muted-foreground"
              }`}
            >
              {reached
                ? "Goal reached — every pledge still counts"
                : "Updating as pledges land"}
            </p>

            <div className="mt-3 border-t border-border pt-2.5">
              <p className="text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
                Wall of favourites
              </p>
              {/* HEIGHT RESERVED FOR THREE. The rows arrive one at a time, so
                  without a floor the screen grew 38px mid-loop and shunted the
                  whole page down every cycle — measured, vignette 414 -> 452
                  at 390. A feed that pushes the article about is worse than a
                  little empty space in a screen that is filling up. */}
              <div className="mt-1.5 flex min-h-[54px] flex-col gap-1">
                {WALL.slice(0, WALL_VISIBLE[step])
                  .slice()
                  .reverse()
                  .map((row, i) => (
                    <p
                      key={row.name}
                      className={`text-[11px] leading-snug transition-opacity duration-500 ${
                        i === 0 && step >= 2
                          ? "text-foreground opacity-100"
                          : "text-muted-foreground opacity-70"
                      }`}
                    >
                      <span className="font-medium">{row.name}</span> backed{" "}
                      {row.label}
                    </p>
                  ))}
              </div>
            </div>
          </div>
          {/* The stand. Six pixels that turn a bordered box into a screen on a
              table, which is the whole of what the room used to be for. */}
          <div className="mx-auto h-2 w-8 bg-foreground/80" />
          <div className="mx-auto h-1 w-16 rounded-full bg-foreground/60" />
        </div>
      </div>
    </Vignette>
  )
}
