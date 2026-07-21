import type { Metadata } from "next"
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@/components/clerk-provider"
import { ThemeProvider } from "@favpoll/ui"
import { EditModeProvider } from "@/lib/edit-mode-context"
import { HeaderMount } from "@/components/header-mount"
import { SiteFooterMount } from "@/components/site-footer-mount"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

// iOS Safari auto-detects digit runs as phone numbers and rewrites them
// into <a href="tel:..."> BEFORE React hydrates — a guaranteed hydration
// mismatch on real devices (2026-07-21 iPhone pass: "Charity no. 1082947"
// became a tel: link and the poll page tree regenerated). Declaring
// format-detection off keeps server and client DOM identical. Merged
// beneath every page's own metadata by Next.
export const metadata: Metadata = {
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
            <EditModeProvider>
              <HeaderMount />
              {children}
              <SiteFooterMount />
            </EditModeProvider>
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
