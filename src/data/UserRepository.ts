import { getDailyStreak } from "@/lib/game/daily-streak";
import { prisma } from "@/lib/prisma";

export class UserRepository {
    async findBanNoticeById(id: string) {
        return prisma.user.findUnique({
            select: {
                banExpires: true,
                banned: true,
                banReason: true,
            },
            where: { id },
        });
    }

    async findForAdminByDiscordId(discordId: string) {
        const user = await prisma.user.findUnique({
            select: {
                _count: {
                    select: { classicResults: true, dailyResults: true, gameSessions: true },
                },
                auditEvents: {
                    orderBy: { occurredAt: "desc" },
                    select: { event: true, occurredAt: true },
                    take: 20,
                },
                banExpires: true,
                banned: true,
                banReason: true,
                createdAt: true,
                dailyResults: {
                    include: {
                        dailyChallenge: {
                            include: { meme: { select: { title: true }}},
                        },
                    },
                    orderBy: { completedAt: "desc" },
                    take: 10,
                },
                discordId: true,
                email: true,
                id: true,
                image: true,
                name: true,
                role: true,
                sessions: {
                    orderBy: { createdAt: "desc" },
                    select: { createdAt: true, expiresAt: true, id: true, ipAddress: true, userAgent: true },
                    take: 10,
                },
                username: true,
            },
            where: { discordId },
        });

        return user ? { ...user, dailyStreak: await this.getDailyStreak(user.id) } : null;
    }

    async getDailyStreakForUser(id: string) {
        return this.getDailyStreak(id);
    }

    async getProfileOverview(id: string) {
        const overview = await prisma.user.findUnique({
            select: {
                _count: { select: { classicResults: true }},
                classicResults: {
                    orderBy: { completedAt: "desc" },
                    select: {
                        completedAt: true,
                        score: true,
                        seed: true,
                        solvedRounds: true,
                        totalAttempts: true,
                    },
                    take: 10,
                },
            },
            where: { id },
        });

        return overview ? { ...overview, dailyStreak: await this.getDailyStreak(id) } : null;
    }

    async listForAdmin() {
        return prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                _count: {
                    select: { classicResults: true, dailyResults: true, gameSessions: true },
                },
                banExpires: true,
                banned: true,
                banReason: true,
                createdAt: true,
                discordId: true,
                email: true,
                id: true,
                image: true,
                name: true,
                role: true,
                username: true,
            },
        });
    }

    private async getDailyStreak(userId: string) {
        const dailyResults = await prisma.dailyResult.findMany({
            orderBy: { dailyChallenge: { date: "asc" }},
            select: {
                dailyChallenge: {
                    select: { date: true },
                },
            },
            where: { userId },
        });

        return getDailyStreak(dailyResults.map(result => result.dailyChallenge.date.toISOString().slice(0, 10)));
    }
}

export const userRepository = new UserRepository();
