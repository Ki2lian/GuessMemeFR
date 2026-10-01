import type { Metadata, Viewport } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Providers from "@/contexts/Providers";
import { EXTERNAL_LINKS } from "@/routes";

const geistSans = Geist({
    subsets: [ "latin" ],
    variable: "--font-sans",
});

const geistMono = Geist_Mono({
    subsets: [ "latin" ],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    applicationName: "Devine le mème",
    authors: [ { name: "Ki2lian", url: EXTERNAL_LINKS.my_github } ],
    creator: "Ki2lian",
    description: "Devine le mème avant que l'image ne se révèle.",
    icons: { icon: "/favicon.ico" },
    keywords: "meme, devine, guess, image, web, site",
    openGraph: {
        description: "Devine le mème avant la révélation.",
        locale: "fr_FR",
        siteName: "Devine le mème",
        title: "Devine le mème",
        type: "website",
    },
    robots: "index, follow",
    title: { default: "Devine le mème", template: "%s | Devine le mème" },
};

export const viewport: Viewport = {
    initialScale: 1,
    minimumScale: 1,
    width: "device-width",
};

export default async function LocaleLayout({ children }: LayoutProps<"/">) {
    return (
        <html className={ `${ geistSans.variable } ${ geistMono.variable } h-full antialiased` } lang="fr" suppressHydrationWarning>
            <body className="overflow-x-hidden">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
