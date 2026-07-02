"use client"

// PROTOTYPE — sticky rail nav with a scrollspy highlight on the section
// currently in view.
import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Props = {
  items: readonly (readonly [href: string, label: string])[]
}

export function RailNav({ items }: Props) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = items
      .map(([href]) => document.getElementById(href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: "-20% 0px -60% 0px" }
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items])

  return (
    <nav aria-label="Page sections">
      <ul className="flex flex-col gap-2.5">
        {items.map(([href, label]) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "border-l-2 pl-3 text-sm transition-colors",
                active === href
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
