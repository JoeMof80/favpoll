"use client"

// The record vignette — the landing's fourth scripted illustration (with the
// hero demo, the Grandad dialogs and the watch room): a tight cluster of
// favpolls overlapping one record card, all asking the same topic. Every
// favpoll takes a pledge in turn — tucked cards come forward (z above the
// record) to deliver theirs, then recede. Each favpoll has its own local
// ranking, with biscuits beyond the record's top three (Digestive, Hobnob,
// Party Ring, Shortbread) for realism.
//
// The causal story plays at bar level, twice over: a +£ pill appears on the
// favpoll's item AND on the record's same item, while both bar fills flip
// to primary and pulse in sync — the favpoll's bar visibly energising the
// record bar it aggregates into. Pledge four tips Jaffa Cake past Custard
// Cream and the record re-ranks live (the bump moment).
//
// Arithmetic discipline (the watch room's rule): every record movement
// equals a visible pledge on a card; numbers are chosen so no favpoll's
// own ranking reorders mid-loop (only the record re-ranks). Reduced
// motion: the final frame (post-overtake), static, no glow.
import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { formatPounds } from "@/lib/i18n"

const RECORD_ITEMS = ["Jaffa Cake", "Custard Cream", "Bourbon"] as const
type RecordItem = (typeof RECORD_ITEMS)[number]

const TOPIC = "Favourite Biscuit"

type Mini = {
  eyebrow: string
  title: string
  /** The favpoll's own top three, sorted by base value (its local ranking) */
  items: { label: string; value: number }[]
  /** Cluster position + tilt; the record overlaps every card's inner edge */
  pos: string
}

const MINIS: Mini[] = [
  {
    eyebrow: "In memory of",
    title: "June Bailey",
    items: [
      { label: "Custard Cream", value: 45 },
      { label: "Jaffa Cake", value: 20 },
      { label: "Digestive", value: 15 },
    ],
    pos: "top-0 left-[18%] -rotate-2",
  },
  {
    eyebrow: "Fundraiser",
    title: "Ben's Big Run",
    items: [
      { label: "Jaffa Cake", value: 40 },
      { label: "Hobnob", value: 25 },
      { label: "Bourbon", value: 20 },
    ],
    pos: "top-[35%] left-[14%] rotate-1",
  },
  {
    eyebrow: "Birthday",
    title: "Rosa's 50th",
    items: [
      { label: "Party Ring", value: 60 },
      { label: "Jaffa Cake", value: 25 },
      { label: "Custard Cream", value: 20 },
    ],
    pos: "bottom-0 left-[20%] rotate-2",
  },
  {
    eyebrow: "Wedding",
    title: "Amy & Tom",
    items: [
      { label: "Shortbread", value: 45 },
      { label: "Bourbon", value: 25 },
      { label: "Custard Cream", value: 20 },
    ],
    pos: "top-[1%] right-[12%] rotate-3",
  },
  {
    eyebrow: "Retirement",
    title: "Pat Nowak",
    items: [
      { label: "Bourbon", value: 40 },
      { label: "Custard Cream", value: 25 },
      { label: "Hobnob", value: 20 },
    ],
    pos: "top-[37%] right-[9%] -rotate-2",
  },
  {
    eyebrow: "For a cause",
    title: "Bake Sale for Shelter",
    items: [
      { label: "Jaffa Cake", value: 30 },
      { label: "Digestive", value: 20 },
      { label: "Bourbon", value: 5 },
    ],
    pos: "bottom-[1%] right-[14%] rotate-2",
  },
]

// Custard Cream leads the record until pledge four tips Jaffa Cake past.
const RECORD_BASE: Record<RecordItem, number> = {
  "Jaffa Cake": 2105,
  "Custard Cream": 2140,
  Bourbon: 1480,
}

// One pledge per favpoll — every card animates in turn.
const PLEDGES: { card: number; item: RecordItem; amount: number }[] = [
  { card: 0, item: "Jaffa Cake", amount: 20 },
  { card: 3, item: "Bourbon", amount: 15 },
  { card: 4, item: "Custard Cream", amount: 10 }, // CC extends its lead…
  { card: 1, item: "Jaffa Cake", amount: 30 }, // …then 2,155 > 2,150 — overtake
  { card: 5, item: "Bourbon", amount: 10 },
  { card: 2, item: "Jaffa Cake", amount: 20 },
]

// step 0: idle · 1–6: pledges land · 7: hold → reset
const STEP_MS = [1600, 2600, 2600, 2600, 3400, 2600, 2600, 4600]
const LAST = STEP_MS.length - 1

const RECORD_ROW_H = 36

// Card-level glow while a pledge lands — shared by the active favpoll and
// the record, in sync: the favpoll energising the record.
const GLOW = "border-primary ring-4 ring-primary/15 shadow-lg shadow-primary/25"
// Bar-level sync: the favpoll's item fill and the record's same item fill
// flip to primary and pulse together while the pledge lands.
const ACTIVE_FILL = "bg-primary motion-safe:animate-pulse"

function PlusPill({ amount }: { amount: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-px text-[9px] font-medium text-primary-foreground">
      +{formatPounds(amount)}
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

  // Mini card values after the applied pledges (order stays the card's own
  // base ranking — numbers are chosen so no card reorders internally)
  const miniValues = MINIS.map((mini, i) => {
    return mini.items.map(({ label, value }) => {
      let v = value
      for (const p of PLEDGES.slice(0, appliedCount)) {
        if (p.card === i && p.item === label) v += p.amount
      }
      return { label, value: v }
    })
  })

  // Record values + live ranking
  const recordValues = { ...RECORD_BASE }
  for (const p of PLEDGES.slice(0, appliedCount)) {
    recordValues[p.item] += p.amount
  }
  const ranking = [...RECORD_ITEMS].sort(
    (a, b) => recordValues[b] - recordValues[a] || a.localeCompare(b)
  )
  const recordMax = recordValues[ranking[0]]

  return (
    <div className="relative h-[22rem]" aria-hidden="true">
      {/* ── The favpolls — clustered tight, tucked under the record; the
          active one comes forward to deliver its pledge ── */}
      {MINIS.map((mini, i) => {
        const values = miniValues[i]
        const miniMax = Math.max(...values.map((v) => v.value))
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
              {values.map(({ label, value }) => {
                const isActiveBar = isActive && active?.item === label
                return (
                  <div key={label}>
                    <div className="flex items-baseline justify-between text-[9px] leading-tight">
                      <span
                        className={
                          isActiveBar
                            ? "font-medium text-primary"
                            : "text-foreground"
                        }
                      >
                        {label}
                        {isActiveBar && <PlusPill amount={active.amount} />}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatPounds(value)}
                      </span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          isActiveBar ? ACTIVE_FILL : "bg-chart-3"
                        }`}
                        style={{
                          width: `${Math.round((value / miniMax) * 100)}%`,
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
        className={`absolute top-1/2 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-4 transition-all duration-300 ${
          active ? GLOW : "border-border shadow-md"
        }`}
      >
        <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
          The record
        </p>
        <p className="mb-2 text-sm font-medium text-foreground">{TOPIC}</p>
        <div
          className="relative"
          style={{ height: RECORD_ITEMS.length * RECORD_ROW_H }}
        >
          {RECORD_ITEMS.map((item) => {
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
                    {formatPounds(recordValues[item])}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
