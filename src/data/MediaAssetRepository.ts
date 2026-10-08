import { MediaAssetStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const uploadMediaAssetSelect = {
    id: true,
    status: true,
    storageKey: true,
} satisfies Prisma.MediaAssetSelect;

export class MediaAssetRepository {
    async createPending({
        byteSize,
        height,
        mimeType,
        sha256,
        storageKey,
        uploadedById,
        width,
    }: {
        byteSize: number;
        height: number;
        mimeType: string;
        sha256: string;
        storageKey: string;
        uploadedById: string;
        width: number;
    }) {
        return prisma.mediaAsset.create({
            data: {
                byteSize,
                height,
                mimeType,
                sha256,
                status: MediaAssetStatus.PENDING,
                storageKey,
                uploadedById,
                width,
            },
            select: uploadMediaAssetSelect,
        });
    }

    async findBySha256(sha256: string) {
        return prisma.mediaAsset.findUnique({
            select: uploadMediaAssetSelect,
            where: { sha256 },
        });
    }

    async hasClassicSeedReference(storageKey: string) {
        const referenceCount = await prisma.classicSeedRound.count({ where: { imageStorageKey: storageKey }});

        return referenceCount > 0;
    }

    async hasDailyChallengeReference(storageKey: string) {
        const referenceCount = await prisma.dailyChallenge.count({ where: { imageStorageKey: storageKey }});

        return referenceCount > 0;
    }

    async markDeleted(id: string) {
        return prisma.mediaAsset.update({
            data: {
                deletedAt: new Date(),
                status: MediaAssetStatus.DELETED,
            },
            select: uploadMediaAssetSelect,
            where: { id },
        });
    }

    async markReady(id: string) {
        return prisma.mediaAsset.update({
            data: { status: MediaAssetStatus.READY },
            select: uploadMediaAssetSelect,
            where: { id },
        });
    }

    async remove(id: string) {
        return prisma.mediaAsset.delete({
            select: { id: true },
            where: { id },
        });
    }
}

export const mediaAssetRepository = new MediaAssetRepository();
