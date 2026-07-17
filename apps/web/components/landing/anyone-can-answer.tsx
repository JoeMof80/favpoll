"use client"

// Mirrors the REAL organiser flow for a custom topic, both dialogs in
// sequence, using the app's own copy:
//   1. The wizard's "Pick a topic" overlay — the question is typed into
//      "Search topics…", the suggested topic chips filter away, and the Add
//      button creates the custom topic.
//   2. TopicItemsDialog slides in front — each answer is typed into the
//      "Add … options" field and lands as a removable chip under "Added by
//      you".
// Scripted loop; reduced motion gets the final frame (both dialogs, all
// chips).
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Chip } from "@/components/ui/chip"
import { InputGroupButton } from "@/components/ui/input-group"

const QUESTION = "Favourite meeting room"
const ITEMS = ["The fishbowl", "Third-floor corner", "The one with the sofa"]
// Real canonical topics shown in the picker before the search filters them out.
const SUGGESTED_TOPICS = ["Colour", "Season", "Song", "Film", "Biscuit"]

const TYPE_MS = 45
const ADD_FLASH_MS = 350
const BETWEEN_ITEMS_MS = 650
const DIALOG_ENTER_MS = 600
const HOLD_MS = 4200

type Phase =
  | { kind: "search"; count: number } // dialog 1: typing the question
  | { kind: "create" } // dialog 1: Add pressed
  | { kind: "typing"; item: number; count: number } // dialog 2
  | { kind: "adding"; item: number } // dialog 2: Add pressed
  | { kind: "hold" }

export function AnyoneCanAnswer() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(
    reduced ? { kind: "hold" } : { kind: "search", count: 0 }
  )

  useEffect(() => {
    if (reduced) return
    let id: ReturnType<typeof setTimeout>

    if (phase.kind === "search") {
      if (phase.count < QUESTION.length) {
        id = setTimeout(
          () => setPhase({ kind: "search", count: phase.count + 1 }),
          TYPE_MS
        )
      } else {
        id = setTimeout(() => setPhase({ kind: "create" }), ADD_FLASH_MS)
      }
    } else if (phase.kind === "create") {
      id = setTimeout(
        () => setPhase({ kind: "typing", item: 0, count: 0 }),
        DIALOG_ENTER_MS
      )
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
      id = setTimeout(() => setPhase({ kind: "search", count: 0 }), HOLD_MS)
    }
    return () => clearTimeout(id)
  }, [phase, reduced])

  // ── Dialog 1 (Pick a topic) state ──────────────────────────────────────────
  const searchText =
    phase.kind === "search" ? QUESTION.slice(0, phase.count) : QUESTION
  const searchTyping = phase.kind === "search" && phase.count < QUESTION.length
  // The picker's chips filter away once the search stops matching them.
  const topicsVisible = phase.kind === "search" && phase.count < 3
  const searchAddVisible = searchText.length > 0
  const searchAddPressed = phase.kind === "create"

  // ── Dialog 2 (items) state ─────────────────────────────────────────────────
  const itemsOpen = phase.kind !== "search" && phase.kind !== "create"
  const inputText =
    phase.kind === "typing"
      ? ITEMS[phase.item].slice(0, phase.count)
      : phase.kind === "adding"
        ? ITEMS[phase.item]
        : ""
  const showAdd = inputText.length > 0
  const addPressed = phase.kind === "adding"
  const added =
    phase.kind === "hold"
      ? ITEMS
      : phase.kind === "typing" || phase.kind === "adding"
        ? ITEMS.slice(0, phase.item)
        : []

  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <div className="max-w-md">
        <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
          Create or curate your favpoll
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Pick from many favpoll topics, or create your own. Feel free to add
          any missing favourites — guests can too, with your blessing.
        </p>
      </div>

      {/* The app's own two dialogs, replayed in sequence */}
      <div className="relative min-h-72" aria-hidden="true">
        {/* Dialog 1 — the wizard's "Pick a topic" overlay */}
        <div className="absolute top-0 left-0 w-[88%] -rotate-1 rounded-xl border border-border bg-background p-5 shadow-lg">
          <div className="flex h-9 items-center gap-2">
            <span
              className={
                searchText
                  ? "flex-1 text-base text-foreground"
                  : "flex-1 text-base text-muted-foreground/50"
              }
            >
              {searchText || "Search topics…"}
              {searchTyping && <span className="opacity-40">|</span>}
            </span>
            {searchAddVisible && (
              <InputGroupButton
                className={searchAddPressed ? "scale-[0.96] brightness-95" : ""}
              >
                Add
              </InputGroupButton>
            )}
          </div>
          {/* Canonical topic chips, filtered away by the custom question */}
          <div className="mt-4 flex min-h-8 flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {topicsVisible &&
                SUGGESTED_TOPICS.map((label) => (
                  <motion.span
                    key={label}
                    initial={false}
                    exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeIn" }}
                  >
                    <Chip size="lg" readOnly>
                      {label}
                    </Chip>
                  </motion.span>
                ))}
              {!topicsVisible && (
                <motion.p
                  key="no-match"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground/60"
                >
                  No matching topics — add your own.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dialog 2 — TopicItemsDialog, sliding in front once created */}
        <AnimatePresence initial={false}>
          {(itemsOpen || reduced) && (
            <motion.div
              key="items-dialog"
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-16 left-[10%] w-[90%] rotate-1 rounded-xl border border-border bg-background p-5 shadow-xl"
            >
              <p className="text-lg font-medium tracking-tight text-foreground">
                {QUESTION}
              </p>

              {/* "Add … options" field + Add button (as in the dialog) */}
              <div className="mt-3 flex h-9 items-center gap-2">
                <span
                  className={
                    inputText
                      ? "flex-1 text-base text-foreground"
                      : "flex-1 text-base text-muted-foreground/50"
                  }
                >
                  {inputText || "Add meeting room options…"}
                  {phase.kind === "typing" && (
                    <span className="opacity-40">|</span>
                  )}
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
                    {(reduced ? ITEMS : added).map((label) => (
                      <motion.span
                        key={label}
                        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <Chip
                          size="lg"
                          onRemove={() => {}}
                          removeLabel="Remove"
                        >
                          {label}
                        </Chip>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
