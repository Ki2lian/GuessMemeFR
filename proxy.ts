import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: [
        {
            missing: [
                { key: "next-router-prefetch", type: "header" },
                { key: "purpose", type: "header", value: "prefetch" },
            ],
            source: "/((?!api|_next|.*\\..*).*)",
        },
    ],
};