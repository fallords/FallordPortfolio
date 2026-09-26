/**
 * Site-wide constants.
 *
 * The canonical URL was written out four times across layout, sitemap and
 * robots. Moving domain is rare, but when it happens a missed copy produces a
 * sitemap and OG tags pointing at a host you no longer own — the kind of break
 * nothing in the build will catch.
 *
 * The site lives at fadhlanbani.vercel.app; the project's original
 * fallord-portfolio.vercel.app now only redirects there. With two .vercel.app
 * names, Vercel's own VERCEL_PROJECT_PRODUCTION_URL could name either, so the
 * .vercel.app one is pinned here. Should the project ever get a domain of its
 * own, Vercel reports that one at build time and it takes over by itself.
 */
const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_HOST =
    productionDomain && !productionDomain.endsWith(".vercel.app") ? productionDomain : "fadhlanbani.vercel.app";
export const SITE_URL = `https://${SITE_HOST}`;

export const EMAIL = "fadhlanbanin@gmail.com";

export const SOCIALS = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/fadhlan-bani-nugraha" },
    { label: "Instagram", href: "https://www.instagram.com/fadhlanbani/" },
];
