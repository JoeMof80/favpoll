"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function MenuButton() {
  const { resolvedTheme, setTheme } = useTheme()

  // resolvedTheme is undefined during SSR, but on a dark-mode client it is
  // "dark" from the very first render — so branching on it directly makes
  // the server (Moon) disagree with the client (Sun) at hydration. Hold the
  // server's default until mounted, then correct (same pattern as
  // GuestWall's RelativeTime).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const isDark = mounted && resolvedTheme === "dark"

  // className mirrors the shadcn Button ghost/icon recipe so the toggle
  // sits seamlessly beside real Buttons in both app headers.
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
