import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userRepository } from "@/data/UserRepository";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export default async function AdminUserPage({ params }: { params: Promise<{ discordId: string }> }) {
    const { discordId } = await params;
    const t = await getTranslations("Admin.users");
    const user = await userRepository.findForAdminByDiscordId(discordId);

    if (!user) {
        notFound();
    }

    const role = user.role.includes("admin") ? "admin" : user.role.includes("editor") ? "editor" : "user";
    const roleVariant = role === "admin" ? "default" : role === "editor" ? "secondary" : "outline";

    return (
        <section className="space-y-8">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Avatar size="lg">
                        <AvatarImage alt={ user.username ?? user.name } src={ user.image ?? undefined } />
                        <AvatarFallback>{user.username ? user.username.slice(0, 1) : user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("profileEyebrow")}</p>
                        <h1 className="mt-1 font-bold text-3xl tracking-tight">{user.name}</h1>
                        <p className="mt-1 text-muted-foreground">{user.username ? `@${ user.username }` : user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant={ roleVariant }>{t(`role${ role.slice(0, 1).toUpperCase() }${ role.slice(1) }`)}</Badge>
                    {user.banned && <Badge variant="destructive">{t("banned")}</Badge>}
                </div>
            </div>
            {user.banned && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("banInformation")}</CardTitle>
                        <CardDescription>{user.banReason ?? t("noBanReason")}</CardDescription>
                    </CardHeader>
                    {user.banExpires && <CardContent>{t("banExpires", { date: dateTimeFormatter.format(user.banExpires) })}</CardContent>}
                </Card>
            )}
            <div className="gap-4 grid sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard label={ t("dailyParticipations") } value={ user._count.dailyResults } />
                <MetricCard label={ t("currentDailyStreak") } value={ user.dailyStreak.current } />
                <MetricCard label={ t("longestDailyStreak") } value={ user.dailyStreak.longest } />
                <MetricCard label={ t("classicParticipations") } value={ user._count.classicResults } />
                <MetricCard label={ t("gamesStarted") } value={ user._count.gameSessions } />
            </div>
            <div className="gap-4 grid xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("dailyHistory")}</CardTitle>
                        <CardDescription>{t("dailyHistoryDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.dailyResults.length > 0 ? (
                            <ol className="divide-y">
                                {user.dailyResults.map(result => (
                                    <li className="py-3" key={ result.id }>
                                        <p className="font-medium">{result.dailyChallenge.meme.title}</p>
                                        <p className="mt-1 text-muted-foreground text-sm">
                                            {dateFormatter.format(result.dailyChallenge.date)} ·{" "}
                                            {t("scoreAttempts", { attempts: result.totalAttempts, score: result.score })}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("noDailyHistory")}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t("connectionHistory")}</CardTitle>
                        <CardDescription>{t("connectionHistoryDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.auditEvents.length > 0 ? (
                            <ol className="divide-y">
                                {user.auditEvents.map(event => (
                                    <li className="flex justify-between gap-4 py-3" key={ `${ event.event }-${ event.occurredAt.toISOString() }` }>
                                        <span>{event.event === "AUTH_SIGNED_IN" ? t("signedIn") : t("signedOut")}</span>
                                        <time className="text-muted-foreground text-sm whitespace-nowrap">
                                            {dateTimeFormatter.format(event.occurredAt)}
                                        </time>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("noConnectionHistory")}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t("sessions")}</CardTitle>
                    <CardDescription>{t("sessionsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {user.sessions.length > 0 ? (
                        <ol className="divide-y">
                            {user.sessions.map(session => (
                                <li className="flex sm:flex-row flex-col sm:justify-between gap-1 py-3" key={ session.id }>
                                    <span className="text-muted-foreground text-sm truncate">{session.userAgent ?? t("unknownDevice")}</span>
                                    <time className="text-muted-foreground text-sm whitespace-nowrap">
                                        {t("sessionCreated", { date: dateTimeFormatter.format(session.createdAt) })}
                                    </time>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-muted-foreground text-sm">{t("noSessions")}</p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}

const MetricCard = ({ label, value }: { label: string; value: number }) => (
    <Card>
        <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="font-bold tabular-nums text-3xl">{value}</CardTitle>
        </CardHeader>
    </Card>
);
