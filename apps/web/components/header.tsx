"use client"

import { useEffect, useRef, useState } from "react"
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import { UserButtonClient } from "@/components/user-button-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuButton } from "@favpoll/ui"
import { FavpollLogo } from "@/components/favpoll-logo"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [menuOpen])

  function close() {
    setMenuOpen(false)
  }

  return (
    <header
      ref={headerRef}
      className="relative sticky top-0 z-40 border-b border-border bg-background"
    >
      <div className="mx-auto flex h-14 items-center justify-between px-6">
        <Link href="/" aria-label="favpoll home">
          <FavpollLogo />
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop nav — hidden on mobile */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/rankings"
              className="mr-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Rankings
            </Link>
            <Link
              href="/events"
              className="mr-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Live events
            </Link>
            <Show when="signed-in">
              <Link
                href="/my-events"
                className="mr-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Your events
              </Link>
              <Button asChild size="lg">
                <Link href="/events/new">New event</Link>
              </Button>
            </Show>
            <Show when="signed-out">
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </Show>
            <MenuButton />
          </div>

          {/* Avatar — always visible when signed in */}
          <Show when="signed-in">
            <UserButtonClient />
          </Show>

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-full right-0 left-0 z-50 border-b border-border bg-background px-4 pt-2 pb-4 shadow-sm md:hidden">
          <nav className="space-y-0.5">
            <Link
              href="/rankings"
              className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={close}
            >
              Rankings
            </Link>
            <Link
              href="/events"
              className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={close}
            >
              Live events
            </Link>
            <Show when="signed-in">
              <Link
                href="/my-events"
                className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={close}
              >
                Your events
              </Link>
            </Show>
            <Show when="signed-out">
              <div className="space-y-2 pt-3">
                <SignInButton>
                  <Button variant="outline" className="w-full" onClick={close}>
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="w-full" onClick={close}>
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <div className="pt-3">
                <Button asChild className="w-full">
                  <Link href="/events/new" onClick={close}>
                    New event
                  </Link>
                </Button>
              </div>
            </Show>
          </nav>
        </div>
      )}
    </header>
  )
}
