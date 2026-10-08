"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = useTranslations("ErrorPage.site");

    return (
        <section className="items-center gap-12 grid lg:grid-cols-2 flex-1 mx-auto px-5 sm:px-8 py-20 sm:py-28 w-full max-w-6xl">
            <div>
                <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="mt-3 max-w-2xl font-bold text-5xl sm:text-7xl tracking-tighter">{t("title")}</h1>
                <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-8">{t("description")}</p>
                <Button className="mt-8 min-h-11 px-5" onClick={ reset } size="lg" type="button">
                    {t("retry")}
                </Button>
            </div>
            <div className="justify-self-center lg:justify-self-end border rounded-xl overflow-hidden shadow-lg">
                <Image alt={ t("imageAlt") } className="w-full max-w-sm" height={ 190 } priority src="/images/confused.gif" unoptimized width={ 338 } />
            </div>
        </section>
    );
}
