"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"

// Full-screen surfaces that carry their own minimal chrome instead of the
// app header (the live display keeps the brand mark + a fullscreen toggle
// in-card).
// NO SITE HEADER on the favpoll page either (founder, 2026-10-16: "the
// live page doesn't have a header because it isn't necessary … Why does
// the favpoll page need a header?"): the hero's band is the page's own
// 56px top row, with the mark on it and a ⋮ menu at the right
// (favpoll-page-menu). Manage, keepsake, edit and the rest keep the header.
const EXCLUDED = [/^\/live\/[^/]+$/, /^\/favpolls\/[^/]+$/]

export function HeaderMount() {
  const pathname = usePathname()
  if (pathname && EXCLUDED.some((re) => re.test(pathname))) return null
  return <Header />
}
