"use client"

// THE PODIUM (founder, 2026-10-15, after reading National Funding Scheme's
// DONATE Voting page: "hide the running totals … then close the vote and
// reveal a winners' podium: gold, silver and bronze").
//
// The room already withholds the reveal until the close and types the
// note out as the finale — but the close itself had no MOMENT: the
// countdown reached zero and the standings simply stopped moving. This is
// the moment. When the room witnesses the close, the band fills the
// screen and the top three arrive one at a time — bronze, then silver,
// then gold — hold, and give way to the sheet, where the note then types
// out as before. A ceremony before the finale, not instead of it.
//
// Rules it keeps:
// - ROOM ONLY, FINALE ONLY. Never on the guest's phone, never on a screen
//   that was already closed when it loaded, never on a still.
// - REGISTER INK, NO METAL. Gold/silver/bronze are told by HEIGHT and
//   weight of ink, not by hex colours — the palettes are generated and the
//   rule is never to hardcode a hex (register tokens, 2026-08-30).
// - THE PRESENTER CAN MOVE ON. Any click or key ends it early; a hold of
//   HOLD_MS ends it anyway, so a projector nobody is touching still gets
//   to the note.
// - REDUCED MOTION: all three at once, a shorter hold, no rise.
// - FEWER THAN THREE pledged favourites: as many steps as there are;
//   none at all and the shell skips the podium entirely.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import type { Favourite } from "@favpoll/types"
import { HeroTexture } from "@/components/landing/hero-texture"
import { formatPounds } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** When each step appears, from the podium's first frame. Bronze first:
 *  the room should wait for gold. */
export const STEP_AT_MS = { 3: 1000, 2: 2800, 1: 4800 } as const
/** When the podium gives way to the sheet, if nobody touches it. */
export const HOLD_MS = 11_000
const HOLD_REDUCED_MS = 7_000

export type PodiumStep = { rank: 1 | 2 | 3; label: string; pounds: number }

/** The top three PLEDGED favourites, best first. Pure, for the shell to
 *  decide whether there is a podium to show at all. */
export function podiumSteps(items: readonly Favourite[]): PodiumStep[] {
  return items
    .filter((i) => i.all_time_count > 0)
    .sort(
      (a, b) =>
        b.all_time_pledged - a.all_time_pledged ||
        a.label.localeCompare(b.label)
    )
    .slice(0, 3)
    .map((i, idx) => ({
      rank: (idx + 1) as 1 | 2 | 3,
      label: i.label,
      pounds: i.all_time_pledged,
    }))
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
function subscribeReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {}
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener?.("change", onChange)
  return () => mq.removeEventListener?.("change", onChange)
}
function readReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION).matches
  )
}

export function Podium({
  steps,
  topicTitle,
  onDone,
}: {
  steps: PodiumStep[]
  topicTitle: string
  onDone: () => void
}) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false
  )
  const [shown, setShown] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    if (reduced) {
      // All three at once (visible = reduced || shown); a shorter hold.
      const id = window.setTimeout(onDone, HOLD_REDUCED_MS)
      return () => window.clearTimeout(id)
    }
    const ids = ([3, 2, 1] as const).map((rank) =>
      window.setTimeout(
        () => setShown((s) => new Set(s).add(rank)),
        STEP_AT_MS[rank]
      )
    )
    const done = window.setTimeout(onDone, HOLD_MS)
    return () => {
      ids.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(done)
    }
  }, [reduced, onDone])

  // Any key moves on — a presenter with a clicker sends Enter, Space or
  // an arrow, and Escape is what anyone reaches for.
  useEffect(() => {
    const onKey = () => onDone()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onDone])

  // Classic podium order across the screen: silver · gold · bronze.
  const across = useMemo(
    () =>
      ([2, 1, 3] as const)
        .map((rank) => steps.find((s) => s.rank === rank))
        .filter((s): s is PodiumStep => !!s),
    [steps]
  )

  return (
    <div
      data-testid="podium"
      role="dialog"
      aria-modal="true"
      aria-label="Final standings"
      onClick={onDone}
      className="fixed inset-0 z-30 flex cursor-pointer flex-col items-center justify-center bg-primary px-8 text-primary-foreground select-none"
    >
      <HeroTexture />
      <div className="relative flex w-full max-w-5xl flex-col items-center">
        <p className="text-sm font-medium tracking-widest uppercase opacity-80 md:text-base">
          The picks are in
        </p>
        <h2 className="mt-2 text-3xl font-light tracking-tight md:text-5xl">
          Favourite {topicTitle}
        </h2>

        <ol
          className="mt-12 grid w-full max-w-3xl grid-cols-3 items-end gap-4 md:gap-8"
          aria-label="Podium"
        >
          {across.map((step) => {
            const visible = reduced || shown.has(step.rank)
            const gold = step.rank === 1
            return (
              <li
                key={step.rank}
                data-rank={step.rank}
                data-shown={visible ? "true" : "false"}
                style={{ order: step.rank === 2 ? 0 : step.rank === 1 ? 1 : 2 }}
                className={cn(
                  "flex flex-col items-center text-center transition-all duration-700 ease-out",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0 motion-reduce:translate-y-0"
                )}
                aria-hidden={!visible}
              >
                <p
                  className={cn(
                    "tabular-nums",
                    gold
                      ? "text-4xl font-medium md:text-6xl"
                      : "text-2xl md:text-4xl"
                  )}
                >
                  {formatPounds(step.pounds)}
                </p>
                <p
                  className={cn(
                    "mt-1 mb-4 leading-tight text-balance",
                    gold ? "text-xl md:text-3xl" : "text-base md:text-xl"
                  )}
                >
                  {step.label}
                </p>
                {/* The step: the podium is told by height and by weight of
                    ink — gold the tallest and brightest — never by a
                    metal's hex. */}
                <div
                  className={cn(
                    "flex w-full items-start justify-center rounded-t-lg pt-3 text-2xl font-medium text-primary tabular-nums md:text-3xl",
                    step.rank === 1 && "h-40 bg-primary-foreground md:h-56",
                    step.rank === 2 && "h-28 bg-primary-foreground/70 md:h-40",
                    step.rank === 3 && "h-20 bg-primary-foreground/50 md:h-28"
                  )}
                >
                  {step.rank}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
