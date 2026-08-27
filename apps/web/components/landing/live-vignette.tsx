"use client"

// The live section's artefact: the REAL display, with pledges landing on it.
//
// FAITHFUL, NOT A DRAWING OF ONE (founder, 2026-08-20): "how about we abandon
// the phone and make the live display much more faithful to the real
// experience. Maybe even reuse the display from 'How it works'. It needs to
// represent the content that describes it, above ... That is the most
// important thing."
//
// So it is DisplayStill — the same component the homepage walkthrough uses,
// which is DisplayScreen itself with live={false}. Nothing is drawn a second
// time, which means this artefact cannot drift from the product the way a
// hand-built lookalike does. The page's charter has always demanded real
// components and never lookalikes; this was the last section not obeying it.
//
// WHAT CAME BEFORE, so nobody rebuilds it. A room in perspective was tried
// first: the display sat small on a far wall and its 10px labels rendered at
// 4.3px, so the one thing this section claims — standings moving as pledges
// land — could not be seen at all. A magnified wall callout beside it was
// bolted on and rejected. Then a bespoke phone-and-screen pair, drawn by hand,
// which took four rounds of corrections: a phone shaped like a watch, a screen
// shaped like a letterbox, a missing QR, a layout "nothing like the real
// thing". Every one of those was a fidelity bug that could only exist because
// the thing was a drawing.
//
// THE PHONE IS GONE. It was there to supply the other end of the exchange, but
// the display already shows it — money arrives, the standings move, a name
// appears on the wall. Beside the screen it was a second object competing for
// the width the screen needed in order to be legible at all.
//
// THE BEAT IS DRIVEN THROUGH THE SCENE, not painted on top. Bumping a
// favourite's amount moves the standings AND the total, because DisplayStill
// derives the total from the pledges — so the sync is a property of the data
// rather than two animations somebody has to keep in step. The wall grows a
// name with it, which is the one thing the still could not do until it took a
// wallNames prop.
//
// SAME WIDTH AS EVERY OTHER VIGNETTE (founder, 2026-08-09, and still in
// force): "it was the one section that sat wider, which read as a mistake
// rather than as emphasis." Vignette's `wide` was tried here and reversed on
// finding that note — it buys the still 896px instead of 672, and with it 11.7
// px of type instead of 8.6, which is a real gain and not mine to take.
//
// SCALED TO ITS COLUMN, measured rather than tuned. The still is authored at
// 1120 plus the TV's bezel, and its frame is ~294 wide on a phone against
// ~750 at 1280 — so the scale is read off the container at runtime and the box
// reserves the scaled height. No breakpoint to keep true, and nothing to go
// stale, which is how the previous constants failed three times.
import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import {
  DisplayStill,
  DISPLAY_STILL_WIDTH,
  DISPLAY_STILL_ROOM,
} from "@/components/landing/display-still"
import { DEMO_SCENE, DEMO_QR_URL } from "@/components/landing/demo-fixture"
import { Vignette } from "@/components/landing/vignette"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

/** The still's own width plus TvFrame's 20px bezel each side. */
const NATURAL_W = DISPLAY_STILL_WIDTH + 40
/** Room mode is 16:9 plus the same bezel on all four sides. */
const NATURAL_W_ROOM = DISPLAY_STILL_ROOM.w + 40
const NATURAL_H_ROOM = DISPLAY_STILL_ROOM.h + 40

/**
 * The still's measured height, used ONLY to hold the space open before it
 * mounts. The real height replaces it the moment there is one — this exists so
 * the page does not jump when a client-only artefact arrives.
 */
const FALLBACK_H = 697

/** Wall entries, in arrival order. null renders as "Someone". */
const WALL: (string | null)[] = ["Priya", "Tom", null, "Aisha", "Dan"]

/** The pledges that land: which favourite takes the money, and how much. */
const PLEDGES: { index: number; amount: number }[] = [
  { index: 1, amount: 50 },
  { index: 0, amount: 20 },
]

// 0: as the room finds it · 1: £50 lands on the runner-up · 2: £20 lands on
// the leader, so the screen reads as live rather than as waiting for you.
const STEP_MS = [2600, 3000, 3400]
const LAST = STEP_MS.length - 1

function parseGBP(amount: string): number {
  return parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0
}

/** The scene as it stands once the first `n` pledges have landed. */
function sceneAfter(base: HeroScene, n: number): HeroScene {
  if (n === 0) return base
  const results = base.results.map((r, i) => {
    const added = PLEDGES.slice(0, n)
      .filter((p) => p.index === i)
      .reduce((sum, p) => sum + p.amount, 0)
    return added ? { ...r, amount: `£${parseGBP(r.amount) + added}` } : r
  })
  return { ...base, results }
}

/**
 * Defaults to the celebration scene, which is what /features wants — that
 * page is register-neutral. A register page passes its own: /memorials was
 * showing Poppy Chen's birthday on the screen while its printed card, its
 * reveal and its keepsake were all Belinda Hartley's, so a page a celebrant
 * forwards to a bereaved family told two unrelated favpolls as one story
 * (2026-08-26).
 *
 * PLEDGES indexes into results by position, and every scene carries six, so
 * the same three pledges land wherever this is pointed.
 */
/**
 * `still` holds the screen at its settled state — every pledge landed, the
 * wall full — with no timer running (founder, 2026-08-27: "i'm not sure
 * there is any need to animate these vignettes").
 *
 * A PROP RATHER THAN A DELETION, because /features shows this too and that
 * page is not covered by the call. It also costs nothing: `reduced` already
 * had to render exactly this state for prefers-reduced-motion, so `still` is
 * that same branch reached deliberately rather than by an OS setting.
 *
 * The stepping was never load-bearing on a register page. What the idea
 * beside it claims — a screen the room can glance at — is a property of the
 * display, not of watching numbers move; and the movement was the one thing
 * making a real component read as a demo of itself.
 */
export function LiveVignette({
  scene: base = DEMO_SCENE,
  still = false,
  room = false,
}: { scene?: HeroScene; still?: boolean; room?: boolean } = {}) {
  const naturalW = room ? NATURAL_W_ROOM : NATURAL_W
  const scenes = useMemo(
    () => [sceneAfter(base, 0), sceneAfter(base, 1), sceneAfter(base, 2)],
    [base]
  )
  // CLIENT-ONLY, and not merely as an optimisation. DisplayStill captures its
  // clock ONCE at module load, to keep the wall's relative times ("4m ago")
  // out of render — which is only safe because it has always been mounted
  // client-side. Rendering it on the server broke that: the module was
  // evaluated in a process that had been up for hours, so a fresh page served
  // a wall reading "8h ago" — the server's uptime, not the favpoll's activity
  // — and server and client disagreed about the time on top of it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced || still ? LAST : 0)

  const boxRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [naturalH, setNaturalH] = useState(0)

  useEffect(() => {
    if (reduced || still) return
    const id = setTimeout(
      () => setStep((s) => (s >= LAST ? 0 : s + 1)),
      STEP_MS[step]
    )
    return () => clearTimeout(id)
  }, [step, reduced, still])

  useEffect(() => {
    const box = boxRef.current
    const inner = innerRef.current
    if (!box || !inner) return
    const update = () => {
      setWidth(box.getBoundingClientRect().width)
      // The still is content-sized, so its height is READ rather than assumed.
      // The constant it would otherwise need went stale three times.
      //
      // IGNORE AN EMPTY FRAME. Before the still mounts, this measures a
      // TvFrame with nothing in it — 48px of bezel — and writing that as the
      // natural height collapsed the whole artefact to 92px, where it stayed
      // because nothing measured it again. Anything shorter than a bezel is
      // not the display.
      const h = inner.offsetHeight
      if (h > 200) setNaturalH(h)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(box)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [mounted])

  const scale = width ? width / naturalW : 0
  const wallNames = WALL.slice(0, 3 + step)

  return (
    <Vignette>
      <div ref={boxRef} aria-hidden="true" className="w-full">
        {/* A transform does not change the layout box, so the scaled height is
            reserved explicitly — the class of bug that once put a 940px TV in
            a 184px well and spilled it over the beats either side. */}
        <div
          className="overflow-hidden"
          style={{
            // ASPECT-RATIO, not a computed height. A JS height needs a
            // measurement first, so the frame before the observer fired
            // rendered at 122px and the page jumped once on every load —
            // measured. A ratio holds the space from first paint, and the
            // real height replaces the fallback as soon as there is one.
            // Room mode DECLARES its height, so the ratio is known from the
            // first paint and the measured fallback never runs — that path
            // exists for the content-sized still, whose height cannot be
            // known before it mounts.
            aspectRatio: `${naturalW} / ${
              room ? NATURAL_H_ROOM : naturalH || FALLBACK_H
            }`,
          }}
        >
          <div
            ref={innerRef}
            className="origin-top-left"
            style={{
              width: naturalW,
              transform: scale ? `scale(${scale})` : undefined,
            }}
          >
            <TvFrame>
              {mounted && (
                <DisplayStill
                  scene={scenes[step]}
                  qrUrl={DEMO_QR_URL}
                  wallNames={wallNames}
                  // The count it ends on, so the card is its final size from
                  // the first frame and nothing below it moves as names land.
                  wallReserveRows={3 + LAST}
                  room={room}
                />
              )}
            </TvFrame>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
