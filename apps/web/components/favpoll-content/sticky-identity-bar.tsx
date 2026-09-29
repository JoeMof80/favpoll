"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
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
 * IntersectionObserver. md:hidden keeps desktop untouched.
 *
 * Its HEIGHT is published as --identity-bar-h while it shows
 * (2026-09-29): the poll section's topic header and pledge pill pin
 * beneath it, and were hardcoded to the old one-row bar (6.6875rem =
 * header + 51px) until the state strip joined it and the topic header
 * slid under (founder screenshot). Measured, not stamped, so the strip
 * can change without the offsets drifting again.
 *
 * The STATE STRIP (founder, 2026-09-29: the countdown "above the Name
 * and photo, on its own row", then "the countdown creates clutter"):
 * a thin tinted band in sentence case above the identity row, so it
 * reads as a status ribbon rather than a third line of caps.
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

  const barRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = barRef.current
    const root = document.documentElement
    if (!el) {
      root.style.removeProperty("--identity-bar-h")
      return
    }
    const set = () =>
      root.style.setProperty("--identity-bar-h", `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty("--identity-bar-h")
    }
  }, [show])

  if (!show) return null

  return (
    <div
      ref={barRef}
      className={`fixed top-14 right-0 left-0 z-30 border-b border-border bg-background transition-transform duration-200 ease-out md:hidden ${
        entered ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {(closedLabel || closesAt) && (
        <div className="border-b border-border bg-primary/5 px-6 py-1">
          {closedLabel ? (
            <p className="truncate text-xs text-muted-foreground">
              {closedLabel}
            </p>
          ) : (
            <Countdown closesAt={closesAt ?? undefined} variant="bar" />
          )}
        </div>
      )}
      <div className="flex items-center gap-2.5 px-6 py-1.5">
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
