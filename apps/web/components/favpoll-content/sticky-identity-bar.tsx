"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

// The bar's rendered height is published so downstream sticky elements
// (the poll heading, the lock card) can account for it — same pattern
// as the charity footer's --charity-footer-h.
export const IDENTITY_BAR_HEIGHT_VAR = "--identity-bar-h"

type Props = {
  name: string
  /** The eyebrow above the name (e.g. "Celebrating", "In memory of") */
  eyebrow: string
  /** Protagonist photo — null for cause-type favpolls */
  photoUrl?: string | null
  heroRef: React.RefObject<HTMLElement | null>
}

/**
 * Mobile-only identity bar that slides down from under the app header when
 * the hero scrolls out of view. Uses an IntersectionObserver on the hero
 * element — no scroll listeners, no layout dependency on the animation
 * (transform only, same doctrine as the charity footer).
 *
 * Layout: small avatar (left) + eyebrow above name (right), two lines.
 * (Founder, 2026-09-11: "include a small avatar and the eyebrow should
 * be above the name.")
 */
export function StickyIdentityBar({ name, eyebrow, photoUrl, heroRef }: Props) {
  const [visible, setVisible] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(min-width: 768px)").matches) return

    // The observer's first callback can fire before the hero is laid
    // out, reporting "not intersecting" and showing the bar on mount.
    // Delay observation by one frame so the hero has been measured.
    const raf = requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry.isIntersecting)
        },
        { threshold: 0.2 }
      )
      observer.observe(el)
      observerRef = observer
    })
    let observerRef: IntersectionObserver | null = null
    return () => {
      cancelAnimationFrame(raf)
      observerRef?.disconnect()
    }
  }, [heroRef])

  // ALWAYS publish the bar's full height — by the time the topic
  // heading reaches its stick point on mobile, the bar is visible, so
  // the offset must account for it from the start.
  useLayoutEffect(() => {
    const el = barRef.current
    const root = document.documentElement
    if (!el || typeof ResizeObserver === "undefined") return
    const publish = () =>
      root.style.setProperty(
        IDENTITY_BAR_HEIGHT_VAR,
        `${el.getBoundingClientRect().height}px`
      )
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty(IDENTITY_BAR_HEIGHT_VAR)
    }
  }, [])

  return (
    <div
      ref={barRef}
      className={`fixed top-14 right-0 left-0 z-15 border-b border-border bg-background px-6 py-1.5 transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
            aria-hidden="true"
          >
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <p className="truncate text-sm leading-tight font-medium text-foreground">
            {name}
          </p>
        </div>
      </div>
    </div>
  )
}
