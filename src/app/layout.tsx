import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fadhlanbani.com"),
  title: "Fadhlan Bani | Creative Developer",
  description: "Web Developer, Designer, Software Engineer, & AI Integration Developer specializing in high-end digital experiences.",
  openGraph: {
    title: "Fadhlan Bani | Creative Developer",
    description: "Web Developer, Designer, Software Engineer, & AI Integration Developer specializing in high-end digital experiences.",
    url: "https://fadhlanbani.com",
    siteName: "Fadhlan Bani Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fadhlan Bani | Creative Developer",
    description: "Web Developer, Designer, Software Engineer, & AI Integration Developer specializing in high-end digital experiences.",
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
        className={`${syne.variable} ${manrope.variable} font-sans antialiased bg-black text-white overflow-x-clip`}
      >
        <Preloader />
        <Cursor />
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
