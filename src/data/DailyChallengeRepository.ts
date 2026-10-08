import { DailyChallengeStatus, MediaAssetStatus, MemeStatus, Prisma, type Prisma as PrismaTypes, RevealEffect } from "@prisma/client";

import { EFFECTS, type MemeEffect } from "@/lib/canvas/meme-effects";
import { parisDateKeyToDate } from "@/lib/date/paris";
import { createSeededRandom } from "@/lib/game/classic-rounds";
import { prisma } from "@/lib/prisma";

const playableDailyChallengeSelect = {
    date: true,
    effect: true,
    id: true,
    meme: {
        select: {
            answers: {
                select: {
                    normalizedValue: true,
                    type: true,
                    value: true,
                },
            },
            coverAsset: {
                select: {
                    height: true,
                    mimeType: true,
                    storageKey: true,
                    width: true,
                },
            },
            id: true,
            title: true,
        },
    },
    seed: true,
} satisfies PrismaTypes.DailyChallengeSelect;

const publicDailyChallengeSelect = {
    date: true,
    effect: true,
    id: true,
    imageStorageKey: true,
    seed: true,
    status: true,
    title: true,
} satisfies PrismaTypes.DailyChallengeSelect;

const effectToDatabase: Record<MemeEffect, RevealEffect> = {
    distorted: RevealEffect.DISTORTED,
    hidden: RevealEffect.HIDDEN,
    pixelated: RevealEffect.PIXELATED,
    scrambled: RevealEffect.SCRAMBLED,
    "zoomed-in": RevealEffect.ZOOMED_IN,
};

const effectFromDatabase: Record<RevealEffect, MemeEffect> = {
    DISTORTED: "distorted",
    HIDDEN: "hidden",
    PIXELATED: "pixelated",
    SCRAMBLED: "scrambled",
    ZOOMED_IN: "zoomed-in",
};

const dateKeyToSeed = (dateKey: string) => {
    let hash = 2_166_136_261;

    for (const character of `daily:${ dateKey }`) {
        hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619);
    }

    return hash >>> 0;
};

const isConcurrentDailyCreationError = (error: unknown) => (
    error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2039")
);

export class DailyChallengeRepository {
    async findForAdminByDate(date: Date) {
        const dailyChallenge = await prisma.dailyChallenge.findUnique({
            select: {
                _count: {
                    select: {
                        results: true,
                        sessions: true,
                    },
                },
                answers: true,
                date: true,
                effect: true,
                id: true,
                imageStorageKey: true,
                results: {
                    orderBy: {
                        completedAt: "asc",
                    },
                    select: {
                        completedAt: true,
                        gameSession: {
                            select: {
                                startedAt: true,
                            },
                        },
                        totalAttempts: true,
                        user: {
                            select: {
                                discordId: true,
                                image: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                    take: 10,
                },
                seed: true,
                status: true,
                title: true,
            },
            where: { date },
        });

        if (!dailyChallenge) {
            return null;
        }

        const resultAggregate = await prisma.dailyResult.aggregate({
            _avg: {
                totalAttempts: true,
            },
            where: {
                dailyChallengeId: dailyChallenge.id,
            },
        });

        return {
            ...dailyChallenge,
            averageAttempts: resultAggregate._avg.totalAttempts ?? 0,
        };
    }

    async findPublishedPlayableByDate(date: Date) {
        return prisma.dailyChallenge.findFirst({
            select: playableDailyChallengeSelect,
            where: {
                date,
                status: DailyChallengeStatus.PUBLISHED,
            },
        });
    }

    async getOrCreatePublishedForDate(dateKey: string) {
        const date = parisDateKeyToDate(dateKey);
        const existingChallenge = await prisma.dailyChallenge.findUnique({ select: publicDailyChallengeSelect, where: { date }});

        if (existingChallenge) {
            return existingChallenge.status === DailyChallengeStatus.PUBLISHED ? existingChallenge : null;
        }

        const catalog = await prisma.meme.findMany({
            orderBy: { id: "asc" },
            select: {
                answers: { select: { value: true }},
                coverAsset: { select: { storageKey: true }},
                id: true,
                title: true,
            },
            where: {
                coverAsset: { is: { status: MediaAssetStatus.READY }},
                status: MemeStatus.PUBLISHED,
            },
        });
        const playableMemes = catalog.filter((meme): meme is typeof meme & { coverAsset: { storageKey: string }} => Boolean(meme.coverAsset) && meme.answers.length > 0);

        if (playableMemes.length === 0) {
            return null;
        }

        const random = createSeededRandom(dateKeyToSeed(dateKey));
        const meme = playableMemes[Math.floor(random() * playableMemes.length)];
        const seed = Math.floor(random() * 4_294_967_296);
        const effect = effectToDatabase[EFFECTS[Math.floor(random() * EFFECTS.length)]];

        try {
            return await prisma.dailyChallenge.create({
                data: {
                    answers: meme.answers.map(answer => answer.value),
                    date,
                    effect,
                    imageStorageKey: meme.coverAsset.storageKey,
                    memeId: meme.id,
                    seed: BigInt(seed),
                    status: DailyChallengeStatus.PUBLISHED,
                    title: meme.title,
                },
                select: publicDailyChallengeSelect,
            });
        } catch (error) {
            if (!isConcurrentDailyCreationError(error)) {
                throw error;
            }

            const concurrentChallenge = await prisma.dailyChallenge.findUnique({ select: publicDailyChallengeSelect, where: { date }});

            return concurrentChallenge?.status === DailyChallengeStatus.PUBLISHED ? concurrentChallenge : null;
        }
    }

    async getSnapshotForGuess(dateKey: string) {
        return prisma.dailyChallenge.findFirst({
            select: {
                answers: true,
                effect: true,
                id: true,
                memeId: true,
                seed: true,
                title: true,
            },
            where: {
                date: parisDateKeyToDate(dateKey),
                status: DailyChallengeStatus.PUBLISHED,
            },
        });
    }

    async listDatesForAdmin() {
        return prisma.dailyChallenge.findMany({
            orderBy: { date: "desc" },
            select: { date: true },
        });
    }
}

export const dailyChallengeRepository = new DailyChallengeRepository();
export { effectFromDatabase };
