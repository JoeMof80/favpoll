"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "@/lib/supabase/client"
import { getFavpollHeadline } from "@/lib/display"
import { DisplayPollSection } from "./display-poll-section"
import type { DisplayPoll } from "./display-poll-section"

type Props = {
  favpollId: string
  protagonistName: string
  dateLabel: string | null
  openingLine: string | null
  description: string | null
  occasionType: string | null
  charityName: string | null
  poll: DisplayPoll | null
  initialTotalRaised: number
  pollId: string | null
  favpollUrl: string
}

export function DisplayScreen({
  favpollId,
  protagonistName,
  dateLabel,
  openingLine,
  description,
  occasionType,
  charityName,
  poll,
  initialTotalRaised,
  pollId,
  favpollUrl,
}: Props) {
  const [totalRaised, setTotalRaised] = useState(initialTotalRaised)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`display-pledges-${favpollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pledges" },
        async () => {
          if (!pollId) return
          const { data } = await supabase
            .from("pledges")
            .select("total_amount")
            .eq("favpoll_poll_id", pollId)
            .is("withdrawn_at", null)
          const total = (data ?? []).reduce(
            (s: number, p: { total_amount: number }) => s + p.total_amount,
            0
          )
          setTotalRaised(total)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [favpollId, pollId, supabase])

  const headline = getFavpollHeadline({
    occasionType,
    openingLine,
    name: protagonistName,
    dateLabel,
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12">
      <div className="w-full max-w-3xl px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          {headline.prefix && (
            <p className="mb-3 text-sm font-medium tracking-widest text-primary uppercase">
              {headline.prefix}
            </p>
          )}
          <h1 className="mb-4 text-5xl font-medium tracking-tight text-foreground">
            {protagonistName}
          </h1>
          {headline.suffix && (
            <p className="text-lg text-primary">{headline.suffix}</p>
          )}
          {description && (
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Rankings */}
        {poll && <DisplayPollSection poll={poll} />}

        {/* Charity total */}
        {charityName && (
          <div className="my-8 text-center">
            <p className="mb-1 text-sm text-muted-foreground">
              raised for {charityName}
            </p>
            <p
              className="text-4xl font-medium text-foreground"
              aria-live="polite"
            >
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
                minimumFractionDigits: 2,
              }).format(totalRaised)}
            </p>
          </div>
        )}

        {/* QR code */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-8">
          <QRCodeSVG
            value={favpollUrl}
            size={120}
            bgColor="transparent"
            aria-label="Scan to pledge on your phone"
            imageSettings={{
              src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjI5OCAyODIgMTIwIDEwOSI+PHBhdGggZD0iTTQxMS4zNDkgMzE4LjI0OEM0MTQuNjEgMzE4LjI0OCA0MTYuNzY5IDMxNS42MDYgNDE2Ljc2OSAzMTIuMzQ3QzQxMy45NTggMjk1LjYwMiAzOTkuMzgxIDI4Mi44NDMgMzgxLjgyOCAyODIuODQzQzM3Mi43NTUgMjgyLjg0MyAzNjQuNTcxIDI4Ni4xNjkgMzU4LjMwMyAyOTEuNzc1TDM1NS44NTkgMjg5Ljc2OUMzNDkuOTM1IDI4NS4zNzEgMzQyLjU0NSAyODIuODQzIDMzNC41OTQgMjgyLjg0M0MzMTUuMDI5IDI4Mi44NDMgMjk5LjE2OSAyOTguNjk0IDI5OS4xNjkgMzE4LjI0OEMyOTkuMTY5IDMyNy45NTQgMzAzLjA4IDMzNi43NDcgMzA5LjQwOSAzNDMuMTQyTDMyOC45ODcgMzYyLjcxNEMzMzEuMjkyIDM2NS4wMTkgMzM1LjAzMSAzNjUuMDE5IDMzNy4zMzcgMzYyLjcxNEMzMzkuNjQzIDM2MC40MSAzMzkuNjQzIDM1Ni42NzQgMzM3LjMzNyAzNTQuMzY5TDMxNy43NTggMzM0Ljc5OEMzMTMuNTUzIDMzMC41MjYgMzEwLjk3OCAzMjQuNjk5IDMxMC45NzggMzE4LjI0OEMzMTAuOTc4IDMwNS4yMTIgMzIxLjU1MSAyOTQuNjQ1IDMzNC41OTQgMjk0LjY0NUMzNDAuNzg2IDI5NC42NDUgMzQ2LjMzMyAyOTYuODg2IDM1MC40MjcgMzAwLjU1N0wzNTguMzAzIDMwNy42MjJMMzY2LjE3OSAzMDAuNTY5QzM3MC4zMzIgMjk2Ljg1NCAzNzUuNzI4IDI5NC42NDUgMzgxLjgyOCAyOTQuNjQ1QzM5Mi44MjcgMjk0LjY0NSA0MDIuMDkxIDMwMi4xNjggNDA0LjcwOSAzMTIuMzQ3QzQwNC43MDkgMzE1LjYwNiA0MDguMDg4IDMxOC4yNDggNDExLjM0OSAzMTguMjQ4WiIgZmlsbD0iIzUzNEFCNyIvPjxwYXRoIGQ9Ik0zNTIuNTY5IDMzNS45NDNDMzUyLjU2OSAzMzkuMDkxIDM1NS4yMDIgMzQxLjY0MyAzNTguNDQ5IDM0MS42NDNINDA1LjQ4OUM0MDguNzM3IDM0MS42NDMgNDExLjM2OSAzMzkuMDkxIDQxMS4zNjkgMzM1Ljk0M0M0MTEuMzY5IDMzMi43OTUgNDA4LjczNyAzMzAuMjQzIDQwNS40ODkgMzMwLjI0M0gzNTguNDQ5QzM1NS4yMDIgMzMwLjI0MyAzNTIuNTY5IDMzMi43OTUgMzUyLjU2OSAzMzUuOTQzWiIgZmlsbD0iIzUzNEFCNyIgZmlsbC1vcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNMzUyLjU2OSAzNTkuNjQzQzM1Mi41NjkgMzYyLjk1NiAzNTUuMjExIDM2NS42NDMgMzU4LjQ2OSAzNjUuNjQzSDM4Mi4wN0MzODUuMzI4IDM2NS42NDMgMzg3Ljk2OSAzNjIuOTU2IDM4Ny45NjkgMzU5LjY0M0MzODcuOTY5IDM1Ni4zMjkgMzg1LjMyOCAzNTMuNjQzIDM4Mi4wNyAzNTMuNjQzSDM1OC40NjlDMzU1LjIxMSAzNTMuNjQzIDM1Mi41NjkgMzU2LjMyOSAzNTIuNTY5IDM1OS42NDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0zNjMuOTY5IDM4My4wNDNDMzYzLjk2OSAzODYuMzU3IDM2MS40MTggMzg5LjA0MyAzNTguMjY5IDM4OS4wNDNDMzU1LjEyMSAzODkuMDQzIDM1Mi41NjkgMzg2LjM1NyAzNTIuNTY5IDM4My4wNDNDMzUyLjU2OSAzNzkuNzI5IDM1NS4xMjEgMzc3LjA0MyAzNTguMjY5IDM3Ny4wNDNDMzYxLjQxOCAzNzcuMDQzIDM2My45NjkgMzc5LjcyOSAzNjMuOTY5IDM4My4wNDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              opacity: 1,
              excavate: true,
            }}
          />
          <p className="text-sm text-muted-foreground">scan to pledge</p>
        </div>
      </div>
    </div>
  )
}
