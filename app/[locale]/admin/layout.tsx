import type { Metadata } from "next";

import { House } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { buttonVariants } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { hasBackofficeAccess } from "@/lib/auth/authorization";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
    robots: { follow: false, index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    const t = await getTranslations("Admin.layout");

    if (!session || !hasBackofficeAccess(session.user.role)) {
        notFound();
    }

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex items-center gap-3 px-4 border-b min-h-16">
                    <SidebarTrigger />
                    <p className="font-semibold text-sm">{t("title")}</p>
                    <Link className={ buttonVariants({ className: "ml-auto", size: "sm", variant: "outline" }) } href="/">
                        <House />{t("returnToSite")}
                    </Link>
                </header>
                <div className="flex-1 p-4 sm:p-6">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
