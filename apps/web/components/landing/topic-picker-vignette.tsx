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
// Both pickers now carry a PERSISTENT hint under the field, and so does this
// (2026-08-13). The Add used to appear only once a search matched nothing,
// which meant the option was found only by people who already suspected it —
// so the vignette was depicting a discoverable affordance that was not one.
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
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

// Slowed throughout (founder, 2026-08-13) — the sequence advanced faster
// than it could be read. STEP_HOLD_MS is the new one that matters: a pause on
// each COMPLETED step before the next dialog replaces it, so there is a
// moment where the finished state is just sitting there to be looked at.
const TYPE_MS = 55
const ADD_FLASH_MS = 420
const BETWEEN_ITEMS_MS = 600
const STEP_HOLD_MS = 1800
const DIALOG_ENTER_MS = 700
const HOLD_MS = 3800

type Phase =
  | { kind: "search"; count: number } // dialog 1: typing the topic
  | { kind: "create" } // dialog 1: Add pressed
  | { kind: "typing"; item: number; count: number } // dialog 2
  | { kind: "adding"; item: number } // dialog 2: Add pressed
  | { kind: "guest-enter" } // dialog 3 slides in
  | { kind: "guest-typing"; count: number } // dialog 3: the guest searches
  | { kind: "guest-adding" } // dialog 3: Add pressed
  | { kind: "hold" }

// The word Add in the hint, wearing the button's own chrome — the
// instruction says "click Add", so it has to point at something the
// reader will recognise when they see it.
const ADD_TOKEN = (
  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
    Add
  </span>
)

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
      // Hold on the finished topic step before the items dialog takes over.
      id = setTimeout(
        () => setPhase({ kind: "typing", item: 0, count: 0 }),
        STEP_HOLD_MS
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
      const last = phase.item + 1 >= ITEMS.length
      id = setTimeout(
        () => {
          const next = phase.item + 1
          setPhase(
            next < ITEMS.length
              ? { kind: "typing", item: next, count: 0 }
              : { kind: "guest-enter" }
          )
        },
        // A longer beat on the last one: that frame is the completed step.
        last ? STEP_HOLD_MS : BETWEEN_ITEMS_MS
      )
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
      id = setTimeout(() => setPhase({ kind: "hold" }), STEP_HOLD_MS)
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

  // ONE DIALOG AT A TIME (founder, 2026-08-13). The three used to stack and
  // fan, which showed a state the app never has — you only ever see one
  // overlay. Stepping through is truer, and it lets each dialog take the
  // whole frame instead of 86% of it at a tilt, so the type is legible.
  //
  // What the stack conveyed for free was that there ARE three surfaces. The
  // caption and dots pay that back, and name who is acting, which the stack
  // never did: the first two are the organiser, the third a guest on a
  // different day.
  const step =
    phase.kind === "search" || phase.kind === "create"
      ? 0
      : phase.kind === "typing" || phase.kind === "adding"
        ? 1
        : 2
  const CAPTIONS = [
    "An organiser writes a question the list has not got",
    "…and adds the answers",
    "Later, a guest adds one nobody thought of",
  ]

  return (
    <Vignette>
      {/* Caption + dots, so a glance says where in the sequence this is and
          that there are three steps — the one thing the stack gave away for
          nothing. */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{CAPTIONS[step]}</p>
        <div className="flex shrink-0 gap-1.5">
          {CAPTIONS.map((c, i) => (
            <span
              key={c}
              className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      {/* One dialog, one size, one place. min-h is the tallest step — the
          items dialog at 224px, with its footer — so the frame holds a single
          height and the section below never jumps. */}
      <div className="relative min-h-60">
        <AnimatePresence initial={false} mode="wait">
          {step === 0 && (
            <motion.div
              key="topic"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
            >
              {/* love-step's picker: a bordered field in a header with a rule
                  under it, then the topic chips below. */}
              <div className="border-b border-border px-5 py-4">
                <InputGroup className="h-auto rounded-md">
                  <span
                    className={`h-auto flex-1 px-3 py-2 text-base ${searchText ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {searchText || "Search topics…"}
                    {searchTyping && <span className="opacity-40">|</span>}
                  </span>
                  {searchAddVisible && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        className={
                          searchAddPressed ? "scale-[0.96] brightness-95" : ""
                        }
                      >
                        Add
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                  {!searchAddVisible && (
                    <InputGroupAddon align="block-end" className="pt-0 pb-2">
                      <span className="text-xs text-muted-foreground">
                        Is your topic missing? Type it and click {ADD_TOKEN}
                      </span>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
              <div className="flex min-h-8 flex-wrap gap-1.5 px-5 py-4">
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
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="items"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
            >
              {/* TopicItemsDialog's three bands: header (title + field), body
                  (the chips), and a footer with Cancel / Done behind a rule —
                  ResponsiveOverlay's own shape. Without the footer this read
                  as a card rather than a dialog. */}
              <div className="space-y-2 px-4 py-4">
                <p className="text-lg font-medium tracking-tight text-foreground">
                  {HEADING}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex-1 text-base ${inputText ? "text-foreground" : "text-muted-foreground/50"}`}
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
              </div>
              <div className="px-4 pb-4">
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
              <div className="flex gap-2 border-t border-border px-4 py-3">
                <Button type="button" variant="ghost" className="flex-1">
                  Cancel
                </Button>
                <Button type="button" className="flex-1">
                  Done
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="guest"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-x-0 top-0 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
            >
              {/* PickerHeader's own shape: a block-start addon carrying the
                  eyebrow, then a wrapping row of chips and the field. */}
              <InputGroup className="h-auto rounded-none border-0 shadow-none">
                <InputGroupAddon align="block-start" className="px-5 pt-4 pb-0">
                  <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Your favourite
                  </span>
                </InputGroupAddon>
                <div className="flex w-full flex-wrap items-center gap-2 px-5 py-3">
                  {guestPicked ? (
                    <Chip size="lg" selected>
                      {GUEST_ITEM}
                    </Chip>
                  ) : (
                    <span
                      className={`min-w-30 flex-1 text-base ${guestText ? "text-foreground" : "text-muted-foreground/50"}`}
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
                {!guestNoMatch && (
                  <InputGroupAddon align="block-end" className="px-5 pt-0 pb-3">
                    <span className="text-xs text-muted-foreground">
                      Is yours missing? Type it and click {ADD_TOKEN}
                    </span>
                  </InputGroupAddon>
                )}
              </InputGroup>
              {/* The organiser's three, which the guest reads before finding
                  theirs is not among them. */}
              <div className="flex min-h-8 flex-wrap gap-1.5 px-5 pb-4">
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
