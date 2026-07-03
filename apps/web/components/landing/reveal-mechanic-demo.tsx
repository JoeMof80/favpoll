"use client"

// Interactive demonstration of the withhold-then-disclose
// mechanic. The visitor clicks a demo pledge; the reveal unblurs and types
// out, exactly as it does on a live favpoll page. Uses a celebration scene
// (Poppy's birthday) to balance the memorial-led hero.
import { useEffect, useRef, useState } from "react"
import { Lock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SCENES } from "@/components/hero-demo-panel/scenes"

const scene = SCENES[1] // Poppy Chen — Sweet Sixteen, Ice cream
const REVEAL = scene.poll.personal_reveal
const FIRST_NAME = scene.protagonist.name.split(" ")[0]

export function RevealMechanicDemo() {
  const [pledged, setPledged] = useState(false)
  const [typedCount, setTypedCount] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!pledged) {
      setTypedCount(0)
      return
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedCount(REVEAL.length)
      return
    }
    // Small pause while the blur clears, then type.
    const startDelay = setTimeout(() => {
      timer.current = setInterval(() => {
        setTypedCount((n) => {
          if (n >= REVEAL.length) {
            if (timer.current) clearInterval(timer.current)
            return n
          }
          return n + 1
        })
      }, 24)
    }, 450)
    return () => {
      clearTimeout(startDelay)
      if (timer.current) clearInterval(timer.current)
    }
  }, [pledged])

  return (
    <div className="relative max-w-xl rounded-xl border border-border bg-background p-6">
      <p className="mb-1 text-xs font-medium tracking-[0.09em] text-primary-muted uppercase">
        Favourite {scene.poll.topic.title.toLowerCase()}
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        {FIRST_NAME}, {scene.protagonist.context?.toLowerCase()} — her guests
        saw this locked card first.
      </p>

      {/* The withheld reveal */}
      <div className="relative">
        <blockquote
          className={`min-h-24 border-l-[2.5px] border-primary-muted pl-3 text-lg leading-relaxed text-reveal-foreground italic transition-[filter] duration-500 ${
            pledged ? "blur-none" : "blur-xs select-none"
          }`}
          aria-hidden={!pledged}
        >
          {pledged ? (
            <>
              {REVEAL.slice(0, typedCount)}
              {typedCount < REVEAL.length && (
                <span className="opacity-40">|</span>
              )}
            </>
          ) : (
            REVEAL.replace(/\S/g, "•")
          )}
        </blockquote>
        {/* Screen readers get the reveal only once pledged */}
        {pledged && (
          <span role="status" aria-live="polite" className="sr-only">
            {REVEAL}
          </span>
        )}

        {!pledged && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              type="button"
              onClick={() => setPledged(true)}
              className="shadow-md"
            >
              <Lock className="h-4 w-4" data-icon="inline-start" />
              Pledge £5 to see {FIRST_NAME}'s reveal
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {pledged
            ? "That's the mechanic — give first, then receive."
            : "Try it — this one's a demo, no payment."}
        </p>
        {pledged && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPledged(false)}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" data-icon="inline-start" />
            Lock it again
          </Button>
        )}
      </div>
    </div>
  )
}
