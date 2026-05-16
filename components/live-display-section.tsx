"use client"

import { useState } from "react"
import { Monitor, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  eventId: string
}

export function LiveDisplaySection({ eventId }: Props) {
  const [copied, setCopied] = useState(false)

  const displayUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${eventId}/display`
      : `/events/${eventId}/display`

  function handleCopy() {
    navigator.clipboard.writeText(displayUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="mt-8" aria-labelledby="display-heading">
      <h2
        id="display-heading"
        className="mb-1 flex items-center gap-2 text-base font-medium text-foreground"
      >
        <Monitor className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        Live display
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Open this on a projector or large screen at your gathering. Rankings
        update in real time as guests pledge.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={displayUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Open in new tab
          </a>
        </Button>
      </div>
    </section>
  )
}
