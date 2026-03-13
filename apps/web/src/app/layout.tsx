import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Timebeat — Track Your Time",
    template: "%s | Timebeat",
  },
  description:
    "Cross-platform time tracking app for personal productivity. Track sessions, manage projects, and gain insights into how you spend your time.",
  keywords: [
    "time tracking",
    "productivity",
    "pomodoro",
    "project management",
    "time management",
  ],
  authors: [{ name: "Timebeat" }],
  creator: "Timebeat",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Timebeat",
    title: "Timebeat — Track Your Time",
    description: "Cross-platform time tracking for personal productivity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timebeat — Track Your Time",
    description: "Cross-platform time tracking for personal productivity",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
