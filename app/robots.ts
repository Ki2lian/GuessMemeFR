import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = new URL(env.BETTER_AUTH_URL);

    return {
        rules: {
            allow: "/",
            disallow: "/admin",
            userAgent: "*",
        },
        sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    };
}
