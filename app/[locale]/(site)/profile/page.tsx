import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userRepository } from "@/data/UserRepository";
import { getSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
    robots: { follow: false, index: false },
};

export default async function ProfilePage() {
    const session = await getSession();
    const t = await getTranslations("Account.profile");

    if (!session) {
        redirect(ROUTES.login);
    }

    const user = session.user;
    const overview = await userRepository.getProfileOverview(user.id);

    return (
        <section className="flex flex-1 justify-center px-5 py-12">
            <div className="w-full max-w-2xl">
                <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("title")}</h1>
                <div className="flex items-center gap-4 mt-8 p-5 border rounded-xl">
                    <Avatar className="size-16 text-xl" size="lg">
                        <AvatarImage alt={ user.username ?? user.name } src={ user.image ?? undefined } />
                        <AvatarFallback>{user.username ? user.username.slice(0, 1) : user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="mt-1 text-muted-foreground text-xs">{t("role", { role: user.role ?? "unknown" })}</p>
                    </div>
                </div>
                <section className="mt-8">
                    <div className="gap-4 grid sm:grid-cols-2 mb-8">
                        <div className="p-5 border rounded-xl">
                            <p className="text-muted-foreground text-sm">{t("currentDailyStreak")}</p>
                            <p className="mt-1 font-bold tabular-nums text-3xl">{t("streakDays", { count: overview?.dailyStreak.current ?? 0 })}</p>
                        </div>
                        <div className="p-5 border rounded-xl">
                            <p className="text-muted-foreground text-sm">{t("longestDailyStreak")}</p>
                            <p className="mt-1 font-bold tabular-nums text-3xl">{t("streakDays", { count: overview?.dailyStreak.longest ?? 0 })}</p>
                        </div>
                    </div>
                    <h2 className="font-semibold text-xl">{t("classicHistoryTitle")}</h2>
                    <p className="mt-1 text-muted-foreground text-sm">{t("classicGamesCompleted", { count: overview?._count.classicResults ?? 0 })}</p>
                    {overview?.classicResults.length ? (
                        <ul className="mt-4 border rounded-xl divide-y">
                            {overview.classicResults.map(result => (
                                <li className="flex sm:flex-row flex-col sm:justify-between gap-1 p-4" key={ result.seed.toString() }>
                                    <span className="font-medium">{t("classicResult", { attempts: result.totalAttempts, score: result.score, solved: result.solvedRounds })}</span>
                                    <time className="text-muted-foreground text-sm" dateTime={ result.completedAt.toISOString() }>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(result.completedAt)}</time>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="mt-4 text-muted-foreground">{t("noClassicGames")}</p>}
                </section>
            </div>
        </section>
    );
}
