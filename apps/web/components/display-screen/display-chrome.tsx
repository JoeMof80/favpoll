"use client"

import { useEffect, useState } from "react"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavpollLogo } from "@/components/favpoll-logo"

// The live display's own minimal chrome: the brand mark (the app header is
// suppressed on this surface) and a fullscreen toggle — venue organisers
// shouldn't need to know F11.
export function DisplayChrome() {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  async function toggle() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen may be blocked (e.g. iframe) — the button is best-effort
    }
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <FavpollLogo />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
        className="text-muted-foreground hover:text-foreground"
      >
        {fullscreen ? (
          <Minimize className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Maximize className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
