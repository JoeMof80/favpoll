"use client"

import { useEffect, useState } from "react"

type Props = {
  name: string
  eyebrow: string
  photoUrl?: string | null
}

/**
 * Mobile-only identity bar. Shows when scrolled past 200px (roughly
 * the hero height). Uses a plain scroll listener — no
 * IntersectionObserver, no CSS vars, no ref wiring. md:hidden keeps
 * desktop untouched. Fixed height (~48px) so downstream offsets can
 * be hardcoded.
 */
export function StickyIdentityBar({ name, eyebrow, photoUrl }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`fixed top-14 right-0 left-0 z-30 border-b border-border bg-background px-6 py-2.5 transition-transform duration-200 md:hidden ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <p className="truncate text-base leading-tight font-medium text-foreground">
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
