'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Gift, Heart, CalendarDays, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/placeholders', label: 'Placeholders', icon: FileText },
  { href: '/contributions', label: 'Contributions', icon: Gift },
  { href: '/charities', label: 'Charities', icon: Heart },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/access', label: 'Access', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-neutral-200">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">favpoll admin</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
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
