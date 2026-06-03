"use client"

import Link from "next/link"
import { useState } from "react"
import { Pencil, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  eventId: string
  isOrganiser: boolean
  isClosed?: boolean
}

export function EventSubheader({ eventId, isOrganiser, isClosed }: Props) {
  const [copied, setCopied] = useState(false)

  if (!isOrganiser) return null

  function handleShareResults() {
    const url = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed z-30"
      style={{
        right: "1.25rem",
        bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
      }}
    >
      {isClosed ? (
        <Button
          type="button"
          size="icon"
          onClick={handleShareResults}
          aria-label={copied ? "Link copied" : "Share results"}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {copied ? (
            <Check className="h-5 w-5" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </Button>
      ) : (
        <Button
          asChild
          size="icon"
          aria-label="Edit event"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Link href={`/events/${eventId}/edit`}>
            <Pencil className="h-5 w-5" />
          </Link>
        </Button>
      )}
    </div>
  )
}
