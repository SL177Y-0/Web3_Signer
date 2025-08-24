import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { DynamicProvider } from "@/components/dynamic-provider"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Web3 Message Signer",
  description: "Secure message signing and verification for Web3",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <DynamicProvider>
          {children}
        </DynamicProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "dark:bg-card dark:text-card-foreground border dark:border-border",
          }}
        />
      </body>
    </html>
  )
}
