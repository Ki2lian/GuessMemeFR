import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { DiscordSignInButton } from "@/components/auth/discord-sign-in-button";
import { userRepository } from "@/data/UserRepository";
import { getBanNoticeUserId } from "@/lib/auth/ban-notice";
import { getSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
    robots: { follow: false, index: false },
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
    const t = await getTranslations("Account.login");
    if (await getSession()) {
        redirect(ROUTES.profile);
    }

    const params = await searchParams;
    const banNoticeUserId = params.error === "BANNED_USER" ? getBanNoticeUserId(params.error_description) : null;
    const ban = banNoticeUserId ? await userRepository.findBanNoticeById(banNoticeUserId) : null;
    const isBanned = Boolean(ban?.banned && (!ban.banExpires || ban.banExpires > new Date()));
    const banExpiration = ban?.banExpires
        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(ban.banExpires)
        : null;

    return (
        <section className="place-items-center grid flex-1 px-5 py-12">
            <div className="w-full max-w-md">
                <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("title")}</h1>
                <p className="mt-3 text-muted-foreground">{t("description")}</p>
                {params.error === "BANNED_USER" && (
                    <aside className="mt-6 border-destructive/40 bg-destructive/10 p-4 border rounded-lg text-sm" role="alert">
                        <p className="font-semibold">{t("banned.title")}</p>
                        {isBanned ? (
                            <>
                                <p className="mt-2">{ban?.banReason ?? t("banned.noReason")}</p>
                                <p className="mt-2 text-muted-foreground">
                                    {banExpiration ? t("banned.expiresAt", { date: banExpiration }) : t("banned.permanent")}
                                </p>
                            </>
                        ) : <p className="mt-2">{t("banned.generic")}</p>}
                    </aside>
                )}
                <div className="mt-8">
                    <DiscordSignInButton />
                </div>
            </div>
        </section>
    );
}
