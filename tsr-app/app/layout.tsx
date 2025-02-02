import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { AppBar } from "@/components/app-bar"
import { Sidebar } from "@/components/sidebar"
import SessionProvider from "../components/session-provider"
import type React from "react"
import "@/app/globals.css"
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route"
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <AuthProvider>
              <div className="min-h-screen text-foreground traffic-signs-bg">
                <div className="min-h-screen bg-overlay">
                  <div className="border-b border-border bg-surface-a10 dark:bg-surface-a10 fixed top-0 left-0 right-0 z-50">
                    <AppBar />
                  </div>
                  <div className="flex pt-16">
                    <Sidebar />
                    <main className="flex-1 p-6 ml-56">{children}</main>
                  </div>
                </div>
              </div>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

