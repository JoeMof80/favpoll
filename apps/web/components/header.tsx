"use client"

import { useEffect, useState } from "react"
import { Show, SignInButton, SignUpButton, useClerk } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import { UserButtonClient } from "@/components/user-button-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuButton } from "@favpoll/ui"
import { HeaderBar } from "@/components/header-bar"

const MOBILE_LINK =
  "block w-full rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  const clerk = useClerk()

  // While the menu is open: lock the page scroll and close on Escape.
  // Click-away is handled by the scrim below.
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  return (
    <HeaderBar
      overlay={
        /* Mobile menu — a dropdown below the header (logo + hamburger stay
           in view). A scrim blurs and freezes the page behind it; the header
           stays sharp because the scrim starts at its bottom edge (top-14).
           Tapping the scrim dismisses the menu. Rendered INSIDE <header>, so
           it keeps the sticky, z-40 element it is positioned against. */
        menuOpen ? (
          <>
            <div
              className="fixed inset-x-0 top-14 bottom-0 z-30 bg-background/50 backdrop-blur-md md:hidden"
              aria-hidden="true"
              onClick={close}
            />
            <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-background px-4 pt-2 pb-4 shadow-lg md:hidden">
              <nav className="space-y-0.5">
                <Link href="/favpolls" className={MOBILE_LINK} onClick={close}>
                  All favpolls
                </Link>
                <Show when="signed-in">
                  <Link
                    href="/my-favpolls"
                    className={MOBILE_LINK}
                    onClick={close}
                  >
                    Your favpolls
                  </Link>
                </Show>
                {/* Mini-sitemap: the rarer destinations live here (and in the
                    footer), keeping the desktop header lean. */}
                <Link href="/charities" className={MOBILE_LINK} onClick={close}>
                  Charities
                </Link>
                <Link href="/about" className={MOBILE_LINK} onClick={close}>
                  About
                </Link>
              </nav>

              {/* Appearance — the theme switch */}
              <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-3">
                <span className="text-sm text-muted-foreground">
                  Appearance
                </span>
                <MenuButton />
              </div>

              {/* Account — sign in/up when signed out, manage/sign out when in */}
              <Show when="signed-out">
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <SignInButton>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={close}
                    >
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
                <div className="mt-2 space-y-0.5 border-t border-border pt-2">
                  <button
                    type="button"
                    className={MOBILE_LINK}
                    onClick={() => {
                      close()
                      clerk.openUserProfile()
                    }}
                  >
                    Manage account
                  </button>
                  <button
                    type="button"
                    className={MOBILE_LINK}
                    onClick={() => {
                      close()
                      clerk.signOut()
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </Show>
            </div>
          </>
        ) : null
      }
    >
      {/* Desktop nav — hidden on mobile */}
      <div className="hidden items-center gap-2 md:flex">
        {/* "The record" nav link hidden until the record launches
                (landing says Coming soon — 2026-07-21); /record stays
                reachable by URL. Restore here + mobile menu + footer +
                about. */}
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/favpolls">All favpolls</Link>
        </Button>
        <Show when="signed-in">
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/my-favpolls">Your favpolls</Link>
          </Button>
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </Show>
        <MenuButton />
      </div>

      {/* Avatar — desktop only; on mobile the header stays logo + hamburger
              and the account actions live in the menu. */}
      <Show when="signed-in">
        <div className="hidden md:block">
          <UserButtonClient />
        </div>
      </Show>

      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 md:hidden"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </HeaderBar>
  )
}
