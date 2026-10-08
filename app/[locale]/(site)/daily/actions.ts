"use server";

import { revalidatePath } from "next/cache";

import { dailyGameRepository } from "@/data/DailyGameRepository";
import { getSession } from "@/lib/auth/session";
import { getParisDateKey } from "@/lib/date/paris";
import { type DailyGameState } from "@/lib/game/daily-game";
import { ROUTES } from "@/routes";

const isCurrentChallenge = (dateKey: string) => dateKey === getParisDateKey();

interface DailyGuessActionResult {
    answer?: string;
    available: boolean;
    correct: boolean;
    dateChanged: boolean;
}

export const recordDailyCompletionAction = async ({ dateKey, game }: { dateKey: string; game: DailyGameState }) => {
    if (!isCurrentChallenge(dateKey)) {
        return { dateChanged: true, recorded: false };
    }

    const session = await getSession();

    if (!session) {
        return { dateChanged: false, recorded: false };
    }

    const result = await dailyGameRepository.recordCompletion({ dateKey, game, userId: session.user.id });

    if (result.recorded) {
        revalidatePath(ROUTES.profile);
        revalidatePath(`${ ROUTES.admin }/users`);
    }

    return { dateChanged: false, ...result };
};

export const validateDailyGuessAction = async ({ dateKey, guess }: { dateKey: string; guess: string }): Promise<DailyGuessActionResult> => {
    if (!isCurrentChallenge(dateKey)) {
        return { available: false, correct: false, dateChanged: true };
    }

    const normalizedGuess = guess.trim();

    if (!normalizedGuess || normalizedGuess.length > 255) {
        return { available: true, correct: false, dateChanged: false };
    }

    return { dateChanged: false, ...await dailyGameRepository.validateGuess({ dateKey, guess: normalizedGuess }) };
};
