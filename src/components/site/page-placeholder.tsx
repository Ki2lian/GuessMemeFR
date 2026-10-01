import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes";

export const PagePlaceholder = ({ description, title }: { description: string; title: string }) => (
    <main className="bg-background min-h-screen">
        <SiteHeader />
        <section className="mx-auto px-5 sm:px-8 py-24 sm:py-36 w-full max-w-6xl">
            <p className="mb-4 font-mono font-bold text-primary text-xs uppercase tracking-wider">Bientôt disponible</p>
            <h1 className="max-w-xl font-bold text-5xl sm:text-7xl tracking-tighter">{title}</h1>
            <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-8">{description}</p>
            <Link className={ buttonVariants({ className: "mt-8 min-h-11 px-5", size: "lg" }) } href={ ROUTES.home }>
                Retour à l&apos;accueil
            </Link>
        </section>
    </main>
);
