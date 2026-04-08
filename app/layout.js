import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import Providers from "./providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Martly - Local Marketplace | Shop Online from Near You",
  description: "Discover and shop from verified local stores. Fast delivery, great prices, and thousands of products. Order online from your favorite local merchants.",
  keywords: "online shopping, local stores, marketplace, delivery, buy online, ecommerce",
  authors: [{ name: "Martly" }],
  metadataBase: new URL("https://martly.me"),
  openGraph: {
    title: "Martly - Local Marketplace | Shop Online",
    description: "Shop from thousands of local stores with fast delivery",
    url: "https://martly.me",
    siteName: "Martly",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "https://martly.me/og-image.png",
        width: 1200,
        height: 630,
        alt: "Martly Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Martly - Local Marketplace",
    description: "Shop from local stores with fast delivery",
    creator: "@martly",
    images: ["https://martly.me/og-image.png"],
  },
  robots: "index, follow",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"
      suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
