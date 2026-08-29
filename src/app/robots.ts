import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * Replaces an empty public/robots.txt that shipped 0 bytes — served fine,
 * said nothing, and never pointed crawlers at the sitemap next door.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
