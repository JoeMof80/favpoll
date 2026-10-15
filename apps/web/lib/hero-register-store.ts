// THE HEADER FOLLOWS THE HOME HERO (founder, 2026-10-15).
//
// On a register page the header wears the register, because the page-level
// palette scope lifts it to the whole document. On home the hero rotates
// through the three registers (rotating-register-hero.tsx) and the header
// stayed brand blue above it — the one seam on the page where two palettes
// met, at the top. So the hero publishes the register it is showing and the
// header wears it; HEADER ONLY, element-scoped, never the page (the page-
// level scope would recolour the trust grid, the close band, every link,
// every eight seconds).
//
// A module store rather than context: the header lives in the root layout
// and the hero in one page, with server components between them.
//
// Three values: a palette (the hero is in view, showing that register);
// null (the hero is mounted but mostly scrolled out — the header returns to
// blue); undefined (no hero on this page — the header is whatever the page
// makes it, as before).
import { useSyncExternalStore } from "react"
import type { RegisterPalette } from "@/lib/register-palette"

export type HeroRegister = RegisterPalette | null | undefined

let current: HeroRegister = undefined
const listeners = new Set<() => void>()

export function setHeroRegister(next: HeroRegister) {
  if (next === current) return
  current = next
  for (const l of listeners) l()
}

export function getHeroRegister(): HeroRegister {
  return current
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function useHeroRegister(): HeroRegister {
  return useSyncExternalStore(subscribe, getHeroRegister, () => undefined)
}
