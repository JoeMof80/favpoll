"use client"

// The custom-favpoll story, shown not told: the organiser's question types
// out, their answers get added one by one, then pledges arrive and the bars
// fill. A scripted loop; reduced motion gets the final frame.
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { RankingBar } from "@/components/ui/ranking-bar"

const QUESTION = "Favourite meeting room"

const ITEMS = [
  { label: "The fishbowl", amount: 45, width: 75 },
  { label: "Third-floor corner", amount: 30, width: 50 },
  { label: "The one with the sofa", amount: 25, width: 42 },
] as const

// Steps: 0 = question typing · 1..3 = items added · 4 = pledges land (bars
// fill) · then hold and reset.
const LAST_STEP = ITEMS.length + 1
const TYPE_MS = 45
const ITEM_BEAT_MS = 900
const PLEDGE_BEAT_MS = 1400
const HOLD_MS = 3800

export function AnyoneCanAnswer() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced ? LAST_STEP : 0)
  const [typedCount, setTypedCount] = useState(reduced ? QUESTION.length : 0)

  // Type the question during step 0
  useEffect(() => {
    if (reduced || step !== 0) return
    if (typedCount >= QUESTION.length) {
      const id = setTimeout(() => setStep(1), 500)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setTypedCount((n) => n + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [typedCount, step, reduced])

  // Advance items → pledges → hold → reset
  useEffect(() => {
    if (reduced || step === 0) return
    const delay =
      step >= LAST_STEP
        ? HOLD_MS
        : step === LAST_STEP - 1
          ? PLEDGE_BEAT_MS
          : ITEM_BEAT_MS
    const id = setTimeout(() => {
      if (step >= LAST_STEP) {
        setTypedCount(0)
        setStep(0)
      } else {
        setStep(step + 1)
      }
    }, delay)
    return () => clearTimeout(id)
  }, [step, reduced])

  const typing = step === 0 && typedCount < QUESTION.length
  const itemsShown = step === 0 ? 0 : Math.min(step, ITEMS.length)
  const pledged = step >= LAST_STEP

  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Colour, season, biscuit — the built-in questions need no expertise, so
        everyone takes part as equals. Or write your own question and answers,
        for an office, a club, a family.
      </p>

      {/* Custom favpoll being made: question typed → answers added → pledges */}
      <div
        className="min-h-44 space-y-2 rounded-xl border border-border bg-background p-5"
        aria-hidden="true"
      >
        <p className="text-xs font-medium tracking-widest text-primary uppercase">
          {QUESTION.slice(0, typedCount)}
          {typing && <span className="opacity-40">|</span>}
          {typedCount === 0 && !typing && " "}
        </p>
        <AnimatePresence initial={false}>
          {ITEMS.slice(0, itemsShown).map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduced ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <RankingBar
                label={item.label}
                amount={pledged ? `£${item.amount}` : "—"}
                widthPercent={pledged ? item.width : 3}
                barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
                barStyle={{
                  transition: reduced ? "none" : "width 700ms ease-out",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
