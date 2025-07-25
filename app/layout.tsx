import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingAnimation } from "@/components/loading-animation"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "dumbsplain.help | Understand anything",
  description: "Understand any topic at any level of expertise",
  generator: 'Cursor',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${poppins.variable} font-poppins`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <AuthProvider>
          <LoadingAnimation />
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
