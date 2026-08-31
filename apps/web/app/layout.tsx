import type { Metadata } from "next"
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@/components/clerk-provider"
import { ThemeProvider } from "@favpoll/ui"
import { HeaderMount } from "@/components/header-mount"
import { SiteFooterMount } from "@/components/site-footer-mount"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import {
  OG_SITE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  siteBaseUrl,
} from "@/lib/og/site"

// iOS Safari auto-detects digit runs as phone numbers and rewrites them
// into <a href="tel:..."> BEFORE React hydrates — a guaranteed hydration
// mismatch on real devices (2026-07-21 iPhone pass: "Charity no. 1082947"
// became a tel: link and the poll page tree regenerated). Declaring
// format-detection off keeps server and client DOM identical. Merged
// beneath every page's own metadata by Next.
//
// The Open Graph identity lives here too: metadataBase turns every page's
// relative og:url / og:image into an absolute one (crawlers ignore
// relative ones), and the site-wide card is app/opengraph-image.tsx. A
// page that sets its own `openGraph` replaces this one wholesale — spread
// OG_SITE in (see lib/og/favpoll-og.ts). No og:title here on purpose: Next
// derives og:title/og:description from each page's own title/description,
// and a layout-level one would override them all (measured 2026-08-29:
// /about previewed as "favpoll" until it was removed).
export const metadata: Metadata = {
  metadataBase: siteBaseUrl(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: OG_SITE,
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, address: false, email: false },
}

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "antialiased",
          fontMono.variable,
          "font-sans",
          plusJakartaSans.variable
        )}
      >
        <body>
          <ThemeProvider>
            <HeaderMount />
            {children}
            <SiteFooterMount />
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
