import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async () => {
    const locale = routing.defaultLocale;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return {
        locale,
        messages: (await import(`../messages/${ locale }.json`)).default,
    };
});
