"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const DashboardActivityChart = ({ activity }: { activity: Array<{ date: string; participations: number }> }) => {
    const t = useTranslations("Admin.dashboard");
    const chartData = activity.map(item => ({
        ...item,
        label: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(new Date(item.date)),
    }));
    const chartConfig = {
        participations: { color: "var(--primary)", label: t("participations") },
    } satisfies ChartConfig;

    return (
        <ChartContainer className="aspect-auto h-36 min-h-0 w-full" config={ chartConfig } id="daily-participations">
            <BarChart accessibilityLayer data={ chartData }>
                <CartesianGrid vertical={ false } />
                <XAxis axisLine={ false } dataKey="label" tickLine={ false } tickMargin={ 8 } />
                <ChartTooltip content={ <ChartTooltipContent hideLabel /> } cursor={ false } />
                <Bar dataKey="participations" fill="var(--color-participations)" radius={ 6 } />
            </BarChart>
        </ChartContainer>
    );
};
