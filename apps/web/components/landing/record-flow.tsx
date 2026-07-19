"use client"

// The record vignette — the landing's fourth scripted illustration (with the
// hero demo, the Grandad dialogs and the watch room): a tight cluster of
// favpolls around one record card, all asking the same topic. Three featured
// favpolls (fully visible, left) take the pledges; three more tuck behind
// the record's edges as texture — the "many more" the baseline implies.
//
// The scripted loop tells one causal story per beat, twice over: a +£ pill
// appears on the favpoll's item AND on the record's same item, while both
// bar fills flip to primary and pulse in sync — the favpoll's bar visibly
// energising the record bar it aggregates into. Pledge four tips Jaffa
// Cake past Custard Cream and the record re-ranks live (the bump moment).
//
// Arithmetic discipline (the watch room's rule): every record movement
// equals a visible pledge on a featured card. Reduced motion: the final
// frame (post-overtake), static, no glow.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

const ITEMS = ["Jaffa Cake", "Custard Cream", "Bourbon"] as const
type Item = (typeof ITEMS)[number]

const TOPIC = "Favourite Biscuit"

type Mini = {
  eyebrow: string
  title: string
  base: Record<Item, number>
  /** Cluster position + tilt; background cards tuck behind the record */
  pos: string
  featured: boolean
}

const MINIS: Mini[] = [
  // ── Featured: fully visible on the left, these take the pledges ──
  {
    eyebrow: "In memory of",
    title: "June Bailey",
    base: { "Jaffa Cake": 30, "Custard Cream": 45, Bourbon: 15 },
    pos: "top-0 left-[6%] -rotate-2",
    featured: true,
  },
  {
    eyebrow: "Fundraiser",
    title: "Ben's Big Run",
    base: { "Jaffa Cake": 40, "Custard Cream": 15, Bourbon: 25 },
    pos: "top-[34%] left-0 rotate-1",
    featured: true,
  },
  {
    eyebrow: "Birthday",
    title: "Rosa's 50th",
    base: { "Jaffa Cake": 20, "Custard Cream": 30, Bourbon: 10 },
    pos: "bottom-0 left-[8%] rotate-2",
    featured: true,
  },
  // ── Background: tucked behind the record's edges, static texture ──
  {
    eyebrow: "Wedding",
    title: "Amy & Tom",
    base: { "Jaffa Cake": 15, "Custard Cream": 25, Bourbon: 20 },
    pos: "top-[2%] right-[4%] rotate-3",
    featured: false,
  },
  {
    eyebrow: "Retirement",
    title: "Pat Nowak",
    base: { "Jaffa Cake": 25, "Custard Cream": 20, Bourbon: 30 },
    pos: "top-[38%] right-0 -rotate-2",
    featured: false,
  },
  {
    eyebrow: "For a cause",
    title: "Bake Sale for Shelter",
    base: { "Jaffa Cake": 20, "Custard Cream": 10, Bourbon: 10 },
    pos: "bottom-[2%] right-[6%] rotate-2",
    featured: false,
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
  { card: 1, item: "Bourbon", amount: 15 },
  { card: 2, item: "Custard Cream", amount: 10 }, // CC extends its lead…
  { card: 1, item: "Jaffa Cake", amount: 30 }, // …then 2,155 > 2,150 — overtake
  { card: 2, item: "Bourbon", amount: 10 },
  { card: 0, item: "Jaffa Cake", amount: 20 },
]

// step 0: idle · 1–6: pledges land · 7: hold → reset
const STEP_MS = [1600, 2600, 2600, 2600, 3400, 2600, 2600, 4600]
const LAST = STEP_MS.length - 1

const GBP = (n: number) => `£${n.toLocaleString("en-GB")}`
const RECORD_ROW_H = 42

// Card-level glow while a pledge lands — shared by the active favpoll and
// the record, in sync: the favpoll energising the record.
const GLOW = "border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/25"
// Bar-level sync: the favpoll's item fill and the record's same item fill
// flip to primary and pulse together while the pledge lands.
const ACTIVE_FILL = "bg-primary motion-safe:animate-pulse"

function PlusPill({ amount }: { amount: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-px text-[9px] font-medium text-primary-foreground">
      +{GBP(amount)}
    </span>
  )
}

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
    <div className="relative h-[27rem]" aria-hidden="true">
      {/* ── The favpolls — featured left, the rest tucked behind ── */}
      {MINIS.map((mini, i) => {
        const values = miniValues[i]
        const miniMax = Math.max(...ITEMS.map((item) => values[item]))
        const isActive = active?.card === i
        return (
          <div
            key={mini.title}
            className={`absolute w-40 rounded-lg border bg-background p-2.5 transition-all duration-300 ${mini.pos} ${
              isActive
                ? `z-[5] ${GLOW}`
                : `border-border ${mini.featured ? "z-[5] shadow-sm" : "z-0 shadow-sm"}`
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
              {ITEMS.map((item) => {
                const isActiveBar = isActive && active?.item === item
                return (
                  <div key={item}>
                    <div className="flex items-baseline justify-between text-[9px] leading-tight">
                      <span
                        className={
                          isActiveBar
                            ? "font-medium text-primary"
                            : "text-foreground"
                        }
                      >
                        {item}
                        {isActiveBar && <PlusPill amount={active.amount} />}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {GBP(values[item])}
                      </span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          isActiveBar ? ACTIVE_FILL : "bg-chart-3"
                        }`}
                        style={{
                          width: `${Math.round((values[item] / miniMax) * 100)}%`,
                          transition: reduced ? "none" : "width 700ms ease-out",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ── The record — centred; card and bar glow in sync with the
          active favpoll ── */}
      <div
        className={`absolute top-1/2 left-[54%] z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-4 transition-all duration-300 ${
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
            const isActiveBar = active?.item === item
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
                      isActiveBar ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item}
                    {isActiveBar && active && (
                      <PlusPill amount={active.amount} />
                    )}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {GBP(recordValues[item])}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      isActiveBar
                        ? ACTIVE_FILL
                        : rank === 0
                          ? "bg-primary"
                          : "bg-chart-3"
                    }`}
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
