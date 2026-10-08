"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = useTranslations("ErrorPage.admin");

    return (
        <section className="flex flex-col flex-1 justify-center py-12 sm:py-20">
            <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
            <h1 className="mt-3 max-w-2xl font-bold text-4xl sm:text-5xl tracking-tight">{t("title")}</h1>
            <p className="mt-4 max-w-xl text-muted-foreground text-lg leading-8">{t("description")}</p>
            <div className="flex flex-wrap gap-3 mt-8">
                <Button onClick={ reset } size="lg" type="button">{t("retry")}</Button>
                <Link className={ buttonVariants({ size: "lg", variant: "outline" }) } href={ ROUTES.admin }>{t("backDashboard")}</Link>
            </div>
        </section>
    );
}
