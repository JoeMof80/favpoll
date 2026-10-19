"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"

// Full-screen surfaces that carry their own minimal chrome instead of the
// app header (the live display keeps the brand mark + a fullscreen toggle
// in-card).
// NO SITE HEADER on the favpoll page either (founder, 2026-10-16: "the
// live page doesn't have a header because it isn't necessary … Why does
// the favpoll page need a header?"): the hero's band is the page's own
// 56px top row, with the mark on it — the page's only chrome (a ⋮ menu
// was tried and dropped the same day: a guest needs nothing from it that
// the mark and the organiser's manage button don't give). Manage,
// keepsake, edit and the rest keep the header.
// /favpolls/new is the WIZARD, not a favpoll page: it keeps the header
// (founder, 2026-10-19: "why no header on the wizard?" — the favpoll-page
// rule above had matched it since #1056).
const EXCLUDED = [/^\/live\/[^/]+$/, /^\/favpolls\/(?!new$)[^/]+$/]

export function HeaderMount() {
  const pathname = usePathname()
  if (pathname && EXCLUDED.some((re) => re.test(pathname))) return null
  return <Header />
}
