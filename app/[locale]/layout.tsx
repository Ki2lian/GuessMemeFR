import type { Metadata, Viewport } from "next";

import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";
import Providers from "@/contexts/Providers";
import { routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import { EXTERNAL_LINKS } from "@/routes";

const geistSans = Geist({
    subsets: [ "latin" ],
    variable: "--font-sans",
});

const geistMono = Geist_Mono({
    subsets: [ "latin" ],
    variable: "--font-geist-mono",
});

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export const generateMetadata = async ({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Metadata" });

    return {
        applicationName: t("applicationName"),
        authors: [ { name: "Ki2lian", url: EXTERNAL_LINKS.my_github } ],
        creator: "Ki2lian",
        description: t("description"),
        keywords: "meme, devine, guess, image, web, site",
        metadataBase: new URL(env.BETTER_AUTH_URL),
        openGraph: {
            description: t("openGraphDescription"),
            locale: "fr_FR",
            siteName: t("siteName"),
            title: t("applicationName"),
            type: "website",
        },
        robots: "index, follow",
        title: { default: t("applicationName"), template: `%s | ${ t("applicationName") }` },
    };
};

export const viewport: Viewport = {
    initialScale: 1,
    minimumScale: 1,
    width: "device-width",
};

export const generateStaticParams = () => routing.locales.map(locale => ({ locale }));

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html className={ `${ geistSans.variable } ${ geistMono.variable } h-full antialiased` } lang={ locale } suppressHydrationWarning>
            <body className="overflow-x-hidden">
                <NextIntlClientProvider messages={ messages }>
                    <Providers>{children}</Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
