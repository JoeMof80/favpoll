"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import {
  WallOfFavourites,
  type WallEntry,
} from "@/components/wall-of-favourites"
import { Vignette } from "@/components/landing/vignette"

// The wall of favourites, filling as pledges land.
//
// The REAL WallOfFavourites with animate — the rows spring in here exactly as they
// do on a favpoll, because it is the same AnimatePresence doing it.
//
// One entry is anonymous, on purpose. "Someone" is the anonymity model made
// visible: an anonymous pledge counts fully everywhere and shows on the wall
// like any other, it just does not carry a name. And no row anywhere carries
// an AMOUNT — the wall is presence, not size, and a vignette that invented a
// column of figures would misrepresent the one rule it has.
//
// Dog breeds, matching the pack and the display: one demo favpoll, told the
// same way wherever the site depicts it.

// Module scope, not render: relativeTime reads the clock, and the React
// Compiler rejects impure calls during render (the same reason DisplayStill
// pins its base time).
const BASE = Date.now()
const mins = (n: number) => new Date(BASE - n * 60_000).toISOString()

const ENTRIES: WallEntry[] = [
  { id: "w5", name: "Priya", labels: ["Cockapoo"], created_at: mins(0) },
  { id: "w4", name: null, labels: ["Greyhound"], created_at: mins(4) },
  {
    id: "w3",
    name: "Dan",
    labels: ["Labrador", "Border Terrier"],
    created_at: mins(11),
  },
  {
    id: "w2",
    name: "Maureen",
    labels: ["Cocker Spaniel"],
    created_at: mins(26),
  },
  { id: "w1", name: "Tom", labels: ["Labrador"], created_at: mins(41) },
]

// Newest first, as the wall orders them — so the vignette fills from the
// bottom up, which is the direction a real one grows.
const ORDER = [...ENTRIES].reverse()

const STEP_MS = 1500
const HOLD_MS = 4200

export function WallOfFavouritesVignette() {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(reduced ? ORDER.length : 1)

  useEffect(() => {
    if (reduced) return
    const full = count === ORDER.length
    const id = setTimeout(
      () => setCount(full ? 1 : count + 1),
      full ? HOLD_MS : STEP_MS
    )
    return () => clearTimeout(id)
  }, [count, reduced])

  const shown = ORDER.slice(0, count)

  return (
    <Vignette>
      {/* Height reserved for the FULL wall so the box never resizes as rows
          land — layout must not depend on the animation, or every section
          below this one jumps five times a loop.
          TOP-aligned: newest first means a new row appears at the top and
          pushes the rest down, so the card grows downward from a fixed top
          edge. Bottom-aligning it reserved the space above instead, which
          read as a card floating in a hole rather than a wall filling up. */}
      <div className="mx-auto flex min-h-52 max-w-sm items-start">
        {/* w-full: the flex parent would otherwise shrink the card to its
            content, so it would change width as the longest row arrives. */}
        <div className="w-full">
          <WallOfFavourites
            entries={[...shown].reverse()}
            animate={!reduced}
            maxEntries={ENTRIES.length}
          />
        </div>
      </div>
    </Vignette>
  )
}
