"use client"

// The whole life of a custom topic, in the app's own three dialogs:
//   1. The wizard's "Pick a topic" overlay — the organiser types a topic the
//      catalogue has not got, the suggested chips filter away, and Add
//      creates it.
//   2. TopicItemsDialog slides in front — each favourite is typed into the
//      "Add … options" field and lands as a removable chip under "Added by
//      you".
//   3. The pledge dialog's favourite picker, days later, on a guest's phone —
//      they search for one the organiser never thought of, nothing matches,
//      and the same Add makes it theirs (founder, 2026-08-09).
//
// Beat 3 was added because the lead gives guest additions a third of its
// sentence and the picture stopped at the organiser. It extends rather than
// interrupts: the guest picker is a search field with an Add, which is the
// idiom beat 1 already runs.
//
// NOT shown, deliberately: the organiser hiding an addition. That happens on
// the standings, after an email, hours or days later — putting it in a dialog
// sequence would say it happens in the same sitting. It is also a reassurance
// rather than a feature, and a picture of a hide toggle would make the
// reassurance louder than the thing it reassures about.
//
// Scripted loop; reduced motion gets the final frame.
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Chip } from "@/components/ui/chip"
import { InputGroupButton } from "@/components/ui/input-group"
import { Vignette } from "@/components/landing/vignette"

// STORED WITHOUT "Favourite" (2026-08-09). Every surface prefixes it —
// TopicItemsDialog's heading is `Favourite ${topicTitle}`, the pack card
// prints `Favourite {topicTitle.toLowerCase()}`, and the guest picker's
// placeholder is `Search for your favourite ${topicTitle.toLowerCase()}…`.
// This vignette typed "Favourite Grandad story" INTO the topic search, which
// no organiser would, and which beat 3 would have rendered as "Search for
// your favourite favourite grandad story…".
const TOPIC = "Grandad story"
const HEADING = `Favourite ${TOPIC}`

// A family in-joke no catalogue could ever hold — the purest case for the
// create path. The items are meaningless to strangers and everything to the
// guest list.
const ITEMS = [
  "The wheelbarrow incident",
  "The time he met Elvis",
  "The allotment feud",
]
// What the organiser never thought of, added by a guest at pledge time.
const GUEST_ITEM = "The great chip pan fire"

// Real canonical topics shown in the picker before the search filters them out.
const SUGGESTED_TOPICS = ["Colour", "Season", "Song", "Film", "Biscuit"]

const TYPE_MS = 35
const ADD_FLASH_MS = 320
const BETWEEN_ITEMS_MS = 500
const DIALOG_ENTER_MS = 600
const HOLD_MS = 4200

type Phase =
  | { kind: "search"; count: number } // dialog 1: typing the topic
  | { kind: "create" } // dialog 1: Add pressed
  | { kind: "typing"; item: number; count: number } // dialog 2
  | { kind: "adding"; item: number } // dialog 2: Add pressed
  | { kind: "guest-enter" } // dialog 3 slides in
  | { kind: "guest-typing"; count: number } // dialog 3: the guest searches
  | { kind: "guest-adding" } // dialog 3: Add pressed
  | { kind: "hold" }

export function TopicPickerVignette() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(
    reduced ? { kind: "hold" } : { kind: "search", count: 0 }
  )

  useEffect(() => {
    if (reduced) return
    let id: ReturnType<typeof setTimeout>

    if (phase.kind === "search") {
      if (phase.count < TOPIC.length) {
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
            : { kind: "guest-enter" }
        )
      }, BETWEEN_ITEMS_MS)
    } else if (phase.kind === "guest-enter") {
      id = setTimeout(
        () => setPhase({ kind: "guest-typing", count: 0 }),
        DIALOG_ENTER_MS
      )
    } else if (phase.kind === "guest-typing") {
      if (phase.count < GUEST_ITEM.length) {
        id = setTimeout(
          () => setPhase({ kind: "guest-typing", count: phase.count + 1 }),
          TYPE_MS
        )
      } else {
        id = setTimeout(() => setPhase({ kind: "guest-adding" }), ADD_FLASH_MS)
      }
    } else if (phase.kind === "guest-adding") {
      id = setTimeout(() => setPhase({ kind: "hold" }), BETWEEN_ITEMS_MS)
    } else {
      id = setTimeout(() => setPhase({ kind: "search", count: 0 }), HOLD_MS)
    }
    return () => clearTimeout(id)
  }, [phase, reduced])

  // ── Dialog 1 (Pick a topic) ────────────────────────────────────────────────
  const searchText =
    phase.kind === "search" ? TOPIC.slice(0, phase.count) : TOPIC
  const searchTyping = phase.kind === "search" && phase.count < TOPIC.length
  // The picker's chips filter away once the search stops matching them.
  const topicsVisible = phase.kind === "search" && phase.count < 3
  const searchAddVisible = searchText.length > 0
  const searchAddPressed = phase.kind === "create"

  // ── Dialog 2 (items) ───────────────────────────────────────────────────────
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
    phase.kind === "typing" || phase.kind === "adding"
      ? ITEMS.slice(0, phase.item)
      : ITEMS

  // ── Dialog 3 (the guest's picker) ──────────────────────────────────────────
  const guestOpen =
    phase.kind === "guest-enter" ||
    phase.kind === "guest-typing" ||
    phase.kind === "guest-adding" ||
    phase.kind === "hold"
  const guestText =
    phase.kind === "guest-typing"
      ? GUEST_ITEM.slice(0, phase.count)
      : phase.kind === "guest-enter"
        ? ""
        : GUEST_ITEM
  const guestTyping =
    phase.kind === "guest-typing" && phase.count < GUEST_ITEM.length
  // The organiser's three clear the moment nothing matches, which is the
  // app's own showCreate state: the Add appears exactly when the list empties.
  const guestNoMatch = guestText.length >= 3
  const guestPicked = phase.kind === "guest-adding" || phase.kind === "hold"
  const guestAddPressed = phase.kind === "guest-adding"

  return (
    <Vignette>
      <div className="relative min-h-[27.5rem]">
        {/* ── 1. The wizard's "Pick a topic" overlay ── */}
        <div className="absolute top-0 left-0 w-[86%] -rotate-1 rounded-xl border border-border bg-background p-5 shadow-lg">
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

        {/* ── 2. TopicItemsDialog, sliding in front once the topic exists ── */}
        <AnimatePresence initial={false}>
          {(itemsOpen || reduced) && (
            <motion.div
              key="items-dialog"
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-16 left-[8%] w-[88%] rotate-1 rounded-xl border border-border bg-background p-5 shadow-xl"
            >
              <p className="text-lg font-medium tracking-tight text-foreground">
                {HEADING}
              </p>

              <div className="mt-3 flex h-9 items-center gap-2">
                <span
                  className={
                    inputText
                      ? "flex-1 text-base text-foreground"
                      : "flex-1 text-base text-muted-foreground/50"
                  }
                >
                  {inputText || `Add ${TOPIC.toLowerCase()} options…`}
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

        {/* ── 3. A guest's favourite picker, inside the pledge dialog.
              Sits BELOW dialog 2's chips rather than over them: the guest's
              addition only means anything beside the organiser's three, and
              a stack that covered them would leave the last frame showing a
              favourite with nothing to be missing from. 276px is measured:
              dialog 2's chips end at 273, so this clears them and overlaps
              only its padding. ── */}
        <AnimatePresence initial={false}>
          {(guestOpen || reduced) && (
            <motion.div
              key="guest-picker"
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-[17.25rem] left-[3%] w-[90%] -rotate-1 rounded-xl border border-border bg-background p-5 shadow-2xl"
            >
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Your favourite
              </p>

              <div className="mt-2 flex min-h-9 flex-wrap items-center gap-2">
                {guestPicked ? (
                  <Chip size="lg" readOnly selected>
                    {GUEST_ITEM}
                  </Chip>
                ) : (
                  <span
                    className={
                      guestText
                        ? "flex-1 text-base text-foreground"
                        : "flex-1 text-base text-muted-foreground/50"
                    }
                  >
                    {guestText ||
                      `Search for your favourite ${TOPIC.toLowerCase()}…`}
                    {guestTyping && <span className="opacity-40">|</span>}
                  </span>
                )}
                {guestNoMatch && !guestPicked && (
                  <InputGroupButton
                    className={
                      guestAddPressed
                        ? "shrink-0 scale-[0.96] brightness-95"
                        : "shrink-0"
                    }
                  >
                    Add
                  </InputGroupButton>
                )}
              </div>

              {/* The organiser's three, which the guest reads before finding
                  theirs is not among them. */}
              <div className="mt-4 flex min-h-8 flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {!guestNoMatch &&
                    ITEMS.map((label) => (
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
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Vignette>
  )
}
