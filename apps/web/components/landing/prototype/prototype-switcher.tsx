"use client"

// PROTOTYPE — floating variant switcher for the landing redesign. Dev only;
// delete this file when the prototype is resolved (see NOTES.md).

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  variants: string[]
  current: string
}

export function PrototypeSwitcher({ variants, current }: Props) {
  const router = useRouter()
  const index = Math.max(0, variants.indexOf(current))

  const go = useCallback(
    (delta: number) => {
      const next = variants[(index + delta + variants.length) % variants.length]
      router.replace(next === variants[0] ? "/" : `/?variant=${next}`, {
        scroll: false,
      })
    },
    [index, variants, router]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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
  }, [go])

  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-foreground/20 bg-foreground px-4 py-2 text-background shadow-lg">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Previous variant"
        onClick={() => go(-1)}
        className="text-background hover:bg-background/15 hover:text-background"
      >
        ←
      </Button>
      <span className="min-w-24 text-center font-mono text-xs tracking-wide uppercase">
        {current}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Next variant"
        onClick={() => go(1)}
        className="text-background hover:bg-background/15 hover:text-background"
      >
        →
      </Button>
    </div>
  )
}
