"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Maximize, Minimize } from "lucide-react"
import { MenuButton } from "@favpoll/ui"
import { Button } from "@/components/ui/button"
import { FavpollLogo } from "@/components/favpoll-logo"

// The live display's own minimal chrome (the app header is suppressed on
// this surface): brand mark top-left; top-right, the presenter's controls —
// a link back to the event page, the theme toggle, and a fullscreen toggle
// (venue organisers shouldn't need to know F11).

type Props = {
  /** The guest-facing event page for this favpoll */
  eventUrl: string
}

export function DisplayChrome({ eventUrl }: Props) {
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
      <div className="flex items-center gap-1.5">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href={eventUrl}>
            <ExternalLink data-icon="inline-start" aria-hidden="true" />
            Event page
          </Link>
        </Button>
        <MenuButton />
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
    </div>
  )
}
