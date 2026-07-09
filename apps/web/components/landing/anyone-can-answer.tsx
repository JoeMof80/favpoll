"use client"

// Mirrors the REAL organiser flow for a custom topic (TopicItemsDialog): the
// question is written, then each answer is typed into the "Search or add …
// options" field, the Add button appears, and the answer lands as a removable
// chip under "Added by you" — the same components and copy the app uses.
// Scripted loop; reduced motion gets the final frame.
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Chip } from "@/components/ui/chip"
import { InputGroupButton } from "@/components/ui/input-group"

const QUESTION = "Favourite meeting room"
const ITEMS = ["The fishbowl", "Third-floor corner", "The one with the sofa"]

const TYPE_MS = 45
const ADD_FLASH_MS = 350
const BETWEEN_ITEMS_MS = 650
const HOLD_MS = 4200

type Phase =
  | { kind: "title"; count: number }
  | { kind: "typing"; item: number; count: number }
  | { kind: "adding"; item: number }
  | { kind: "hold" }

export function AnyoneCanAnswer() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(
    reduced ? { kind: "hold" } : { kind: "title", count: 0 }
  )

  useEffect(() => {
    if (reduced) return
    let id: ReturnType<typeof setTimeout>

    if (phase.kind === "title") {
      if (phase.count < QUESTION.length) {
        id = setTimeout(
          () => setPhase({ kind: "title", count: phase.count + 1 }),
          TYPE_MS
        )
      } else {
        id = setTimeout(
          () => setPhase({ kind: "typing", item: 0, count: 0 }),
          BETWEEN_ITEMS_MS
        )
      }
    } else if (phase.kind === "typing") {
      const label = ITEMS[phase.item]
      if (phase.count < label.length) {
        id = setTimeout(
          () =>
            setPhase({
              kind: "typing",
              item: phase.item,
              count: phase.count + 1,
            }),
          TYPE_MS
        )
      } else {
        id = setTimeout(
          () => setPhase({ kind: "adding", item: phase.item }),
          ADD_FLASH_MS
        )
      }
    } else if (phase.kind === "adding") {
      id = setTimeout(() => {
        const next = phase.item + 1
        setPhase(
          next < ITEMS.length
            ? { kind: "typing", item: next, count: 0 }
            : { kind: "hold" }
        )
      }, BETWEEN_ITEMS_MS)
    } else {
      id = setTimeout(() => setPhase({ kind: "title", count: 0 }), HOLD_MS)
    }
    return () => clearTimeout(id)
  }, [phase, reduced])

  const titleShown =
    phase.kind === "title" ? QUESTION.slice(0, phase.count) : QUESTION
  const titleTyping = phase.kind === "title" && phase.count < QUESTION.length

  const inputText =
    phase.kind === "typing"
      ? ITEMS[phase.item].slice(0, phase.count)
      : phase.kind === "adding"
        ? ITEMS[phase.item]
        : ""
  const showAdd = inputText.length > 0
  const addPressed = phase.kind === "adding"

  const added =
    phase.kind === "title"
      ? []
      : phase.kind === "hold"
        ? ITEMS
        : ITEMS.slice(0, phase.item)

  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Colour, season, biscuit — the built-in questions need no expertise, so
        everyone takes part as equals. Or write your own question and answers,
        for an office, a club, a family.
      </p>

      {/* The app's own add-options interaction, replayed */}
      <div
        className="min-h-52 rounded-xl border border-border bg-background p-5"
        aria-hidden="true"
      >
        <p className="text-lg font-medium tracking-tight text-foreground">
          {titleShown || " "}
          {titleTyping && <span className="opacity-40">|</span>}
        </p>

        {/* "Search or add … options" field + Add button (as in the dialog) */}
        <div className="mt-3 flex h-9 items-center gap-2 border-b border-border pb-2">
          <span
            className={
              inputText
                ? "flex-1 text-base text-foreground"
                : "flex-1 text-base text-muted-foreground/50"
            }
          >
            {inputText || "Search or add meeting room options…"}
            {phase.kind === "typing" && <span className="opacity-40">|</span>}
          </span>
          {showAdd && (
            <InputGroupButton
              className={addPressed ? "scale-[0.96] brightness-95" : ""}
            >
              Add
            </InputGroupButton>
          )}
        </div>

        {/* Added by you — chips land exactly as in the app */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium tracking-widest text-primary uppercase">
            Added by you
          </p>
          <div className="flex min-h-8 flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {added.map((label) => (
                <motion.span
                  key={label}
                  initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Chip size="lg" onRemove={() => {}} removeLabel="Remove">
                    {label}
                  </Chip>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
