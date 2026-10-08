"use client";

import { CalendarDays, GalleryVerticalEnd, LayoutDashboard, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";

export const AdminSidebar = () => {
    const pathname = usePathname();
    const t = useTranslations("Admin.sidebar");
    const { data: session } = authClient.useSession();
    const isAdmin = session?.user.role?.split(",").includes("admin");
    const navigationItems = [
        { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
        { href: "/admin/memes", icon: GalleryVerticalEnd, label: t("memes") },
        { href: "/admin/daily", icon: CalendarDays, label: t("daily") },
        ...(isAdmin ? [ { href: "/admin/users", icon: UsersRound, label: t("users") } ] : []),
    ] as const;

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link className="flex items-center gap-2 px-2 rounded-md min-h-9 font-semibold group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" href="/admin">
                    <span className="place-items-center grid bg-primary rounded-md size-7 shrink-0 font-mono font-bold text-primary-foreground text-sm tracking-tighter">D:</span>
                    <span className="group-data-[collapsible=icon]:hidden">{t("administration")}</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t("management")}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map(({ href, icon: Icon, label }) => (
                                <SidebarMenuItem key={ href }>
                                    <SidebarMenuButton isActive={ pathname === href } render={ <Link href={ href } /> } tooltip={ label }>
                                        <Icon />
                                        <span>{label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="items-center group-data-[collapsible=icon]:p-2">
                <UserMenu inSidebar />
                <ThemeToggle className="group-data-[collapsible=icon]:min-w-8 group-data-[collapsible=icon]:min-h-8" />
            </SidebarFooter>
        </Sidebar>
    );
};
