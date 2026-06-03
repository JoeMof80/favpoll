import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider, MenuButton } from "@favpoll/ui";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "favpoll admin",
  description: "favpoll administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} h-full antialiased`}
      >
        <body className="h-full flex flex-col bg-background text-foreground font-sans">
          <ThemeProvider>
            <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
              <span className="text-sm text-muted-foreground">
                favpoll admin
              </span>
              <MenuButton />
            </header>
            <div className="flex flex-1 min-h-0">
              <Sidebar />
              <main className="flex-1 overflow-auto p-8">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
