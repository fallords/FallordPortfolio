import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/Header";
import GridOverlay from "@/components/GridOverlay";
import CommandPalette from "@/components/CommandPalette";
import IntroScreen from "@/components/IntroScreen";
import PageLoading from "@/components/PageLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BOOT_SCRIPT } from "@/lib/intro";

// Interface and body text.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Data only: years, stacks, the clock, the frame counter.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Display only, and only at sizes where its contrast holds up (32px and over).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

// Pinch-zoom stays enabled (WCAG 1.4.4) — no maximumScale, no userScalable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1011",
};

const TITLE = "Fadhlan Bani · Developer & designer";
const DESCRIPTION =
  "Fadhlan Bani is a developer and designer in Indonesia. He builds software for the web, AI and small hardware, and designs what he builds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Fadhlan Bani",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The boot script sets data-* on <html> before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${cormorant.variable} font-sans antialiased`}
      >
        <IntroScreen />
        <Header />
        <ErrorBoundary>
          <PageLoading />
        </ErrorBoundary>
        {children}
        {/* Extras: if one of them breaks, the page goes on without it. */}
        <ErrorBoundary>
          <GridOverlay />
        </ErrorBoundary>
        <ErrorBoundary>
          <CommandPalette />
        </ErrorBoundary>
      </body>
    </html>
  );
}
