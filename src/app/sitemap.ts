import type { MetadataRoute } from "next";
import { essays } from "@/content/writing";
import { SITE_URL as BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        // Essay pages add themselves as soon as they exist.
        ...essays.map((essay) => ({
            url: `${BASE_URL}/writing/${essay.slug}`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.7,
        })),
    ];
}
