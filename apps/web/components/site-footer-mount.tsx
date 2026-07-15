"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/landing/site-footer"

// The footer is marketing/trust chrome, so it renders ONLY on the
// marketing/trust surfaces (allowlist — new routes default clean). The
// three-surfaces doctrine keeps it off everything task-shaped: the guest
// favpoll page (self-evident, zero marketing; CharityBanner already carries
// the no-fee trust line at the point of pledge), the wizard/details/edit
// workspaces, dashboards, auth, and the projector/print surfaces.
const INCLUDED = [
  /^\/$/, // landing
  /^\/about$/,
  /^\/charities(\/[^/]+)?$/,
  /^\/rankings$/,
  /^\/favpolls$/, // the listing only — not favpolls/[id] or the wizard
]

// App-wide footer, mounted in the root layout. A client pathname check is
// used instead of route groups because the excluded display route is nested
// inside favpolls/[id]/ — grouping it out would mean restructuring the whole
// app tree.
export function SiteFooterMount() {
  const pathname = usePathname()
  if (!pathname || !INCLUDED.some((re) => re.test(pathname))) return null
  return <SiteFooter />
}
