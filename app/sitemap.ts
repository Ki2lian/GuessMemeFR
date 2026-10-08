import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = new URL(env.BETTER_AUTH_URL);

    return [
        {
            changeFrequency: "weekly",
            priority: 1,
            url: new URL("/", siteUrl).toString(),
        },
        {
            changeFrequency: "daily",
            priority: 0.8,
            url: new URL("/daily", siteUrl).toString(),
        },
    ];
}
