"use client"

// PROTOTYPE (2026-08-30) — register colour system. Throwaway; delete with
// app/prototype/register-colours. Dev-only: returns null in production.
//
// Reads ?variant=, sets data-register on <html> (the token overrides in
// app/prototype-register-colours.css key off it), and shows a floating bar
// to cycle variants and flip the theme. The chosen variant is remembered in
// sessionStorage so it survives clicking around the site; the URL param
// always wins, which is what lets the grid route show six frames at once.

import { Suspense, useEffect, useLayoutEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export const REGISTER_VARIANTS = [
  { key: "current", label: "Current — purple everywhere" },
  { key: "memorial", label: "Memorial — purple" },
  { key: "celebration", label: "Celebration — amber / gold" },
  { key: "fundraiser", label: "Fundraiser — green" },
  { key: "blue", label: "Default candidate — blue" },
  { key: "ink", label: "Default candidate — ink" },
] as const
export type RegisterVariant = (typeof REGISTER_VARIANTS)[number]["key"]

const STORAGE_KEY = "prototype-register-variant"
const KEYS = REGISTER_VARIANTS.map((v) => v.key)

function isVariant(v: string | null | undefined): v is RegisterVariant {
  return !!v && (KEYS as readonly string[]).includes(v)
}

function Switcher() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [inFrame, setInFrame] = useState(false)
  // next-themes knows the theme on the client's first render but not on the
  // server, so the theme icon would hydrate mismatched; the bar simply
  // appears after mount instead.
  const [mounted, setMounted] = useState(false)

  const fromUrl = params.get("variant")
  const [variant, setVariant] = useState<RegisterVariant>(() =>
    isVariant(fromUrl) ? fromUrl : "current"
  )

  // URL wins; otherwise what this tab last chose.
  useEffect(() => {
    if (isVariant(fromUrl)) {
      setVariant(fromUrl)
      try {
        sessionStorage.setItem(STORAGE_KEY, fromUrl)
      } catch {}
      return
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (isVariant(stored)) setVariant(stored)
    } catch {}
  }, [fromUrl])

  useLayoutEffect(() => {
    const root = document.documentElement
    if (variant === "current") delete root.dataset.register
    else root.dataset.register = variant
  }, [variant])

  useEffect(() => {
    setInFrame(window.self !== window.top)
    setMounted(true)
  }, [])

  const go = (delta: number) => {
    const i = KEYS.indexOf(variant)
    const next = KEYS[(i + delta + KEYS.length) % KEYS.length]!
    try {
      sessionStorage.setItem(STORAGE_KEY, next)
    } catch {}
    const q = new URLSearchParams(params.toString())
    q.set("variant", next)
    router.replace(`${pathname}?${q.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (inFrame || !mounted) return null

  const label = REGISTER_VARIANTS.find((v) => v.key === variant)!.label
  return (
    <div
      role="toolbar"
      aria-label="Prototype: register colour variant"
      className="fixed left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-neutral-900 px-2 py-1 font-mono text-xs text-white shadow-xl"
      style={{ bottom: "calc(var(--charity-footer-h, 0px) + 12px)" }}
    >
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white"
        aria-label="Previous variant"
        onClick={() => go(-1)}
      >
        <ChevronLeft />
      </Button>
      <span className="px-1 whitespace-nowrap">
        {KEYS.indexOf(variant) + 1}/{KEYS.length} · {label}
      </span>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white"
        aria-label="Next variant"
        onClick={() => go(1)}
      >
        <ChevronRight />
      </Button>
      <span className="mx-1 h-4 w-px bg-white/25" aria-hidden="true" />
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white"
        aria-label={
          resolvedTheme === "dark" ? "Switch to light" : "Switch to dark"
        }
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </div>
  )
}

export function PrototypeRegisterSwitcher() {
  if (process.env.NODE_ENV === "production") return null
  return (
    <Suspense fallback={null}>
      <Switcher />
    </Suspense>
  )
}
