import { GameGuessKind, GameGuessResult, GameMode, GameRoundStatus, GameSessionStatus, Prisma, type Prisma as PrismaTypes } from "@prisma/client";

import { dailyChallengeRepository } from "@/data/DailyChallengeRepository";
import { MAX_REVEAL_LEVEL } from "@/lib/canvas/meme-effects";
import { type DailyGameState, getDailyScore } from "@/lib/game/daily-game";
import { normalizeAnswer } from "@/lib/game/normalize-answer";
import { prisma } from "@/lib/prisma";

const getAnswers = (answers: PrismaTypes.JsonValue) => (
    Array.isArray(answers) && answers.every(answer => typeof answer === "string") ? answers : []
);

export class DailyGameRepository {
    async getCompletionStatistics(dailyChallengeId: string) {
        const [ participantCount, resultAggregate ] = await Promise.all([
            prisma.dailyResult.count({ where: { dailyChallengeId }}),
            prisma.dailyResult.aggregate({
                _avg: { totalAttempts: true },
                where: { dailyChallengeId },
            }),
        ]);

        return {
            averageAttempts: resultAggregate._avg.totalAttempts ?? 0,
            participantCount,
        };
    }

    async recordCompletion({ dateKey, game, userId }: { dateKey: string; game: DailyGameState; userId: string }) {
        const dailyChallenge = await dailyChallengeRepository.getSnapshotForGuess(dateKey);

        if (!dailyChallenge) {
            throw new Error("The daily challenge is unavailable.");
        }

        const answers = getAnswers(dailyChallenge.answers);
        const correctAttemptIndex = game.attempts.findIndex(attempt => attempt.kind === "guess" && answers.some(answer => normalizeAnswer(attempt.value) === normalizeAnswer(answer)));
        const lastAttempt = game.attempts.at(-1);

        if (!lastAttempt || lastAttempt.kind !== "guess" || correctAttemptIndex !== game.attempts.length - 1) {
            throw new Error("The daily challenge is not complete.");
        }

        const existingResult = await prisma.dailyResult.findUnique({
            select: { id: true },
            where: { userId_dailyChallengeId: { dailyChallengeId: dailyChallenge.id, userId }},
        });

        if (existingResult) {
            return { recorded: false, statistics: await this.getCompletionStatistics(dailyChallenge.id) };
        }

        const completedAt = new Date();
        const totalAttempts = game.attempts.length;
        const score = getDailyScore(totalAttempts);

        try {
            await prisma.$transaction(async transaction => {
                const gameSession = await transaction.gameSession.create({
                    data: {
                        completedAt,
                        dailyChallengeId: dailyChallenge.id,
                        mode: GameMode.DAILY,
                        rounds: {
                            create: {
                                completedAt,
                                effect: dailyChallenge.effect,
                                guesses: {
                                    create: game.attempts.map((attempt, position) => ({
                                        kind: attempt.kind === "reveal" ? GameGuessKind.REVEAL : GameGuessKind.GUESS,
                                        position,
                                        result: attempt.kind === "guess"
                                            ? answers.some(answer => normalizeAnswer(attempt.value) === normalizeAnswer(answer))
                                                ? GameGuessResult.CORRECT
                                                : GameGuessResult.INCORRECT
                                            : null,
                                        value: attempt.value,
                                    })),
                                },
                                memeId: dailyChallenge.memeId,
                                position: 0,
                                revealLevel: Math.min(MAX_REVEAL_LEVEL, Math.max(0, totalAttempts - 1)),
                                seed: dailyChallenge.seed,
                                status: GameRoundStatus.CORRECT,
                            },
                        },
                        score,
                        seed: dailyChallenge.seed,
                        status: GameSessionStatus.COMPLETED,
                        userId,
                    },
                    select: { id: true },
                });

                await transaction.dailyResult.create({
                    data: {
                        completedAt,
                        dailyChallengeId: dailyChallenge.id,
                        gameSessionId: gameSession.id,
                        score,
                        totalAttempts,
                        userId,
                    },
                });
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                return { recorded: false, statistics: await this.getCompletionStatistics(dailyChallenge.id) };
            }

            throw error;
        }

        return { recorded: true, statistics: await this.getCompletionStatistics(dailyChallenge.id) };
    }

    async validateGuess({ dateKey, guess }: { dateKey: string; guess: string }) {
        const dailyChallenge = await dailyChallengeRepository.getSnapshotForGuess(dateKey);

        if (!dailyChallenge) {
            return { available: false, correct: false };
        }

        const correct = getAnswers(dailyChallenge.answers).some(answer => normalizeAnswer(guess) === normalizeAnswer(answer));

        return { answer: correct ? dailyChallenge.title : undefined, available: true, correct };
    }
}

export const dailyGameRepository = new DailyGameRepository();
