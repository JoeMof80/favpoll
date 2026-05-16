import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@/components/clerk-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { EditModeProvider } from "@/lib/edit-mode-context"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

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
        className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
      >
        <body>
          <ThemeProvider>
            <EditModeProvider>
              <Header />
              {children}
            </EditModeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
