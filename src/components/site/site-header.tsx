import { CircleUserRound } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { ROUTES } from "@/routes";

export const SiteHeader = () => (
    <header className="flex justify-between items-center px-5 sm:px-8 min-h-16 sm:min-h-20 shrink-0">
        <Link aria-label="Devine le mème, accueil" className="flex items-center gap-2 font-bold tracking-tight" href={ ROUTES.home }>
            <span
                aria-hidden="true"
                className="place-items-center grid bg-primary rounded-md size-7 font-mono font-bold text-primary-foreground text-sm tracking-tighter"
            >
                D:
            </span>
            <span>Devine le mème</span>
        </Link>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
                aria-label="Se connecter"
                className="flex items-center gap-2 px-3 border border-border hover:border-primary rounded-full min-h-11 hover:text-primary text-sm transition-colors"
                href={ ROUTES.login }
            >
                <CircleUserRound aria-hidden="true" size={ 18 } />
                <span className="hidden sm:inline">Se connecter</span>
            </Link>
        </div>
    </header>
);
