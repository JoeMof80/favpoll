"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Gift,
  Heart,
  CalendarDays,
  Users,
  Sparkles,
  Layers,
  Send,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/placeholders", label: "Placeholders", icon: FileText },
  { href: "/contributions", label: "Contributions", icon: Gift },
  { href: "/charities", label: "Charities", icon: Heart },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/generated-drafts", label: "Generated Drafts", icon: Sparkles },
  { href: "/subsets", label: "Subsets", icon: Layers },
  { href: "/favpolls", label: "Favpolls", icon: CalendarDays },
  { href: "/access", label: "Access", icon: Users },
  { href: "/library", label: "Library", icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
