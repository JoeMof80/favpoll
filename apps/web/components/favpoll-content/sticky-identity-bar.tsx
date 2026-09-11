"use client"

import { useEffect, useState } from "react"

type Props = {
  name: string
  openingLine: string
  heroRef: React.RefObject<HTMLElement | null>
}

/**
 * Mobile-only identity bar that slides down from under the app header when
 * the hero scrolls out of view. Uses an IntersectionObserver on the hero
 * element — no scroll listeners, no layout dependency on the animation
 * (transform only, same doctrine as the charity footer).
 */
export function StickyIdentityBar({ name, openingLine, heroRef }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Bar visible when hero is NOT intersecting (scrolled away)
        setVisible(!entry.isIntersecting)
      },
      {
        // The app header is 56px (h-14). Shrink the root margin so the
        // observer fires when the hero leaves the viewport below the header,
        // not below the true viewport top.
        rootMargin: "-56px 0px 0px 0px",
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [heroRef])

  return (
    <div
      className={`fixed top-14 right-0 left-0 z-25 border-b border-border bg-background px-6 py-2 transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <p className="truncate text-sm font-medium text-foreground">
        {name}
        <span className="ml-2 font-normal text-muted-foreground">
          {openingLine}
        </span>
      </p>
    </div>
  )
}
