"use client"

// The record vignette — the landing's fourth scripted illustration (with the
// hero demo, the Grandad dialogs and the watch room): a constellation of
// favpolls scattered around one record card, all asking the same topic. The
// scripted loop walks the constellation: a pledge lands on a mini favpoll
// (+£ pill, bar growth) and BOTH cards glow in sync — the favpoll
// energising the record — as the same amount moves the record's standing.
// Midway, a pledge tips Jaffa Cake past Custard Cream and the record
// re-ranks live (the bump moment, the record's whole drama).
//
// Arithmetic discipline (the watch room's rule): every record movement
// equals a visible pledge on a mini card. The record's baseline stands for
// the many favpolls that fed it before this scene — nothing moves unpaid.
// Reduced motion: the final frame (post-overtake), static, no glow.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

const ITEMS = ["Jaffa Cake", "Custard Cream", "Bourbon"] as const
type Item = (typeof ITEMS)[number]

const TOPIC = "Favourite Biscuit"

type Mini = {
  eyebrow: string
  title: string
  base: Record<Item, number>
  /** Scatter position + tilt on the constellation canvas */
  pos: string
}

// Six occasions across the registers, scattered around the record.
const MINIS: Mini[] = [
  {
    eyebrow: "In memory of",
    title: "June Bailey",
    base: { "Jaffa Cake": 30, "Custard Cream": 45, Bourbon: 15 },
    pos: "top-0 left-[2%] -rotate-3",
  },
  {
    eyebrow: "Wedding",
    title: "Amy & Tom",
    base: { "Jaffa Cake": 15, "Custard Cream": 25, Bourbon: 20 },
    pos: "top-[3%] right-[3%] rotate-2",
  },
  {
    eyebrow: "Retirement",
    title: "Pat Nowak",
    base: { "Jaffa Cake": 25, "Custard Cream": 20, Bourbon: 30 },
    pos: "top-[36%] left-0 rotate-1",
  },
  {
    eyebrow: "Fundraiser",
    title: "Ben's Big Run",
    base: { "Jaffa Cake": 40, "Custard Cream": 15, Bourbon: 25 },
    pos: "top-[38%] right-0 -rotate-2",
  },
  {
    eyebrow: "Birthday",
    title: "Rosa's 50th",
    base: { "Jaffa Cake": 20, "Custard Cream": 30, Bourbon: 10 },
    pos: "bottom-0 left-[6%] rotate-2",
  },
  {
    eyebrow: "For a cause",
    title: "Bake Sale for Shelter",
    base: { "Jaffa Cake": 20, "Custard Cream": 10, Bourbon: 10 },
    pos: "bottom-[2%] right-[5%] -rotate-1",
  },
]

// Custard Cream leads the record until pledge four tips Jaffa Cake past.
const RECORD_BASE: Record<Item, number> = {
  "Jaffa Cake": 2105,
  "Custard Cream": 2140,
  Bourbon: 1480,
}

const PLEDGES: { card: number; item: Item; amount: number }[] = [
  { card: 0, item: "Jaffa Cake", amount: 20 },
  { card: 2, item: "Bourbon", amount: 15 },
  { card: 1, item: "Custard Cream", amount: 10 }, // CC extends its lead…
  { card: 3, item: "Jaffa Cake", amount: 30 }, // …then 2,155 > 2,150 — overtake
  { card: 4, item: "Bourbon", amount: 10 },
  { card: 5, item: "Jaffa Cake", amount: 20 },
]

// step 0: idle · 1–6: pledges land · 7: hold → reset
const STEP_MS = [1600, 2400, 2400, 2400, 3200, 2400, 2400, 4600]
const LAST = STEP_MS.length - 1

const GBP = (n: number) => `£${n.toLocaleString("en-GB")}`
const RECORD_ROW_H = 42

// The synced glow: the active favpoll and the record share this while a
// pledge lands — the favpoll energising the record.
const GLOW = "border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/25"

export function RecordFlow() {
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

  const appliedCount = Math.min(Math.max(step, 0), PLEDGES.length)
  const active =
    !reduced && step >= 1 && step <= PLEDGES.length ? PLEDGES[step - 1] : null

  // Mini card values after the applied pledges
  const miniValues: Record<Item, number>[] = MINIS.map((mini, i) => {
    const values = { ...mini.base }
    for (const p of PLEDGES.slice(0, appliedCount)) {
      if (p.card === i) values[p.item] += p.amount
    }
    return values
  })

  // Record values + live ranking
  const recordValues = { ...RECORD_BASE }
  for (const p of PLEDGES.slice(0, appliedCount)) {
    recordValues[p.item] += p.amount
  }
  const ranking = [...ITEMS].sort(
    (a, b) => recordValues[b] - recordValues[a] || a.localeCompare(b)
  )
  const recordMax = recordValues[ranking[0]]

  return (
    <div className="relative h-[30rem]" aria-hidden="true">
      {/* ── The favpolls — scattered around the record ── */}
      {MINIS.map((mini, i) => {
        const values = miniValues[i]
        const miniMax = Math.max(...ITEMS.map((item) => values[item]))
        const isActive = active?.card === i
        return (
          <div
            key={mini.title}
            className={`absolute w-40 rounded-lg border bg-background p-2.5 transition-all duration-300 ${mini.pos} ${
              isActive ? `z-20 ${GLOW}` : "z-0 border-border shadow-sm"
            }`}
          >
            <p className="text-[8px] font-medium tracking-widest text-muted-foreground uppercase">
              {mini.eyebrow}
            </p>
            <p className="text-[11px] font-medium text-foreground">
              {mini.title}
            </p>
            <p className="mb-1 text-[8px] font-medium tracking-widest text-primary uppercase">
              {TOPIC}
            </p>
            <div className="space-y-[3px]">
              {ITEMS.map((item) => (
                <div key={item}>
                  <div className="flex items-baseline justify-between text-[9px] leading-tight">
                    <span className="text-foreground">
                      {item}
                      {isActive && active?.item === item && (
                        <span className="ml-1 rounded-full bg-secondary px-1 py-px text-[8px] font-medium text-secondary-foreground">
                          +{GBP(active.amount)}
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {GBP(values[item])}
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-3"
                      style={{
                        width: `${Math.round((values[item] / miniMax) * 100)}%`,
                        transition: reduced ? "none" : "width 700ms ease-out",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* ── The record — centred; glows in sync with the active favpoll ── */}
      <div
        className={`absolute top-1/2 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-4 transition-all duration-300 ${
          active ? GLOW : "border-border shadow-md"
        }`}
      >
        <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
          The record
        </p>
        <p className="mb-3 text-sm font-medium text-foreground">{TOPIC}</p>
        <div
          className="relative"
          style={{ height: ITEMS.length * RECORD_ROW_H }}
        >
          {ITEMS.map((item) => {
            const rank = ranking.indexOf(item)
            const isActive = active?.item === item
            return (
              <div
                key={item}
                className="absolute inset-x-0"
                style={{
                  top: rank * RECORD_ROW_H,
                  transition: reduced ? "none" : "top 700ms ease-out",
                }}
              >
                <div className="flex items-baseline justify-between text-xs">
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {GBP(recordValues[item])}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${rank === 0 ? "bg-primary" : "bg-chart-3"}`}
                    style={{
                      width: `${Math.round((recordValues[item] / recordMax) * 100)}%`,
                      transition: reduced
                        ? "none"
                        : "width 700ms ease-out, background-color 300ms",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
