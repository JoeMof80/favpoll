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
import type { DisplayVariant } from "./index"

// The presenter's dots (founder, 2026-10-17: "keep the dots on the live
// page since it is meant for a full screen. hide them for single column
// layout so they aren't in the way"): top-right over the frame's tinted
// gutter, at the header's geometry, a single dropdown of presenter
// controls — view, manage, theme, full screen. From the shell breakpoint
// only; the mark is the hero's own, as on the guest page.
//
// NOTE: rendered OUTSIDE the framed card — its drop-shadow filter would
// otherwise become the containing block for this fixed positioning.

type Props = {
  /** Where the menu's navigation item leads — the manage hub on the
   * real display (the presenter's way back); home on the landing demo. */
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

  // The app header's geometry (h-14 row, items-center, px-6) so the dots
  // sit where the header's would — pointer-events pass through the strip.
  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-40 hidden h-14 items-center justify-end px-6 shell:flex">
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
              Manage favpoll
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
