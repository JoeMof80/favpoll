"use client"

import { useEffect, useRef, useState } from "react"
import { Countdown } from "@/components/countdown"

type Props = {
  name: string
  eyebrow: string
  photoUrl?: string | null
  /** An open favpoll's close: the countdown row (founder, 2026-09-29:
   *  "move the countdown to the header… above the Name and photo, on
   *  its own row"). */
  closesAt?: string | null
  /** A closed favpoll's row instead ("Poll closed · 15 July 2026"). */
  closedLabel?: string | null
}

/**
 * Mobile-only identity bar. Shows when scrolled past 93px (roughly
 * the hero height). Uses a plain scroll listener — no
 * IntersectionObserver, no CSS vars, no ref wiring. md:hidden keeps
 * desktop untouched. Nothing downstream reads its height (checked
 * 2026-09-29, when the countdown row joined it: the state row sits
 * above the identity row, so the bar is the only place the close
 * lives on a phone once the hero has scrolled away).
 */
export function StickyIdentityBar({
  name,
  eyebrow,
  photoUrl,
  closesAt,
  closedLabel,
}: Props) {
  const [show, setShow] = useState<boolean | null>(null)
  // Two-phase mount: render off-screen, then slide in on the next frame
  const [entered, setEntered] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 93)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (show) {
      // Double rAF ensures the browser has painted the off-screen frame
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setEntered(true))
      })
    } else {
      setEntered(false)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [show])

  if (!show) return null

  return (
    <div
      className={`fixed top-14 right-0 left-0 z-30 border-b border-border bg-background px-6 py-1.5 transition-transform duration-200 ease-out md:hidden ${
        entered ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {(closedLabel || closesAt) && (
        <div className="mb-1">
          {closedLabel ? (
            <p className="truncate text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              {closedLabel}
            </p>
          ) : (
            <Countdown closesAt={closesAt ?? undefined} variant="bar" />
          )}
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <p className="truncate text-lg leading-tight font-medium text-foreground">
            {name}
          </p>
        </div>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="size-9 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary"
            aria-hidden="true"
          >
            {name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  )
}
