"use client"

import Link from "next/link"
import { useState } from "react"
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
    <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-background">
      <div className="mx-auto flex h-14 max-w-330 items-center justify-end px-6">
        {isClosed ? (
          <Button type="button" onClick={handleShareResults}>
            {copied ? "Link copied!" : "Share results"}
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href={`/events/${eventId}/edit`}>Edit event</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
