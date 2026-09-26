/**
 * Site-wide constants.
 *
 * The canonical URL was written out four times across layout, sitemap and
 * robots. Moving domain is rare, but when it happens a missed copy produces a
 * sitemap and OG tags pointing at a host you no longer own — the kind of break
 * nothing in the build will catch.
 *
 * The site is on Vercel without a domain of its own, so the address isn't
 * written here at all: VERCEL_PROJECT_PRODUCTION_URL, which Vercel sets at
 * build time, is the project's production domain (a custom one if it ever
 * gets one, otherwise the .vercel.app one). Rename it in the dashboard and
 * the canonical URL, the sitemap and the share image follow on the next
 * deploy. A build anywhere else uses the current address.
 */
export const SITE_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL || "fallord-portfolio.vercel.app";
export const SITE_URL = `https://${SITE_HOST}`;

export const EMAIL = "fadhlanbanin@gmail.com";

export const SOCIALS = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/fadhlan-bani-nugraha" },
    { label: "Instagram", href: "https://www.instagram.com/fadhlanbani/" },
];
