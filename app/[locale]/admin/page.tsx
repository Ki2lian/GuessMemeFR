import { getTranslations } from "next-intl/server";

import { DashboardActivityChart } from "@/app/admin/dashboard-activity-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardRepository } from "@/data/DashboardRepository";

export default async function AdminPage() {
    const t = await getTranslations("Admin.dashboard");
    const overview = await dashboardRepository.getOverview();

    return (
        <section className="space-y-8">
            <div>
                <p className="font-mono font-bold text-primary text-xs uppercase tracking-wider">{t("eyebrow")}</p>
                <h1 className="mt-2 font-bold text-3xl tracking-tight">{t("title")}</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">{t("description")}</p>
            </div>
            <div className="gap-4 grid sm:grid-cols-3">
                <MetricCard description={ t("membersDescription") } title={ t("members") } value={ overview.userCount } />
                <MetricCard description={ t("publishedMemesDescription") } title={ t("publishedMemes") } value={ overview.publishedMemeCount } />
                <MetricCard description={ t("publishedChallengesDescription") } title={ t("publishedChallenges") } value={ overview.generatedChallengeCount } />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t("activityTitle")}</CardTitle>
                    <CardDescription>{t("activityDescription")}</CardDescription>
                </CardHeader>
                <CardContent><DashboardActivityChart activity={ overview.activity } /></CardContent>
            </Card>
        </section>
    );
}

const MetricCard = ({ description, title, value }: { description: string; title: string; value: number }) => (
    <Card>
        <CardHeader>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="font-bold tabular-nums text-3xl">{value}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">{description}</CardContent>
    </Card>
);
