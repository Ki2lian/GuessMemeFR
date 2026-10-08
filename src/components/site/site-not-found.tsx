import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes";

export const SiteNotFound = async () => {
    const t = await getTranslations("NotFound.site");

    return (
        <div className="flex flex-col bg-background min-h-svh text-foreground">
            <SiteHeader />
            <main className="flex flex-col flex-1">
                <section className="items-center gap-12 grid lg:grid-cols-2 flex-1 mx-auto px-5 sm:px-8 py-20 sm:py-28 w-full max-w-6xl">
                    <div>
                        <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                        <h1 className="mt-3 max-w-2xl font-bold text-5xl sm:text-7xl tracking-tighter">{t("title")}</h1>
                        <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-8">{t("description")}</p>
                        <Link className={ buttonVariants({ className: "mt-8 w-fit min-h-11 px-5", size: "lg" }) } href={ ROUTES.home }>
                            {t("backHome")}
                        </Link>
                    </div>
                    <div className="justify-self-center lg:justify-self-end border rounded-xl overflow-hidden shadow-lg">
                        <Image alt={ t("imageAlt") } className="w-full max-w-sm" height={ 190 } priority src="/images/confused.gif" unoptimized width={ 338 } />
                    </div>
                </section>
            </main>
        </div>
    );
};
