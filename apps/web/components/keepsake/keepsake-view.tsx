"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  KeepsakeDocument,
  type KeepsakeData,
  type KeepsakeVariant,
} from "./keepsake-document"

// The keepsake's variant switch, deliberately the same shape as the live
// display's presenter override: default from the register, let the organiser
// flip it, remember what they chose.
//
// A memorial opens quiet and a fundraiser opens loud, but the register is a
// guess about the day and the organiser was there. The display has always
// worked this way; the sheet afterwards should not ask a different question.
//
// Remembered per favpoll, not globally — someone may keep one of each.

export function KeepsakeView({
  data,
  favpollId,
  defaultVariant,
}: {
  data: KeepsakeData
  favpollId: string
  defaultVariant: KeepsakeVariant
}) {
  const [variant, setVariant] = useState<KeepsakeVariant>(defaultVariant)
  const key = `favpoll:keepsake-variant:${favpollId}`

  // Adopted after mount, not in the initial state: the server render knows
  // nothing of localStorage, and seeding from it directly would hydrate
  // against different markup. Same reason the display does it this way.
  useEffect(() => {
    const stored = window.localStorage.getItem(key)
    if (stored === "tribute" || stored === "fundraiser") setVariant(stored)
  }, [key])

  function choose(next: KeepsakeVariant) {
    setVariant(next)
    window.localStorage.setItem(key, next)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-muted-foreground">
          {variant === "tribute"
            ? "The person leads, and the money stays quiet."
            : "What was raised leads, as the thing worth keeping."}
        </p>
        <Tabs
          value={variant}
          onValueChange={(v) => choose(v as KeepsakeVariant)}
          className="shrink-0"
        >
          <TabsList variant="line">
            <TabsTrigger value="tribute">Tribute</TabsTrigger>
            <TabsTrigger value="fundraiser">Fundraiser</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* .paper pins the light token values on the SHEET only — the page
          chrome around it stays themed. Without this a dark-mode organiser
          printed a keepsake in near-white ink on white paper, or a solid
          dark page with background graphics on. Same fix as the print pack
          (#535); the keepsake never got it. */}
      <div className="paper rounded-lg border border-border bg-background shadow-sm print:border-0 print:shadow-none">
        <KeepsakeDocument data={data} variant={variant} />
      </div>
    </>
  )
}
