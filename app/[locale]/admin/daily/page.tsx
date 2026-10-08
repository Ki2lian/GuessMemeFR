import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { DailyCalendar } from "@/app/admin/daily/daily-calendar";
import { DailyChallengePreview } from "@/app/admin/daily/daily-challenge-preview";
import { Badge } from "@/components/ui/badge";
import { dailyChallengeRepository } from "@/data/DailyChallengeRepository";
import { effectFromDatabase } from "@/data/DailyChallengeRepository";

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

const isDateKey = (value: string | undefined): value is string => Boolean(value && (/^\d{4}-\d{2}-\d{2}$/).test(value));

export default async function AdminDailyPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const t = await getTranslations("Admin.daily");
    const { date } = await searchParams;
    const dailyDates = await dailyChallengeRepository.listDatesForAdmin();
    const availableDates = dailyDates.map(daily => dateKey(daily.date));
    const selectedDate = isDateKey(date) && availableDates.includes(date) ? date : availableDates[0];
    const dailyChallenge = selectedDate
        ? await dailyChallengeRepository.findForAdminByDate(new Date(`${ selectedDate }T00:00:00.000Z`))
        : null;
    const canonicalAnswer = Array.isArray(dailyChallenge?.answers) && typeof dailyChallenge.answers[0] === "string" ? dailyChallenge.answers[0] : undefined;
    const participantCount = dailyChallenge?._count.sessions ?? 0;
    const successCount = dailyChallenge?._count.results ?? 0;
    const successRate = participantCount > 0 ? Math.round((successCount / participantCount) * 100) : 0;
    const effectLabels = {
        DISTORTED: t("effectDistorted"),
        HIDDEN: t("effectHidden"),
        PIXELATED: t("effectPixelated"),
        SCRAMBLED: t("effectScrambled"),
        ZOOMED_IN: t("effectZoomedIn"),
    } as const;

    return (
        <section className="space-y-8">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-end gap-4">
                <div>
                    <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                    <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("title")}</h1>
                    <p className="mt-3 max-w-2xl text-muted-foreground">{t("description")}</p>
                </div>
                <DailyCalendar availableDates={ availableDates } selectedDate={ selectedDate } />
            </div>
            {dailyChallenge ? (
                <div className="border rounded-xl">
                    <div className="flex justify-between gap-6 p-6 border-b">
                        <div>
                            <p className="font-medium text-muted-foreground text-sm">{t("date")}</p>
                            <h2 className="mt-1 font-bold text-2xl">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(dailyChallenge.date)}</h2>
                            <p className="mt-4 font-semibold">{dailyChallenge.title}</p>
                            {canonicalAnswer && <p className="mt-1 text-muted-foreground text-sm">{t("answer")} : {canonicalAnswer}</p>}
                        </div>
                        <DailyChallengePreview effect={ effectFromDatabase[dailyChallenge.effect] } imageStorageKey={ dailyChallenge.imageStorageKey } seed={ Number(dailyChallenge.seed) } title={ dailyChallenge.title } />
                    </div>
                    <div className="gap-4 grid sm:grid-cols-3 p-6">
                        <Metric label={ t("participants") } value={ participantCount } />
                        <Metric label={ t("successRate") } value={ `${ successRate } %` } />
                        <Metric label={ t("averageAttempts") } value={ dailyChallenge.averageAttempts.toFixed(1) } />
                    </div>
                    <div className="gap-4 grid sm:grid-cols-2 p-6 border-t text-sm">
                        <p>{t("revealEffect")} : <Badge variant="secondary">{effectLabels[dailyChallenge.effect]}</Badge></p>
                        <p>{t("seed")} : <code>{dailyChallenge.seed.toString()}</code></p>
                    </div>
                    <div className="p-6 border-t">
                        <h3 className="font-semibold">{t("leaderboard")}</h3>
                        {dailyChallenge.results.length > 0 ? (
                            <ol className="mt-4 divide-y">
                                {dailyChallenge.results.map((result, index) => {
                                    const durationMs = result.completedAt.getTime() - result.gameSession.startedAt.getTime();
                                    const durationSeconds = Math.max(0, Math.round(durationMs / 1000));

                                    const username = result.user.username ? `@${ result.user.username }` : result.user.name;
                                    const profileLink = result.user.discordId ? `/admin/users/${ result.user.discordId }` : undefined;

                                    return <li className="py-3" key={ `${ result.user.name }-${ result.completedAt.toISOString() }` }>
                                        <span>{index + 1}. </span>
                                        {profileLink ? <Link className="font-medium hover:text-primary hover:underline" href={ profileLink }>{username}</Link> : <span className="font-medium">{username}</span>}
                                        <span className="text-muted-foreground"> — {t("leaderboardResult", { attempts: result.totalAttempts, seconds: durationSeconds })}</span>
                                    </li>;
                                })}
                            </ol>
                        ) : <p className="mt-3 text-muted-foreground text-sm">{t("noLeaderboard")}</p>}
                    </div>
                </div>
            ) : (
                <div className="place-items-center grid border rounded-xl min-h-56 text-muted-foreground">{t("noChallenge")}</div>
            )}
        </section>
    );
}

const Metric = ({ label, value }: { label: string; value: number | string }) => (
    <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-1 font-bold text-2xl">{value}</p>
    </div>
);
