import type { Metadata } from "next";
import { Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Intro from "@/components/Intro";

import ViewportFix from "@/components/ViewportFix";

// Display face. An editorial serif set wide and light, played against the tiny
// monospace labels — that pairing is what reads as an archive or an institution
// rather than as a tech product.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Carries every label, index and readout on the site. A monospace face is the
// single strongest signal of a technical interface — it says the text is data
// rather than prose, before a word of it is read.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/*
 * No `maximumScale` and no `userScalable: false`.
 *
 * Both were set, which disables pinch-to-zoom on the whole site. It is a common
 * default and it fails WCAG 1.4.4: anyone who needs to magnify a certificate
 * scan or a line of body text simply cannot. Locking zoom buys a little
 * protection against iOS input auto-zoom, which this site does not have —
 * there are no form fields anywhere on it.
 */
export const viewport: import("next").Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Written once and reused. Three copies of the same sentence drift the moment
// one of them is edited, and the two that get missed are the ones search
// results and link previews actually show.
const TITLE = "Fadhlan Bani | Creative Developer";
const DESCRIPTION =
  "Fadhlan Bani — web developer and designer. I build web applications with Next.js, React, and TypeScript. Based in Indonesia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Fadhlan Bani Portfolio",
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
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; window.scrollTo(0, 0);`,
          }}
        />
      </head>
      <body
        className={`${newsreader.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased text-white`}
      >
        <ViewportFix />
        <Intro />
        <Cursor />
        <SmoothScroll>
          {/* The halftone field lives on <body>; this gutter is what lets a band
              of it stay visible around the content on all four sides. */}
          <div className="frame">
            <div className="frame-inner">
              <Navbar />
              {children}
            </div>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
