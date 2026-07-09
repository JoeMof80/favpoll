"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"

// Full-screen surfaces that carry their own minimal chrome instead of the
// app header (the live display keeps the brand mark + a fullscreen toggle
// in-card).
const EXCLUDED = [/^\/live\/[^/]+$/]

export function HeaderMount() {
  const pathname = usePathname()
  if (pathname && EXCLUDED.some((re) => re.test(pathname))) return null
  return <Header />
}
