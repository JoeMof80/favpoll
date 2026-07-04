"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/landing/site-footer"

// Full-screen surfaces that must not carry the site footer.
const EXCLUDED = [
  /^\/favpolls\/[^/]+\/live$/, // projector live display
]

// App-wide footer, mounted in the root layout. A client pathname check is
// used instead of route groups because the excluded display route is nested
// inside favpolls/[id]/ — grouping it out would mean restructuring the whole
// app tree.
export function SiteFooterMount() {
  const pathname = usePathname()
  if (pathname && EXCLUDED.some((re) => re.test(pathname))) return null
  return <SiteFooter />
}
