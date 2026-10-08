import { MemeStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export class DashboardRepository {
    async getOverview() {
        const now = new Date();
        const sevenDaysAgo = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
        const [ userCount, publishedMemeCount, generatedChallengeCount, results ] = await Promise.all([
            prisma.user.count(),
            prisma.meme.count({ where: { status: MemeStatus.PUBLISHED }}),
            prisma.dailyChallenge.count(),
            prisma.dailyResult.findMany({
                orderBy: { completedAt: "asc" },
                select: { completedAt: true },
                where: { completedAt: { gte: sevenDaysAgo }},
            }),
        ]);
        const resultsByDay = new Map<string, number>();

        for (const result of results) {
            const key = startOfDay(result.completedAt).toISOString();
            resultsByDay.set(key, (resultsByDay.get(key) ?? 0) + 1);
        }

        const activity = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(sevenDaysAgo);
            date.setDate(sevenDaysAgo.getDate() + index);
            const key = startOfDay(date).toISOString();

            return { date: key, participations: resultsByDay.get(key) ?? 0 };
        });

        return { activity, generatedChallengeCount, publishedMemeCount, userCount };
    }
}

export const dashboardRepository = new DashboardRepository();
