"use client"

import { useEffect, useState } from "react"
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import { UserButtonClient } from "@/components/user-button-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuButton } from "@favpoll/ui"
import { FavpollLogo } from "@/components/favpoll-logo"

const MOBILE_LINK =
  "block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  // Close on Escape (the scrim handles click-away; links close on tap).
  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 items-center justify-between px-6">
        <Link href="/" aria-label="favpoll home">
          <FavpollLogo />
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop nav — hidden on mobile */}
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/record">The record</Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/favpolls">Favpolls</Link>
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

          {/* Avatar — always visible when signed in */}
          <Show when="signed-in">
            <UserButtonClient />
          </Show>

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu — a dropdown below the header (logo + hamburger stay in
          view). A scrim blurs the page behind it; the header itself stays
          sharp because the scrim starts at its bottom edge (top-14). */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-x-0 top-14 bottom-0 z-30 bg-background/50 backdrop-blur-md md:hidden"
            aria-hidden="true"
            onClick={close}
          />
          <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-background px-4 pt-2 pb-4 shadow-lg md:hidden">
            <nav className="space-y-0.5">
              <Link href="/record" className={MOBILE_LINK} onClick={close}>
                The record
              </Link>
              <Link href="/favpolls" className={MOBILE_LINK} onClick={close}>
                Favpolls
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
              <span className="text-sm text-muted-foreground">Appearance</span>
              <MenuButton />
            </div>

            {/* Login UI — signed-out only (signed-in users use the avatar) */}
            <Show when="signed-out">
              <div className="mt-3 space-y-2 border-t border-border pt-3">
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
          </div>
        </>
      )}
    </header>
  )
}
