"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  /** Inline-variant label — the appeal page says "Share this appeal". */
  label?: string
  /** Share-sheet title, e.g. "Stanley's favpoll" */
  shareTitle: string
  /** Defaults to the current page URL at click time */
  url?: string
  /** "fab" = floating icon button; "inline" = labelled button */
  variant?: "fab" | "inline"
  className?: string
}

// The JustGiving lesson, modernised: distribution is the fundraising
// mechanic, but the platform-grid share block is 2015 — the native share
// sheet (navigator.share) reaches whatever the guest actually uses;
// clipboard is the desktop fallback.
export function ShareFavpollButton({
  label = "Share this favpoll",
  shareTitle,
  url,
  variant = "inline",
  className,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url ?? window.location.href
    // Native sheet only on touch devices — desktop share sheets are patchy
    // and anaemic; the desktop convention is copy-link (founder call,
    // 2026-07-29)
    const coarse = window.matchMedia(
      "(hover: none) and (pointer: coarse)"
    ).matches
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl })
        return
      } catch {
        // dismissed the sheet — not an error, and don't fall through to copy
        return
      }
    }
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === "fab") {
    return (
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleShare}
        aria-label={copied ? "Link copied" : `Share ${shareTitle}`}
        className={cn(
          // size-14 + size-6 icon = the FAB standard (new-favpoll +
          // publish/save FABs; unified 2026-07-30)
          "size-14 rounded-full border border-border shadow-lg [&_svg]:size-6",
          className
        )}
      >
        {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <Check data-icon="inline-start" aria-hidden="true" />
      ) : (
        <Share2 data-icon="inline-start" aria-hidden="true" />
      )}
      {copied ? "Link copied" : label}
    </Button>
  )
}
