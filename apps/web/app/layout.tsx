import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@/components/clerk-provider"
import { ThemeProvider } from "@favpoll/ui"
import { EditModeProvider } from "@/lib/edit-mode-context"
import { HeaderMount } from "@/components/header-mount"
import { SiteFooterMount } from "@/components/site-footer-mount"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

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
