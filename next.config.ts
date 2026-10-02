import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    serverExternalPackages: [ "discord.js", "@discordjs/ws", "zlib-sync" ],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
