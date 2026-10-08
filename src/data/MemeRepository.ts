import { MediaAssetStatus, MemeStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const playableMemeSelect = {
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
} satisfies Prisma.MemeSelect;

export class MemeRepository {
    async createDraft({
        answers,
        coverAssetId,
        createdById,
        difficulty,
        origin,
        sourceUrl,
        title,
    }: {
        answers: Array<{ normalizedValue: string; type: "ALIAS" | "CANONICAL"; value: string }>;
        coverAssetId: string;
        createdById: string;
        difficulty: "EASY" | "HARD" | "MEDIUM";
        origin?: string;
        sourceUrl?: string;
        title: string;
    }) {
        return prisma.meme.create({
            data: {
                answers: { create: answers },
                assets: { connect: { id: coverAssetId }},
                coverAsset: { connect: { id: coverAssetId }},
                createdBy: { connect: { id: createdById }},
                difficulty,
                origin,
                sourceUrl,
                title,
            },
            select: { id: true },
        });
    }

    async findPublishedPlayableById(id: string) {
        return prisma.meme.findFirst({
            select: playableMemeSelect,
            where: {
                coverAsset: {
                    is: {
                        status: MediaAssetStatus.READY,
                    },
                },
                id,
                status: MemeStatus.PUBLISHED,
            },
        });
    }

    async getForPublishing(id: string) {
        return prisma.meme.findUnique({
            select: {
                answers: {
                    select: { type: true },
                },
                coverAsset: {
                    select: { status: true },
                },
                id: true,
                status: true,
            },
            where: { id },
        });
    }

    async listForAdmin(status?: MemeStatus) {
        return prisma.meme.findMany({
            orderBy: { updatedAt: "desc" },
            select: {
                answers: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        type: true,
                        value: true,
                    },
                },
                coverAsset: {
                    select: {
                        height: true,
                        status: true,
                        storageKey: true,
                        width: true,
                    },
                },
                difficulty: true,
                id: true,
                origin: true,
                sourceUrl: true,
                status: true,
                title: true,
                updatedAt: true,
            },
            where: status ? { status } : undefined,
        });
    }

    async listPublishedPlayable() {
        return prisma.meme.findMany({
            orderBy: {
                publishedAt: "asc",
            },
            select: playableMemeSelect,
            where: {
                coverAsset: {
                    is: {
                        status: MediaAssetStatus.READY,
                    },
                },
                status: MemeStatus.PUBLISHED,
            },
        });
    }

    async updateDetails({
        answers,
        coverAssetId,
        difficulty,
        id,
        origin,
        sourceUrl,
        title,
    }: {
        answers: Array<{ normalizedValue: string; type: "ALIAS" | "CANONICAL"; value: string }>;
        coverAssetId?: string;
        difficulty: "EASY" | "HARD" | "MEDIUM";
        id: string;
        origin?: string;
        sourceUrl?: string;
        title: string;
    }) {
        return prisma.$transaction(async transaction => {
            const currentMeme = await transaction.meme.findUniqueOrThrow({
                select: {
                    coverAsset: {
                        select: {
                            id: true,
                            storageKey: true,
                        },
                    },
                },
                where: { id },
            });

            await transaction.memeAnswer.deleteMany({ where: { memeId: id }});
            await transaction.meme.update({
                data: {
                    answers: { create: answers },
                    ...(coverAssetId
                        ? {
                            assets: { connect: { id: coverAssetId }},
                            coverAsset: { connect: { id: coverAssetId }},
                        }
                        : {}),
                    difficulty,
                    origin,
                    sourceUrl,
                    title,
                },
                select: { id: true },
                where: { id },
            });

            return coverAssetId ? currentMeme.coverAsset : null;
        });
    }

    async updateStatus(id: string, status: MemeStatus) {
        return prisma.meme.update({
            data: {
                archivedAt: status === MemeStatus.ARCHIVED ? new Date() : null,
                publishedAt: status === MemeStatus.PUBLISHED ? new Date() : null,
                status,
            },
            select: { id: true },
            where: { id },
        });
    }
}

export const memeRepository = new MemeRepository();
