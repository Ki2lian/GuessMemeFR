import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { SiteNotFound } from "@/components/site/site-not-found";
import { buttonVariants } from "@/components/ui/button";
import { hasBackofficeAccess } from "@/lib/auth/authorization";
import { getSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes";

export default async function AdminNotFound() {
    const session = await getSession();

    if (!session || !hasBackofficeAccess(session.user.role)) {
        return <SiteNotFound />;
    }

    const t = await getTranslations("NotFound.admin");

    return (
        <section className="flex flex-col flex-1 justify-center py-12 sm:py-20">
            <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
            <h1 className="mt-3 max-w-2xl font-bold text-4xl sm:text-5xl tracking-tight">{t("title")}</h1>
            <p className="mt-4 max-w-xl text-muted-foreground text-lg leading-8">{t("description")}</p>
            <Link className={ buttonVariants({ className: "mt-8 w-fit", size: "lg" }) } href={ ROUTES.admin }>
                {t("backDashboard")}
            </Link>
        </section>
    );
}
