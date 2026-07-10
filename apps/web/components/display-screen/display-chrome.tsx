"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@favpoll/ui"
import {
  EllipsisVertical,
  ExternalLink,
  Maximize,
  Minimize,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FavpollLogo } from "@/components/favpoll-logo"

// The live display's own minimal chrome (the app header is suppressed on
// this surface), pinned to the viewport's far corners over the frame's
// tinted gutters so the live content pays no height: brand mark top-left,
// and top-right a single dropdown of presenter controls — event page,
// theme, fullscreen.
//
// NOTE: rendered OUTSIDE the framed card — its drop-shadow filter would
// otherwise become the containing block for this fixed positioning.

type Props = {
  /** The guest-facing event page for this favpoll */
  eventUrl: string
}

export function DisplayChrome({ eventUrl }: Props) {
  const [fullscreen, setFullscreen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen may be blocked (e.g. iframe) — best-effort
    }
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-20">
        <FavpollLogo />
      </div>
      <div className="fixed top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Display options"
              className="text-muted-foreground hover:text-foreground"
            >
              <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => router.push(eventUrl)}>
              <ExternalLink aria-hidden="true" />
              Event page
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault() // stay open — presenters may toggle twice
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }}
            >
              {resolvedTheme === "dark" ? (
                <Sun aria-hidden="true" />
              ) : (
                <Moon aria-hidden="true" />
              )}
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void toggleFullscreen()}>
              {fullscreen ? (
                <Minimize aria-hidden="true" />
              ) : (
                <Maximize aria-hidden="true" />
              )}
              {fullscreen ? "Exit full screen" : "Full screen"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
