import "@/styles/globals.css"
import { Metadata } from "next"
import { JetBrains_Mono, Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AudioPlayerProvider } from "@/components/player/audio-player-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { FloatingCartButton } from "@/components/cart/floating-cart-button"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["700"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400"],
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "Glitch Studios", template: "%s | Glitch Studios" },
  description:
    "Music and video production studio. Studio sessions, mixing, mastering, video production, beat sales.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-black text-white font-sans antialiased">
        <NuqsAdapter>
          <AudioPlayerProvider>
            <CartProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <CartDrawer />
              <FloatingCartButton />
              <Toaster />
            </CartProvider>
          </AudioPlayerProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
