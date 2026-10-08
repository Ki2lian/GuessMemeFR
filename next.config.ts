import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    headers: async () => [
        {
            headers: [ { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" } ],
            source: "/admin/:path*",
        },
    ],
    images: {
        remotePatterns: [
            { hostname: "cdn.discordapp.com", pathname: "/**", protocol: "https" },
            { hostname: "media.discordapp.net", pathname: "/**", protocol: "https" },
        ],
    },
    poweredByHeader: false,
    serverExternalPackages: [ "discord.js", "@discordjs/ws", "zlib-sync" ],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
