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
/**
 * What the vignette types. PARAMETERISED 2026-08-28, when /fundraisers needed
 * this same sequence to show ITS favpoll — Marcus Bell's hat — rather than
 * the grandad stories /features runs. A picture of the custom-topic mechanic
 * beside copy about Marcus, typing someone else's topic, is the same
 * continuity break the flowers and the cake were on the router cards.
 *
 * PASS A MODULE-LEVEL CONSTANT, never an object literal written inline. The
 * animation effect lists `scene` in its dependencies, so a fresh reference on
 * every render would restart the sequence on every render.
 */
export type TopicPickerScene = {
  topic: string
  items: [string, string, string]
  guestItem: string
}

/**
 * A family in-joke no catalogue could ever hold — the purest case for the
 * create path. The items are meaningless to strangers and everything to the
 * guest list.
 *
 * The guest item is KEPT HARMLESS (founder, 2026-08-17). It was "The great
 * chip pan fire", which is a house fire — the only item in the set implying
 * danger, and this topic is one a family will plausibly run at a funeral. The
 * other three are mishap, brush with fame and long-running grudge; a fourth
 * in that key has to be small, specific and fond, the kind of thing only
 * someone who was there still remembers.
 */
export const GRANDAD_STORY_TOPIC: TopicPickerScene = {
  topic: "Grandad story",
  items: [
    "The wheelbarrow incident",
    "The time he met Elvis",
    "The allotment feud",
  ],
  guestItem: "The day he won the meat raffle",
}

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

export function TopicPickerVignette({
  scene = GRANDAD_STORY_TOPIC,
}: { scene?: TopicPickerScene } = {}) {
  // Read into the names the body already uses, so parameterising this cost
  // four lines rather than twenty scattered renames.
  const { topic: TOPIC, items: ITEMS, guestItem: GUEST_ITEM } = scene
  const HEADING = `Favourite ${TOPIC}`

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
  }, [phase, reduced, scene])

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

  // A PROGRESSIVE STACK (founder, 2026-08-17) — completed steps stay on
  // screen, receding behind the active one.
  //
  // This revisits, but does not undo, ONE DIALOG AT A TIME (2026-08-13). That
  // decision killed a stack which fanned all three dialogs at once, tilted, at
  // 86% — so nothing was ever full size and the type was unreadable, and it
  // showed three overlays open together, a state the app never has. Both
  // faults are gone here: only the FRONT layer is a legible, full-size,
  // untilted dialog, and the ones behind it are spent steps rather than
  // simultaneous surfaces — the same thing a card stack means anywhere.
  //
  // What stepping alone could not carry is that the three ACCUMULATE: a topic
  // you made, then favourites in it, then one a guest adds to the same list.
  // Replacing each frame with the next showed three unrelated dialogs; leaving
  // the spent ones visible is what makes it one growing thing.
  const step =
    phase.kind === "search" || phase.kind === "create"
      ? 0
      : phase.kind === "typing" || phase.kind === "adding"
        ? 1
        : 2
  const CAPTIONS = [
    "An organiser writes a topic of their own",
    "…and fills it with favourites",
    "Later, a guest adds one nobody thought of",
  ]

  // Where a layer sits in the stack. Front (depth 0) is the live dialog:
  // full size, full opacity, untilted. Each spent step recedes 14px upward,
  // shrinks 3.5% and dims — enough of its top edge stays proud of the dialog
  // in front to read as a step you have already done, without competing with
  // the one being demonstrated.
  const layer = (index: number) => {
    const depth = step - index
    return {
      animate: {
        opacity: depth === 0 ? 1 : 0.5,
        y: -depth * 14,
        scale: 1 - depth * 0.035,
      },
      // Front-most on top, so each new dialog covers the ones it followed.
      style: { zIndex: 10 - depth, transformOrigin: "top center" as const },
    }
  }

  return (
    <Vignette>
      {/* Caption + dots. The stack now shows how far along you are, so these
          carry the thing it cannot: WHO is acting and WHEN. The first two
          layers are the organiser in one sitting; the third is a guest, days
          later, on their own phone. */}
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

      {/* One height for every step, so the section below never jumps: the
          tallest dialog (items, ~212px with its footer) plus the top-8 the
          stack is inset by, so two spent layers can recede upward inside the
          frame instead of clipping against Vignette's overflow-hidden.
          min-h-72 was tried first and left a dead band under the SHORTEST
          step, which is the one the section opens on — the frame has to fit
          the tallest dialog and not a pixel more. */}
      <div className="relative min-h-64">
        <AnimatePresence initial={false}>
          {step >= 0 && (
            <motion.div
              key="topic"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={layer(0).animate}
              style={layer(0).style}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-x-0 top-8 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
            >
              {/* COPY THE REAL SEARCH BOX, WHICH IS THE WIZARD'S, NOT
                  LOVE-STEP'S (founder, 2026-08-17 — "the field has a border,
                  the real version doesn't").
                  TopicStep does contain a bordered InputGroup, but it renders
                  only when `externalSearch === undefined`, and the wizard —
                  the one place TopicStep is used — always passes a search in.
                  So the field organisers actually see is the OVERLAY HEADER's
                  bare input (new-favpoll-wizard/index.tsx): flex-1,
                  bg-transparent, outline-none, no border and no box, with a
                  variant="secondary" Add beside it. Mocking TopicStep's dead
                  branch drew a box that exists nowhere in the product.
                  NOT copied: the Filters row and the "Suggested for <charity>"
                  strip, which sit between the field and the chips. */}
              <div className="border-b border-border px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`flex-1 text-base ${searchText ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {searchText || "Search topics…"}
                    {searchTyping && <span className="opacity-40">|</span>}
                  </span>
                  {searchAddVisible && (
                    <InputGroupButton
                      variant="secondary"
                      className={
                        searchAddPressed ? "scale-[0.96] brightness-95" : ""
                      }
                    >
                      Add
                    </InputGroupButton>
                  )}
                </div>
                {!searchAddVisible && (
                  <p className="text-xs text-muted-foreground">
                    Is your topic missing? Type it and click {ADD_TOKEN}
                  </p>
                )}
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
                      className="w-full py-3 text-center text-sm text-muted-foreground"
                    >
                      No matching topics — add your own.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step >= 1 && (
            <motion.div
              key="items"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={layer(1).animate}
              style={layer(1).style}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-x-0 top-8 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
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

          {step >= 2 && (
            <motion.div
              key="guest"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={layer(2).animate}
              style={layer(2).style}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-x-0 top-8 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
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
