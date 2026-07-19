"use client"

// The record vignette — the landing's fourth scripted illustration (with the
// hero demo, the Grandad dialogs and the watch room): three favpolls share
// one topic, and their pledges feed one permanent ranking. The scripted
// loop: a pledge lands on a mini favpoll card (its bar grows, a +£ pill
// flashes) and the same amount lands on the record card beside it — until
// the third pledge tips Jaffa Cake past Custard Cream and the record
// re-ranks live (the bump moment, the record's whole drama).
//
// Arithmetic discipline (the watch room's rule): every record movement
// equals a visible pledge on a mini card. The record's baseline stands for
// the many favpolls that fed it before this scene — nothing moves unpaid.
// Reduced motion: the final frame (post-overtake), static.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { MoveRight } from "lucide-react"

const ITEMS = ["Jaffa Cake", "Custard Cream", "Bourbon"] as const
type Item = (typeof ITEMS)[number]

type Mini = {
  eyebrow: string
  title: string
  base: Record<Item, number>
}

const MINIS: Mini[] = [
  {
    eyebrow: "In memory of",
    title: "June Bailey",
    base: { "Jaffa Cake": 30, "Custard Cream": 45, Bourbon: 15 },
  },
  {
    eyebrow: "Retirement",
    title: "Pat Nowak",
    base: { "Jaffa Cake": 25, "Custard Cream": 20, Bourbon: 30 },
  },
  {
    eyebrow: "For a cause",
    title: "Bake Sale for Shelter",
    base: { "Jaffa Cake": 20, "Custard Cream": 10, Bourbon: 10 },
  },
]

// Custard Cream leads the record until the third pledge tips Jaffa Cake past.
const RECORD_BASE: Record<Item, number> = {
  "Jaffa Cake": 2105,
  "Custard Cream": 2140,
  Bourbon: 1480,
}

const PLEDGES: { card: number; item: Item; amount: number }[] = [
  { card: 0, item: "Jaffa Cake", amount: 20 },
  { card: 1, item: "Bourbon", amount: 15 },
  { card: 2, item: "Jaffa Cake", amount: 25 }, // 2,150 > 2,140 — the overtake
]

// step 0: idle · 1–3: pledges land · 4: hold → reset
const STEP_MS = [1800, 2600, 2600, 3400, 4600]
const LAST = STEP_MS.length - 1

const GBP = (n: number) => `£${n.toLocaleString("en-GB")}`
const RECORD_ROW_H = 44

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

  const appliedCount = Math.min(step, PLEDGES.length)
  const active = step >= 1 && step <= PLEDGES.length ? PLEDGES[step - 1] : null

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
    <div
      className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1.15fr] sm:gap-5"
      aria-hidden="true"
    >
      {/* ── The favpolls — three occasions, one topic ── */}
      <div className="space-y-2.5">
        {MINIS.map((mini, i) => {
          const values = miniValues[i]
          const miniMax = Math.max(...ITEMS.map((item) => values[item]))
          const isActive = active?.card === i
          return (
            <div
              key={mini.title}
              className={`rounded-lg border bg-background p-3 shadow-sm transition-colors duration-300 ${
                isActive ? "border-border-strong" : "border-border"
              }`}
            >
              <p className="text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
                {mini.eyebrow}
              </p>
              <p className="mb-1.5 text-xs font-medium text-foreground">
                {mini.title}
              </p>
              <div className="space-y-1">
                {ITEMS.map((item) => (
                  <div key={item}>
                    <div className="flex items-baseline justify-between text-[10px]">
                      <span className="text-foreground">
                        {item}
                        {isActive && active?.item === item && (
                          <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-px text-[9px] font-medium text-secondary-foreground">
                            +{GBP(active.amount)}
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {GBP(values[item])}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
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
      </div>

      {/* ── The flow ── */}
      <MoveRight className="mx-auto hidden h-5 w-5 text-primary/50 sm:block" />

      {/* ── The record — one permanent ranking, re-ranking live ── */}
      <div className="rounded-xl border border-border bg-background p-4 shadow-md">
        <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
          The record
        </p>
        <p className="mb-3 text-sm font-medium text-foreground">
          Favourite Biscuit
        </p>
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
