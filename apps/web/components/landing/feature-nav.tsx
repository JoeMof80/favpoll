"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// The sticky section menu on /features. Highlights whichever section the
// reader is in and jumps to it on click.
//
// Plain scroll maths rather than IntersectionObserver, following the process
// overview: percentage rootMargins proved unreliable across browsers and zoom
// there (the founder's tab never advanced), and this page has the same job —
// "which of these is currently under the reader".
//
// Active = the last section whose top has crossed 40% of the viewport, so a
// section lights up as you arrive at it rather than when it fills the screen.

export function FeatureNav({
  sections,
}: {
  sections: { id: string; label: string }[]
}) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4
      let current = sections[0]?.id
      for (const s of sections) {
        const node = document.getElementById(s.id)
        if (node && node.getBoundingClientRect().top <= line) current = s.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [sections])

  return (
    // Hidden below lg: at that width the column would eat the content, and a
    // page that simply scrolls is no worse than one with a menu you cannot
    // read. The section headings still carry it.
    <nav
      aria-label="Features"
      className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
    >
      <ul className="flex flex-col gap-1 border-l border-border">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              // JS smooth (2026-09-05): the global CSS smooth is gone —
              // it animated every route change's scroll reset — so the
              // menu scrolls itself, honouring reduced motion by hand.
              onClick={(e) => {
                e.preventDefault()
                const reduced = window.matchMedia(
                  "(prefers-reduced-motion: reduce)"
                ).matches
                document.getElementById(s.id)?.scrollIntoView({
                  behavior: reduced ? "auto" : "smooth",
                })
                history.pushState(null, "", `#${s.id}`)
              }}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "-ml-px block border-l py-1.5 pl-4 text-sm transition-colors",
                active === s.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
