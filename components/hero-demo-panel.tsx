"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { Transition } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { OccasionTag } from "@/components/ui/occasion-tag"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

import { RankingBar } from "@/components/ui/ranking-bar"
import { RevealQuote } from "@/components/ui/reveal-quote"

type Phase =
  | "arriving" // step 1
  | "selected" // step 2
  | "pledge-panel" // step 3
  | "amount-picked" // step 4
  | "pledging" // step 5
  | "confirmed" // step 5 (toast visible)
  | "clearing" // step 6
  | "reveal" // step 7–9

type HeroScene = {
  occasion: string
  occasionTag: string
  protagonistName: string
  protagonistInitials: string
  avatarColor: string
  topicTitle: string
  question: string
  options: { label: string }[]
  selectedIndex: number
  pledgeAmount: string
  charity: string
  revealLabel: string
  revealText: string
  barLabels: string[]
  barWidths: number[]
  barAmounts: string[]
  total: string
  totalLabel: string
}

// "In memory of",
// "Birthday",
// "Retirement",
// "Wedding",
// "Engagement",
// "Anniversary",
// "Leaving do",
// "Graduation",
// "Christening",
// "Achievement",

const SCENES: HeroScene[] = [
  {
    occasion: "Memorial",
    occasionTag: "In memory of",
    protagonistName: "Belinda Hartley",
    protagonistInitials: "BH",
    avatarColor: "#7F77DD",
    topicTitle: "Colour",
    question:
      "Belinda had a colour she returned to all her life — what's yours?",
    options: [
      { label: "Purple" },
      { label: "Blue" },
      { label: "Green" },
      { label: "Red" },
      { label: "Yellow" },
      { label: "Pink" },
    ],
    selectedIndex: 1,
    pledgeAmount: "£10",
    charity: "Age UK",
    revealLabel: "Belinda's reveal",
    revealText: "Mine was purple. I wore it to every occasion that mattered.",
    barLabels: ["Purple", "Blue", "Green", "Red"],
    barWidths: [78, 51, 28, 14],
    barAmounts: ["£350", "£220", "£120", "£60"],
    total: "£750",
    totalLabel: "raised for Age UK",
  },
  {
    occasion: "Birthday",
    occasionTag: "15 Today!",
    protagonistName: "Poppy Chen",
    protagonistInitials: "PC",
    avatarColor: "#E87D6A",
    topicTitle: "Ice cream",
    question: "Tell us your favourite ice cream to find out Poppy's.",
    options: [
      { label: "Mint choc chip" },
      { label: "Vanilla" },
      { label: "Chocolate" },
      { label: "Strawberry" },
      { label: "Lemon" },
      { label: "Raspberry" },
    ],
    selectedIndex: 2,
    pledgeAmount: "£20",
    charity: "Comic Relief",
    revealLabel: "Poppy's reveal",
    revealText:
      "Mint choc chip, obviously. (What do you mean you didn't know?)",
    barLabels: ["Mint choc chip", "Vanilla", "Chocolate", "Strawberry"],
    barWidths: [82, 61, 38, 19],
    barAmounts: ["£200", "£145", "£90", "£45"],
    total: "£480",
    totalLabel: "raised for Comic Relief",
  },
  {
    occasion: "Retirement",
    occasionTag: "Happy Retirement",
    protagonistName: "Margaret Osei",
    protagonistInitials: "MO",
    avatarColor: "#4AAB8A",
    topicTitle: "Season",
    question: "Margaret had a season she always loved most — which is yours?",
    options: [
      { label: "Autumn" },
      { label: "Spring" },
      { label: "Summer" },
      { label: "Winter" },
    ],
    selectedIndex: 1,
    pledgeAmount: "£50",
    charity: "Macmillan",
    revealLabel: "Margaret's reveal",
    revealText:
      "Autumn. It always felt like the world was making itself beautiful one last time.",
    barLabels: ["Autumn", "Spring", "Summer", "Winter"],
    barWidths: [71, 48, 35, 18],
    barAmounts: ["£290", "£195", "£140", "£75"],
    total: "£700",
    totalLabel: "raised for Macmillan",
  },
  {
    occasion: "Engagement",
    occasionTag: "She said yes!",
    protagonistName: "Alex & Jordan",
    protagonistInitials: "AJ",
    avatarColor: "#D4936B",
    topicTitle: "Season",
    question: "Alex & Jordan have a favourite season — which is yours?",
    options: [
      { label: "Summer" },
      { label: "Spring" },
      { label: "Autumn" },
      { label: "Winter" },
    ],
    selectedIndex: 0,
    pledgeAmount: "£20",
    charity: "RNLI",
    revealLabel: "Alex & Jordan's reveal",
    revealText:
      "Summer — they got engaged on a beach at sunset and they've never got over it.",
    barLabels: ["Summer", "Spring", "Autumn", "Winter"],
    barWidths: [74, 52, 31, 15],
    barAmounts: ["£310", "£215", "£130", "£60"],
    total: "£715",
    totalLabel: "raised for RNLI",
  },
  {
    occasion: "Wedding",
    occasionTag: "Congratulations!",
    protagonistName: "Sarah & Tom",
    protagonistInitials: "ST",
    avatarColor: "#534AB7",
    topicTitle: "Season",
    question: "Sarah & Tom have a favourite season — which is yours?",
    options: [
      { label: "Summer" },
      { label: "Spring" },
      { label: "Autumn" },
      { label: "Winter" },
    ],
    selectedIndex: 0,
    pledgeAmount: "£5",
    charity: "RNLI",
    revealLabel: "Sarah & Tom's reveal",
    revealText: "Summer — they met on a beach and they've never got over it.",
    barLabels: ["Summer", "Spring", "Autumn", "Winter"],
    barWidths: [74, 52, 31, 15],
    barAmounts: ["£310", "£215", "£130", "£60"],
    total: "£715",
    totalLabel: "raised for RNLI",
  },
  {
    occasion: "Graduation",
    occasionTag: "Happy Graduation",
    protagonistName: "James Okafor",
    protagonistInitials: "JO",
    avatarColor: "#5B9BD5",
    topicTitle: "Film",
    question:
      "James has a favourite film he could watch again and again — what's yours?",
    options: [
      { label: "It's a Wonderful Life" },
      { label: "Casablanca" },
      { label: "The Sound of Music" },
      { label: "Shawshank" },
    ],
    selectedIndex: 3,
    pledgeAmount: "£20",
    charity: "Cancer Research UK",
    revealLabel: "James's reveal",
    revealText: "It's a Wonderful Life. He cried every time and denied it.",
    barLabels: [
      "It's a Wonderful Life",
      "Casablanca",
      "The Sound of Music",
      "Shawshank",
    ],
    barWidths: [68, 44, 32, 20],
    barAmounts: ["£270", "£175", "£125", "£80"],
    total: "£650",
    totalLabel: "raised for Cancer Research UK",
  },
]

const OCCASION_CHIPS = SCENES.map((s, i) => ({ label: s.occasion, index: i }))
const PLEDGE_AMOUNTS = ["£5", "£10", "£20", "£50"]

const SCENE_EYEBROWS = [
  "In memory of someone you loved",
  "For the birthday they'll remember",
  "After a lifetime of good work",
  "The yes that changes everything",
  "On the day they say yes",
  "As they take their next step",
]

const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const revealVariant = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

const FAST: Transition = { duration: 0.2 }
const MEDIUM: Transition = { duration: 0.3, ease: "easeInOut" }
const SLOW: Transition = { duration: 0.45, ease: "easeInOut" }

export function HeroDemoPanel() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [sceneIndex, setSceneIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(
    prefersReducedMotion ? "reveal" : "arriving"
  )
  const [barWidths, setBarWidths] = useState<number[]>(
    prefersReducedMotion ? SCENES[0].barWidths : [0, 0, 0, 0]
  )
  const [fading, setFading] = useState(false)

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAll = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  const addT = (fn: () => void, ms: number) =>
    timeouts.current.push(setTimeout(fn, ms))

  useEffect(() => {
    if (prefersReducedMotion) return

    clearAll()

    const scene = SCENES[sceneIndex]

    addT(() => setPhase("selected"), 3000)
    addT(() => setPhase("pledge-panel"), 5000)
    addT(() => setPhase("amount-picked"), 6800)
    addT(() => setPhase("pledging"), 8200)
    addT(() => setPhase("confirmed"), 8500)
    addT(() => setPhase("clearing"), 9800)
    addT(() => setPhase("reveal"), 10400)

    scene.barWidths.forEach((w, i) => {
      addT(
        () =>
          setBarWidths((prev) => {
            const next = [...prev]
            next[i] = w
            return next
          }),
        11000 + i * 200
      )
    })

    addT(() => setFading(true), 19000)
    addT(() => {
      setPhase("arriving")
      setBarWidths([0, 0, 0, 0])
      setFading(false)
      setSceneIndex((i) => (i + 1) % SCENES.length)
    }, 19500)

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  const handleOccasionClick = (index: number) => {
    if (index === sceneIndex) return
    clearAll()
    setFading(true)
    setTimeout(() => {
      setPhase("arriving")
      setBarWidths([0, 0, 0, 0])
      setFading(false)
      setSceneIndex(index)
    }, 400)
  }

  const scene = SCENES[sceneIndex]
  const eyebrow = SCENE_EYEBROWS[sceneIndex]

  const stepLabels: Record<Phase, string> = {
    arriving: "Choose your favourite",
    selected: "Your choice",
    "pledge-panel": "Choose an amount",
    "amount-picked": "Ready to pledge",
    pledging: "Pledging…",
    confirmed: "Pledged ✓",
    clearing: "",
    reveal: scene.revealLabel,
  }
  const stepLabel = stepLabels[phase]

  const showOptions = phase === "arriving" || phase === "selected"
  const showPledgePanel =
    phase === "pledge-panel" ||
    phase === "amount-picked" ||
    phase === "pledging" ||
    phase === "confirmed"
  const showToast = phase === "confirmed"
  const showReveal = phase === "reveal"

  return (
    <section id="how-it-works" className="border-b border-border bg-muted">
      <div className="mx-auto max-w-330">
        {/* Split — pitch left, demo right */}
        <div className="mx-auto flex h-158 w-full max-w-330">
          {/* Left — pitch copy */}
          <div
            className="flex flex-col justify-center px-9 py-11"
            style={{ flex: "1.05", borderRight: "0.5px solid var(--border)" }}
          >
            {/* Eyebrow — updates with scene */}
            <div className="mb-2 h-3.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`eyebrow-${sceneIndex}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SectionEyebrow>{eyebrow}</SectionEyebrow>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Headline — fixed */}
            <h1 className="mb-[1.1rem] text-5xl leading-[1.15] font-light tracking-tight text-foreground">
              A new way to
              <br />
              <span className="font-medium">honour them.</span>
            </h1>

            {/* Supporting line — fixed */}
            <p className="mb-7 max-w-[320px] text-xl leading-relaxed text-muted-foreground">
              Expressions of joy, for charitable causes, in the name of those we
              love.
            </p>

            {/* CTA — fixed */}
            <div className="flex items-center gap-3.5">
              <Button asChild>
                <Link href="/events/new">Create an event</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/events">See live events →</Link>
              </Button>
            </div>
          </div>

          {/* Right — demo card (desktop only) */}
          <div
            className="hidden flex-col p-5 md:flex"
            style={{ flex: "0.95" }}
          >
            {/* Occasion chips */}
            <div className="mb-3 flex flex-wrap gap-1.25">
              {OCCASION_CHIPS.map(({ label, index }) => (
                <Chip
                  key={label}
                  selected={index === sceneIndex}
                  onClick={() => handleOccasionClick(index)}
                  className="py-1 text-[11px]"
                >
                  {label}
                </Chip>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <span className="sr-only">
                Animated demonstration of how favpoll works, showing a{" "}
                {scene.occasion.toLowerCase()} event. The demonstration cycles
                through occasion types automatically. Use the buttons above to
                jump to a specific occasion.
              </span>

              <div
                className="flex flex-1 flex-col transition-opacity duration-400"
                style={{ opacity: fading ? 0 : 1 }}
                aria-live="polite"
              >
                <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-background p-5">
                  <div className="space-y-4">
                    {/* Occasion tag — fades in first */}
                    <motion.div
                      key={`card-occasion-${sceneIndex}`}
                      {...fadeUp}
                      transition={
                        prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0 }
                      }
                    >
                      <OccasionTag label={scene.occasionTag} />
                    </motion.div>

                    {/* Protagonist avatar + name — fades in just after eyebrow */}
                    <motion.div
                      key={`protagonist-${sceneIndex}`}
                      {...fadeUp}
                      transition={
                        prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.08 }
                      }
                      className="flex items-center gap-4 border-b pb-4"
                    >
                      <div
                        className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full text-xl font-medium text-white"
                        style={{ backgroundColor: scene.avatarColor }}
                        aria-hidden="true"
                      >
                        {scene.protagonistInitials}
                      </div>
                      <span className="text-4xl leading-tight font-medium tracking-tight text-foreground">
                        {scene.protagonistName}
                      </span>
                    </motion.div>

                    {/* Title — arrives slightly later */}
                    <motion.div
                      key={`title-${sceneIndex}`}
                      {...fadeUp}
                      transition={
                        prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.2 }
                      }
                    >
                      <h2 className="text-3xl font-medium tracking-tight text-foreground">
                        Favourite {scene.topicTitle}
                      </h2>
                    </motion.div>

                    {/* Framing */}
                    <motion.p
                      key={`framing-${sceneIndex}`}
                      {...fadeUp}
                      transition={
                        prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.32 }
                      }
                      className="text-lg leading-7 text-muted-foreground"
                    >
                      {scene.question}
                    </motion.p>

                    {/* Poll options */}
                    <AnimatePresence>
                      {showOptions && (
                        <motion.div
                          key="options"
                          {...fadeIn}
                          exit={{ opacity: 0 }}
                          transition={prefersReducedMotion ? FAST : MEDIUM}
                          className="flex flex-wrap gap-1.5"
                        >
                          {scene.options.map((opt, i) => (
                            <motion.div
                              key={opt.label}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{
                                opacity:
                                  phase === "selected" &&
                                  i !== scene.selectedIndex
                                    ? 0.3
                                    : 1,
                                y: 0,
                                scale:
                                  phase === "selected" &&
                                  i === scene.selectedIndex
                                    ? 1.02
                                    : 1,
                              }}
                              transition={
                                prefersReducedMotion
                                  ? FAST
                                  : {
                                      ...MEDIUM,
                                      delay:
                                        phase === "arriving"
                                          ? 0.3 + i * 0.08
                                          : 0,
                                    }
                              }
                              className={cn(
                                "rounded-full px-3 py-1.5 text-[11.5px] transition-colors duration-200",
                                phase !== "arriving" &&
                                  i === scene.selectedIndex
                                  ? "bg-[#534AB7] font-medium text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {opt.label}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Pledge panel — amounts + button */}
                    <AnimatePresence>
                      {showPledgePanel && (
                        <motion.div
                          key="pledge-panel"
                          {...fadeUp}
                          exit={{ opacity: 0, y: 4 }}
                          transition={
                            prefersReducedMotion
                              ? FAST
                              : { ...MEDIUM, delay: 0.3 }
                          }
                          className="space-y-3"
                        >
                          {/* Amount buttons */}
                          <div className="flex gap-1.5">
                            {PLEDGE_AMOUNTS.map((amt, i) => (
                              <motion.div
                                key={amt}
                                initial={{ opacity: 0, y: 3 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={
                                  prefersReducedMotion
                                    ? FAST
                                    : { ...MEDIUM, delay: 0.06 * i }
                                }
                                className={cn(
                                  "flex-1 rounded-md border py-1 text-center text-[11px] transition-colors duration-200",
                                  amt === scene.pledgeAmount &&
                                    (phase === "amount-picked" ||
                                      phase === "pledging" ||
                                      phase === "confirmed")
                                    ? "border-[#534AB7] bg-[#534AB7] text-white"
                                    : "border-border bg-background text-muted-foreground"
                                )}
                              >
                                {amt}
                              </motion.div>
                            ))}
                          </div>

                          {/* Pledge button */}
                          <motion.div
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={
                              prefersReducedMotion
                                ? FAST
                                : {
                                    ...MEDIUM,
                                    delay: 0.18 + PLEDGE_AMOUNTS.length * 0.06,
                                  }
                            }
                          >
                            <Button
                              className={cn(
                                "w-full transition-all duration-150",
                                phase === "pledging"
                                  ? "scale-[0.97] opacity-80"
                                  : "",
                                phase === "pledge-panel"
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              )}
                              disabled={phase === "pledge-panel"}
                              aria-hidden="true"
                            >
                              Pledge favourites
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Reveal — arrives from above */}
                    <AnimatePresence>
                      {showReveal && (
                        <motion.div
                          key="reveal"
                          {...revealVariant}
                          transition={prefersReducedMotion ? FAST : SLOW}
                        >
                          <RevealQuote
                            text={scene.revealText}
                            aria-live="polite"
                            role="status"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Rankings */}
                    <AnimatePresence>
                      {showReveal && (
                        <motion.div
                          key="rankings"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            prefersReducedMotion
                              ? FAST
                              : { ...MEDIUM, delay: 0.3 }
                          }
                        >
                          <ol
                            className="space-y-2.5"
                            aria-label="Current rankings"
                          >
                            {scene.barLabels.map((label, i) => (
                              <li key={label}>
                                <RankingBar
                                  label={label}
                                  amount={scene.barAmounts[i]}
                                  widthPercent={barWidths[i] ?? 0}
                                  barStyle={{
                                    background: i === 0 ? "#534AB7" : "#AFA9EC",
                                    transition: prefersReducedMotion
                                      ? "none"
                                      : `width ${700 + i * 80}ms ease-out`,
                                  }}
                                />
                              </li>
                            ))}
                          </ol>
                          <div className="mt-3 flex items-baseline justify-between pt-2.5">
                            <span className="text-[11px] text-muted-foreground">
                              {scene.totalLabel}
                            </span>
                            <span className="text-[14px] font-medium text-[#534AB7]">
                              {scene.total}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Toast — absolute bottom of card */}
                  <AnimatePresence>
                    {showToast && (
                      <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={prefersReducedMotion ? FAST : MEDIUM}
                        className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-lg border border-[#1D9E75]/30 bg-[#E1F5EE] px-3 py-2 shadow-sm"
                      >
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                        <p className="text-[12px] text-[#1D9E75]">
                          <strong>Pledge confirmed</strong> ·{" "}
                          {scene.pledgeAmount} for {scene.charity}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step label */}
                <p className="mt-2.5 h-3.5 shrink-0 text-center text-[10px] font-medium tracking-[0.07em] text-muted-foreground uppercase">
                  {stepLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
