import { useTranslations } from "next-intl";
import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ROUTES } from "@/routes";

export const SiteHeader = () => {
    const t = useTranslations("Navigation");

    return (
        <header className="flex justify-between items-center px-5 sm:px-8 min-h-16 shrink-0">
            <Link aria-label={ t("homeAriaLabel") } className="flex items-center gap-2 font-bold tracking-tight" href={ ROUTES.home }>
                <span
                    aria-hidden="true"
                    className="place-items-center grid bg-primary rounded-md size-7 font-mono font-bold text-primary-foreground text-sm tracking-tighter"
                >
                    D:
                </span>
                <span>{t("brand")}</span>
            </Link>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
};
