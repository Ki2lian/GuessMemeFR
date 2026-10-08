"use client";

import { LogOut, Shield, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { ROUTES } from "@/routes";

export const UserMenu = ({ inSidebar = false }: { inSidebar?: boolean }) => {
    const router = useRouter();
    const t = useTranslations("Account.menu");
    const { data: session, isPending } = authClient.useSession();

    const signOut = async () => {
        await authClient.signOut();
        router.push(ROUTES.home);
        router.refresh();
    };

    if (isPending) {
        return <Skeleton className={ inSidebar ? "h-9 w-full" : "rounded-full size-11" } />;
    }

    if (!session) {
        return (
            <Link
                aria-label={ t("login") }
                className="flex items-center gap-2 px-3 border border-border hover:border-primary rounded-full min-h-11 hover:text-primary text-sm transition-colors"
                href={ ROUTES.login }
            >
                <UserRound aria-hidden="true" size={ 18 } />
                <span className="hidden sm:inline">{t("login")}</span>
            </Link>
        );
    }

    const user = session.user;

    const hasBackofficeAccess = user.role ? user.role.split(",").some(role => role === "admin" || role === "editor") : false;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button
                        aria-label={ t("open") }
                        className={
                            inSidebar
                                ? "flex items-center gap-2 hover:bg-sidebar-accent p-2 rounded-md w-full text-left transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
                                : "flex items-center gap-2 px-2 border border-border hover:border-primary rounded-full min-h-11 hover:text-primary text-sm transition-colors"
                        }
                        type="button"
                    />
                }
            >
                <Avatar size="sm">
                    <AvatarImage alt={ user.username ?? user.name } src={ user.image ?? undefined } />
                    <AvatarFallback>{user.username ? user.username.slice(0, 1) : user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <span className={ inSidebar ? "group-data-[collapsible=icon]:hidden truncate" : "hidden sm:inline max-w-32 truncate" }>
                    {user.name}
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuItem render={ <Link href={ ROUTES.profile } /> }>
                        <UserRound />
                        {t("profile")}
                    </DropdownMenuItem>
                    {hasBackofficeAccess && (
                        <DropdownMenuItem render={ <Link href={ ROUTES.admin } /> }>
                            <Shield />
                            {t("admin")}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={ signOut } variant="destructive">
                        <LogOut />
                        {t("logout")}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
