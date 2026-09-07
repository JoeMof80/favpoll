"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut } from "lucide-react"

/**
 * The desktop account dropdown, in the house grammar (founder,
 * 2026-09-07) — replaces Clerk's UserButton, whose menu carried
 * "Secured by Clerk" + the dev-mode badge. Mirrors the mobile menu's
 * account section: Manage account still opens Clerk's profile modal
 * (accounts ARE Clerk's), Sign out signs out.
 */
export function AccountMenu() {
  const { user } = useUser()
  const clerk = useClerk()
  if (!user) return null

  const name = user.fullName ?? user.username ?? "Your account"
  const email = user.primaryEmailAddress?.emailAddress
  const initial = (name || email || "?").charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar, unknown remote host
          <img
            src={user.imageUrl}
            alt=""
            className="size-8 rounded-full border border-border"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
            {initial}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => clerk.openUserProfile()}>
          <Settings aria-hidden="true" />
          Manage account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => clerk.signOut()}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
