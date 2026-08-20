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
// FOUR CORRECTIONS (founder, 2026-08-20): "phone should look like a phone.
// QR code should be visible. live display should look wall mounted. Both the
// phone and the display should show the topic and rankings too."
//
// All four pull the same way — the objects were abstracted down to the beat
// they had to carry, and lost the thing that made them recognisable. A phone
// with no chassis is a card; a screen with a stand is a monitor on a desk, not
// the thing in the room; and standings with no topic and no QR are numbers
// with nothing to do with favpoll. They are drawn as themselves now, and the
// beat still runs through them.
//
// The QR is the part that earns its place twice: it is how a guest gets from
// the screen into the favpoll at all, so a display without one is missing the
// mechanism the section above it just described.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { formatPounds } from "@/lib/i18n"
import { BrandedQR } from "@/components/branded-qr"
import { Vignette } from "@/components/landing/vignette"

const GOAL = 900
const TOPIC = "Favourite dog breed"
const QR_URL = "https://favpoll.com/j"

// 0: idle · 1: Pledge pressed · 2: it lands — Cocker Spaniel takes the £50 and
// the goal is crossed · 3: someone else's £20 goes to the Labrador on its own,
// so the screen reads as live rather than as waiting for you · hold → reset.
const STEP_MS = [1600, 380, 2800, 2800]
const LAST = STEP_MS.length - 1
const TOTALS = [855, 855, 905, 925]

// Standings per step. They move with the money — Raj's £50 onto the Cocker
// Spaniel, Amara's £20 onto the Labrador — so the rankings, the total, the
// goal and the wall are all one event rather than four decorations.
const RANKS: readonly (readonly [string, number])[][] = [
  [
    ["Labrador", 320],
    ["Cocker Spaniel", 270],
    ["Border Terrier", 165],
    ["Greyhound", 120],
  ],
  [
    ["Labrador", 320],
    ["Cocker Spaniel", 270],
    ["Border Terrier", 165],
    ["Greyhound", 120],
  ],
  [
    ["Labrador", 320],
    ["Cocker Spaniel", 320],
    ["Border Terrier", 165],
    ["Greyhound", 120],
  ],
  [
    ["Labrador", 340],
    ["Cocker Spaniel", 320],
    ["Border Terrier", 165],
    ["Greyhound", 120],
  ],
]
const RANK_MAX = 340

const WALL = [
  { name: "Priya", label: "Labrador" },
  { name: "Raj", label: "Cocker Spaniel" },
  { name: "Amara", label: "Labrador" },
] as const
const WALL_VISIBLE = [1, 1, 2, 3]

/** One standings row, at whatever size its container gives it. */
function Rank({
  label,
  amount,
  bumped,
  small = false,
}: {
  label: string
  amount: number
  bumped: boolean
  small?: boolean
}) {
  return (
    <div>
      <div
        className={`flex items-baseline justify-between gap-2 ${
          small ? "text-[9px]" : "text-[11px]"
        }`}
      >
        <span className="truncate text-foreground">{label}</span>
        <span
          className={`shrink-0 tabular-nums transition-colors duration-300 ${
            bumped ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {formatPounds(amount)}
        </span>
      </div>
      <div
        className={`mt-0.5 w-full overflow-hidden rounded-full bg-muted ${
          small ? "h-0.5" : "h-1"
        }`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(amount / RANK_MAX) * 100}%` }}
        />
      </div>
    </div>
  )
}

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

  const ranks = RANKS[step]
  // Which row just moved — coloured for a beat so the money is visibly landing
  // somewhere rather than the numbers merely being different.
  const bumped = step === 2 ? 1 : step === 3 ? 0 : -1
  const total = TOTALS[step]
  const reached = total >= GOAL
  const pressed = step === 1
  const pct = Math.min(100, (total / GOAL) * 100)

  return (
    <Vignette>
      <div
        aria-hidden="true"
        className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-start sm:gap-6"
      >
        {/* THE PHONE. Proportioned like one — the last version was 132 wide
            against ~230 tall and read as an Apple Watch (founder, 2026-08-20).
            A handset is about 2:1, its bezel is thin, and its corner radius is
            roughly a seventh of its width, not a third. Narrower, thinner
            bezel, tighter radius, and its own app chrome at the top, which is
            what makes the height honest rather than padded. */}
        <div className="w-[108px] shrink-0 rounded-[1.15rem] border-[5px] border-foreground/85 bg-foreground/85 shadow-lg sm:w-[118px]">
          <div className="relative overflow-hidden rounded-[0.8rem] bg-background">
            <div className="absolute top-1 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-foreground/25" />
            <div className="border-b border-border px-2 pt-3 pb-1.5">
              <p className="text-[8px] font-medium text-primary">favpoll</p>
            </div>
            <div className="px-2 py-2">
              <p className="text-[7px] font-medium tracking-widest text-muted-foreground uppercase">
                Jess&apos;s 30th
              </p>
              <p className="text-[8px] font-medium tracking-widest text-primary uppercase">
                {TOPIC}
              </p>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {ranks.map(([label, amount], i) => (
                  <Rank
                    key={label}
                    label={label}
                    amount={amount}
                    bumped={bumped === i}
                    small
                  />
                ))}
              </div>
              <div
                className={`mt-2 rounded-md py-1.5 text-center text-[9px] font-medium transition-all duration-200 ${
                  step >= 2
                    ? "bg-success/15 text-success"
                    : "bg-primary text-primary-foreground"
                } ${pressed ? "scale-[0.96] brightness-95" : ""}`}
              >
                {step >= 2 ? "£50 sent" : "Pledge £50"}
              </div>
            </div>
          </div>
        </div>

        {/* The beat travelling between them — the only thing in the frame that
            says these are one event rather than two pictures. */}
        <div className="flex shrink-0 items-center gap-1 sm:mt-16">
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

        {/* THE SCREEN, WALL MOUNTED, IN QUADRANTS — the real display's own
            layout (founder, 2026-08-20): "top left - pledge goal. top right -
            QR code. bottom left - rankings. bottom right - wall". The previous
            version stacked them, which was nothing like the thing it depicts.
            No stand: a stand made it a monitor on a desk. Mounted is a flush
            bezel and a cast shadow beneath, not furniture. */}
        <div className="w-full min-w-0 sm:max-w-[400px] sm:flex-1">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-lg border-[7px] border-foreground/85 bg-background p-3 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.45)]">
            {/* TOP LEFT — the goal */}
            <div className="min-w-0">
              <p className="text-[8px] font-medium tracking-widest text-muted-foreground uppercase">
                Pledge goal
              </p>
              <p className="mt-0.5 flex items-baseline gap-1">
                <span className="text-lg font-medium tabular-nums sm:text-xl">
                  {formatPounds(total)}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  of {formatPounds(GOAL)}
                </span>
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    reached ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* The green bar says the goal is met; only these words say the
                  favpoll does not stop there. */}
              <p
                className={`mt-1 text-[8px] leading-tight transition-colors duration-300 ${
                  reached ? "text-success" : "text-muted-foreground"
                }`}
              >
                {reached
                  ? "Goal reached — every pledge still counts"
                  : "Updating as pledges land"}
              </p>
            </div>

            {/* TOP RIGHT — the QR, which is how a guest gets from the screen
                into the favpoll at all. */}
            <div className="flex min-w-0 flex-col items-center justify-start">
              <BrandedQR value={QR_URL} size={52} logo={false} />
              <p className="mt-1 text-center text-[8px] leading-tight text-muted-foreground">
                Scan to pledge
              </p>
            </div>

            {/* BOTTOM LEFT — the standings */}
            <div className="min-w-0">
              <p className="text-[8px] font-medium tracking-widest text-primary uppercase">
                {TOPIC}
              </p>
              <div className="mt-1 flex flex-col gap-1">
                {ranks.map(([label, amount], i) => (
                  <Rank
                    key={label}
                    label={label}
                    amount={amount}
                    bumped={bumped === i}
                    small
                  />
                ))}
              </div>
            </div>

            {/* BOTTOM RIGHT — the wall. HEIGHT RESERVED FOR THREE: the rows
                arrive one at a time, and without a floor the screen grew
                mid-loop and shunted the page below it down every cycle. */}
            <div className="min-w-0">
              <p className="text-[8px] font-medium tracking-widest text-muted-foreground uppercase">
                Wall of favourites
              </p>
              <div className="mt-1 flex min-h-[42px] flex-col gap-0.5">
                {WALL.slice(0, WALL_VISIBLE[step])
                  .slice()
                  .reverse()
                  .map((row, i) => (
                    <p
                      key={row.name}
                      className={`text-[8px] leading-snug transition-opacity duration-500 ${
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
        </div>
      </div>
    </Vignette>
  )
}
