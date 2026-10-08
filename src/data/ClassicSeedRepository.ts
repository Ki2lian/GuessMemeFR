import { MediaAssetStatus, MemeStatus, Prisma, RevealEffect } from "@prisma/client";

import { type MemeEffect } from "@/lib/canvas/meme-effects";
import { type ClassicMeme, type ClassicRoundDefinition, createClassicRounds } from "@/lib/game/classic-rounds";
import { prisma } from "@/lib/prisma";

const effectToDatabase = {
    distorted: RevealEffect.DISTORTED,
    hidden: RevealEffect.HIDDEN,
    pixelated: RevealEffect.PIXELATED,
    scrambled: RevealEffect.SCRAMBLED,
    "zoomed-in": RevealEffect.ZOOMED_IN,
} satisfies Record<MemeEffect, RevealEffect>;

const effectFromDatabase = {
    [RevealEffect.DISTORTED]: "distorted",
    [RevealEffect.HIDDEN]: "hidden",
    [RevealEffect.PIXELATED]: "pixelated",
    [RevealEffect.SCRAMBLED]: "scrambled",
    [RevealEffect.ZOOMED_IN]: "zoomed-in",
} as const satisfies Record<RevealEffect, MemeEffect>;

const snapshotSelect = {
    rounds: {
        orderBy: { position: "asc" },
        select: {
            answers: true,
            effect: true,
            imageStorageKey: true,
            memeId: true,
            seed: true,
            title: true,
        },
    },
} satisfies Prisma.ClassicSeedSelect;

const getAnswers = (answers: Prisma.JsonValue) => Array.isArray(answers) && answers.every(answer => typeof answer === "string") ? answers : [];

const toClassicRounds = (snapshot: Prisma.ClassicSeedGetPayload<{ select: typeof snapshotSelect }>): ClassicRoundDefinition[] => snapshot.rounds.map(round => ({
    effect: effectFromDatabase[round.effect],
    meme: {
        answers: getAnswers(round.answers),
        id: round.memeId,
        imageStorageKey: round.imageStorageKey,
        title: round.title,
    },
    seed: Number(round.seed),
}));

const isConcurrentSeedCreationError = (error: unknown) => (
    error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2039")
);

export class ClassicSeedRepository {
    async getOrCreate(seed: number) {
        const storedSeed = BigInt(seed);
        const existingSnapshot = await prisma.classicSeed.findUnique({ select: snapshotSelect, where: { seed: storedSeed }});

        if (existingSnapshot) {
            return toClassicRounds(existingSnapshot);
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
        const memes: ClassicMeme[] = catalog.flatMap(meme => meme.coverAsset ? [ {
            answers: meme.answers.map(answer => answer.value),
            id: meme.id,
            imageStorageKey: meme.coverAsset.storageKey,
            title: meme.title,
        } ] : []);

        if (memes.length === 0) {
            return null;
        }

        const rounds = createClassicRounds(seed, memes);
        try {
            const snapshot = await prisma.classicSeed.create({
                data: {
                    rounds: {
                        create: rounds.map((round, position) => ({
                            answers: round.meme.answers,
                            effect: effectToDatabase[round.effect],
                            imageStorageKey: round.meme.imageStorageKey,
                            memeId: round.meme.id,
                            position,
                            seed: BigInt(round.seed),
                            title: round.meme.title,
                        })),
                    },
                    seed: storedSeed,
                },
                select: snapshotSelect,
            });

            return toClassicRounds(snapshot);
        } catch (error) {
            if (!isConcurrentSeedCreationError(error)) {
                throw error;
            }

            const concurrentSnapshot = await prisma.classicSeed.findUnique({ select: snapshotSelect, where: { seed: storedSeed }});

            if (!concurrentSnapshot) {
                throw error;
            }

            return toClassicRounds(concurrentSnapshot);
        }
    }

    async getRandomUncompletedSeed(userId?: string) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            const values = new Uint32Array(1);

            crypto.getRandomValues(values);
            const seed = values[0];
            const completedResult = userId
                ? await prisma.classicResult.findUnique({ select: { id: true }, where: { userId_seed: { seed: BigInt(seed), userId }}})
                : null;

            if (!completedResult) {
                return seed;
            }
        }

        throw new Error("Unable to generate an uncompleted classic seed.");
    }
}

export const classicSeedRepository = new ClassicSeedRepository();
