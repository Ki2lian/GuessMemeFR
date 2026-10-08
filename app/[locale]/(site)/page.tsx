import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { HomePreview } from "@/components/site/home-preview";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes";

export default function HomePage() {
    const t = useTranslations("HomePage");

    return (
        <section className="grid flex-1 items-center gap-8 lg:gap-16 lg:grid-cols-[1.05fr_.85fr] mx-auto px-5 sm:px-8 pb-5 w-full max-w-6xl min-h-0 overflow-hidden">
            <div className="min-w-0">
                <p className="mb-3 font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="max-w-2xl font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tighter">{t("title")}</h1>
                <p className="mt-5 max-w-xl text-muted-foreground text-sm sm:text-base leading-6">{t("description")}</p>
                <div className="gap-3 grid sm:grid-cols-2 mt-6 max-w-xl">
                    <Link className={ buttonVariants({ className: "min-h-12 px-5", size: "lg" }) } href={ ROUTES.daily }>
                        {t("dailyChallenge")}
                        <ArrowRight aria-hidden="true" size={ 18 } />
                    </Link>
                    <Link className={ buttonVariants({ className: "min-h-12 px-5", size: "lg", variant: "outline" }) } href={ ROUTES.classic }>
                        {t("classicGame")}
                    </Link>
                </div>
                <p className="mt-3 text-muted-foreground text-xs">{t("noAccountRequired")}</p>
            </div>
            <HomePreview />
        </section>
    );
}
