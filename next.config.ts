import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/*
 * What a page on this site may load. Everything is refused by default, then
 * each kind of resource the pages actually use is allowed from the site
 * itself only: fonts are self-hosted by next/font, images and frames live in
 * /public, and nothing talks to another server from the browser. There are
 * no plugins, frames, workers, media or forms, so those stay refused.
 *
 * Scripts keep 'unsafe-inline' because every page is prerendered and carries
 * inline scripts (the boot script in layout.tsx, and Next's own page data).
 * Nonces would need a server render per request. With no user input anywhere
 * on the site there is nothing to inject into those scripts, and the policy
 * still stops scripts from any other origin. Inline event handlers
 * (onclick="…" in markup), a common way in for injected code, are refused
 * outright: React attaches its handlers from JavaScript.
 *
 * `next dev` needs eval and a websocket for hot reload, so the policy is only
 * sent in production.
 */
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Browsers must use the declared type, never guess one from the bytes.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No other site may put these pages in a frame (clickjacking); CSP says it again for newer browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Other sites see only the origin they came from, never the full path.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here needs the camera, the microphone, location, payments or USB.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  // A page opened from here can't reach back into this one through window.opener.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Only the images the site shows can go through the optimizer, so no one
    // can spend its quota on other files. /frames is the portrait (Portrait.tsx
    // and the design demo build optimizer URLs for it themselves).
    localPatterns: [
      { pathname: "/frames/**", search: "" },
      { pathname: "/certificates/**", search: "" },
      { pathname: "/sera-screen.png", search: "" },
      { pathname: "/cv-maker-phone.png", search: "" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Other sites can't embed these files (images, fonts, PDFs) in their own
        // pages. The share image is left out: link previews fetch it from elsewhere.
        source: "/((?!opengraph-image).*)",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "same-origin" }],
      },
      ...(isProduction
        ? [
            {
              // Every route except the PDFs: the policy is written for the pages,
              // and a PDF opens in the browser's own viewer instead.
              source: "/((?!.*\\.pdf$).*)",
              headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }],
            },
          ]
        : []),
      {
        // Portrait frames — immutable, cache for 1 year
        source: "/frames/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // All other static assets (fonts, icons, etc.)
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
