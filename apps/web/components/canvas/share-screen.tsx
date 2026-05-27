"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"

type Props = {
  shareLink: string
  onNavigate: (path: string) => void
}

export function ShareScreen({ shareLink, onNavigate }: Props) {
  const fullUrl =
    typeof window !== "undefined"
      ? window.location.origin + shareLink
      : shareLink

  return (
    <main className="mx-auto max-w-sm px-4 pt-8 pb-16">
      <div className="space-y-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Your event is ready</p>
          <h1 className="mt-1 text-2xl font-medium text-foreground">
            Share with guests
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-white p-4">
            <QRCodeSVG value={fullUrl} size={180} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="font-mono text-xs break-all text-foreground">
            {fullUrl}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(fullUrl)}
            className="flex-1"
          >
            Copy link
          </Button>
          <Button
            type="button"
            onClick={() => onNavigate(shareLink)}
            className="flex-1"
          >
            View event
          </Button>
        </div>
      </div>
    </main>
  )
}
