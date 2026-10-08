import { GameGuessKind, GameGuessResult, GameMode, GameRoundStatus, GameSessionStatus, Prisma, type Prisma as PrismaTypes } from "@prisma/client";

import {
    type ClassicGameState,
    createClassicGameState,
    getClassicScore,
    revealClassicRound,
    skipClassicRound,
    submitClassicGuess,
} from "@/lib/game/classic-game";
import { prisma } from "@/lib/prisma";

const seedSelect = {
    rounds: {
        orderBy: { position: "asc" },
        select: {
            answers: true,
            effect: true,
            memeId: true,
            position: true,
            seed: true,
        },
    },
} satisfies PrismaTypes.ClassicSeedSelect;

const gameRoundStatus = {
    active: GameRoundStatus.ACTIVE,
    correct: GameRoundStatus.CORRECT,
    failed: GameRoundStatus.FAILED,
    skipped: GameRoundStatus.SKIPPED,
} as const;

const toAnswers = (answers: PrismaTypes.JsonValue) => Array.isArray(answers) && answers.every(answer => typeof answer === "string") ? answers : [];

const replayRound = (submittedRound: ClassicGameState["rounds"][number], answers: string[]) => {
    let round = createClassicGameState(1).rounds[0];

    for (const guess of submittedRound.guesses) {
        round = guess.kind === "reveal"
            ? revealClassicRound(round)
            : submitClassicGuess(round, guess.value, answers);
    }

    return submittedRound.status === "skipped" ? skipClassicRound(round) : round;
};

export class ClassicGameRepository {
    async recordCompletion({ game, seed, userId }: { game: ClassicGameState; seed: number; userId: string }) {
        const storedSeed = BigInt(seed);
        const existingResult = await prisma.classicResult.findUnique({
            select: { id: true },
            where: { userId_seed: { seed: storedSeed, userId }},
        });

        if (existingResult) {
            return false;
        }

        const classicSeed = await prisma.classicSeed.findUnique({ select: seedSelect, where: { seed: storedSeed }});

        if (!classicSeed || classicSeed.rounds.length !== game.rounds.length) {
            throw new Error("The classic seed is unavailable.");
        }

        const completedAt = new Date();
        const resolvedRounds = classicSeed.rounds.map((seedRound, index) => ({
            seedRound,
            state: replayRound(game.rounds[index], toAnswers(seedRound.answers)),
        }));

        if (resolvedRounds.some(round => round.state.status === "active")) {
            throw new Error("The classic game is not complete.");
        }

        const score = getClassicScore({ roundIndex: resolvedRounds.length, rounds: resolvedRounds.map(round => round.state) });
        const solvedRounds = resolvedRounds.filter(round => round.state.status === "correct").length;
        const totalAttempts = resolvedRounds.reduce((total, round) => total + round.state.guesses.length, 0);

        try {
            await prisma.$transaction(async transaction => {
                const gameSession = await transaction.gameSession.create({
                    data: {
                        completedAt,
                        mode: GameMode.CLASSIC,
                        rounds: {
                            create: resolvedRounds.map(({ seedRound, state }) => ({
                                completedAt,
                                effect: seedRound.effect,
                                guesses: {
                                    create: state.guesses.map((guess, position) => ({
                                        kind: guess.kind === "guess" ? GameGuessKind.GUESS : GameGuessKind.REVEAL,
                                        position,
                                        result: guess.kind === "guess"
                                            ? guess.result === "correct" ? GameGuessResult.CORRECT : GameGuessResult.INCORRECT
                                            : null,
                                        value: guess.value,
                                    })),
                                },
                                memeId: seedRound.memeId,
                                position: seedRound.position,
                                revealLevel: state.revealLevel,
                                seed: seedRound.seed,
                                status: gameRoundStatus[state.status],
                            })),
                        },
                        score,
                        seed: storedSeed,
                        status: GameSessionStatus.COMPLETED,
                        userId,
                    },
                    select: { id: true },
                });

                await transaction.classicResult.create({
                    data: {
                        completedAt,
                        gameSessionId: gameSession.id,
                        score,
                        seed: storedSeed,
                        solvedRounds,
                        totalAttempts,
                        userId,
                    },
                });
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return false;
            }

            throw error;
        }

        return true;
    }
}

export const classicGameRepository = new ClassicGameRepository();
