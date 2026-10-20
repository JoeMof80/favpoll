import type { Metadata } from "next"
import Link from "next/link"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ClerkProvider, UserButton } from "@clerk/nextjs"
import { ThemeProvider, MenuButton } from "@favpoll/ui"
import { Sidebar } from "@/components/sidebar"
import { FavpollLogo } from "@/components/favpoll-logo"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

export const metadata: Metadata = {
  title: "favpoll admin",
  description: "favpoll administration",
}

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
        className={`${plusJakartaSans.variable} h-full antialiased`}
      >
        <body className="flex h-full flex-col bg-background font-sans text-foreground">
          <ThemeProvider>
            <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
              <Link
                href="/"
                aria-label="Admin dashboard"
                className="inline-flex items-center gap-2.5"
              >
                <FavpollLogo />
                <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  admin
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <MenuButton />
                <UserButton />
              </div>
            </header>
            <div className="flex min-h-0 flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto p-8">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
