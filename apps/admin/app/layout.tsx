import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Sidebar } from '@/components/sidebar'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'favpoll admin',
  description: 'favpoll administration',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
        <body className="h-full flex font-sans bg-neutral-50 text-neutral-900">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
