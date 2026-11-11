import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "@/components/motion/motion.css";
import { SITE_URL } from "@/lib/site";
import Header from "@/components/Header";
import GridOverlay from "@/components/GridOverlay";
import CommandPalette from "@/components/CommandPalette";
import IntroScreen from "@/components/IntroScreen";
import PageLoading from "@/components/PageLoading";
import ErrorBoundary from "@/components/ErrorBoundary";
import HudFrame from "@/components/HudFrame";
import Crosshair from "@/components/Crosshair";
import DecodeAll from "@/components/motion/DecodeAll";
import { BOOT_SCRIPT } from "@/lib/intro";

// Everything that is read, and the headings: one grotesque. Without its optical-size axis the font file is a fraction of the size.
const text = Inter({
  variable: "--font-text",
  subsets: ["latin"],
});

// The instrument's own voice: readouts, labels, the navigation, and real code.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Pinch-zoom stays enabled (WCAG 1.4.4) — no maximumScale, no userScalable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
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
        className={`${text.variable} ${geistMono.variable} font-sans antialiased`}
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
        <DecodeAll />
        <ErrorBoundary>
          <HudFrame />
        </ErrorBoundary>
        <Crosshair />
        {/* Film grain over everything, the texture of the reference's renders (globals.css, .grain). */}
        <div aria-hidden="true" className="grain" />
      </body>
    </html>
  );
}
