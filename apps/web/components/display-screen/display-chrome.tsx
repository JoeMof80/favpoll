"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@favpoll/ui"
import {
  Check,
  EllipsisVertical,
  ExternalLink,
  Flower2,
  Maximize,
  Minimize,
  Moon,
  Sun,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FavpollLogo } from "@/components/favpoll-logo"
import type { DisplayVariant } from "./index"

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
  /** Active display variant — omitted in contexts without the dial (stories) */
  variant?: DisplayVariant
  onVariantChange?: (variant: DisplayVariant) => void
}

const VARIANT_OPTIONS: {
  value: DisplayVariant
  label: string
  Icon: typeof TrendingUp
}[] = [
  { value: "fundraiser", label: "Fundraiser view", Icon: TrendingUp },
  { value: "tribute", label: "Tribute view", Icon: Flower2 },
]

export function DisplayChrome({ eventUrl, variant, onVariantChange }: Props) {
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

  // Mirrors the app header's geometry (h-14 row, items-center, px-6,
  // justify-between) so the mark and menu sit exactly where the header's
  // would — pointer-events pass through the strip itself.
  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-20 flex h-14 items-center justify-between px-6">
      <div className="pointer-events-auto">
        <FavpollLogo />
      </div>
      <div className="pointer-events-auto">
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
            {/* The presence dial (founder, 2026-08-02): the presenter picks
                how loud the room's screen is — telethon goal theatre, or
                the person as the heading with the money kept quiet. The
                default is derived from the favpoll's register upstream. */}
            {variant && onVariantChange && (
              <>
                {VARIANT_OPTIONS.map(({ value, label, Icon }) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={() => onVariantChange(value)}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                    {variant === value && (
                      <Check className="ml-auto" aria-hidden="true" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
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
    </div>
  )
}
