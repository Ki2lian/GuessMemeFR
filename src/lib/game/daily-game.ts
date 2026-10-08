import { MAX_REVEAL_LEVEL } from "../canvas/meme-effects";

export interface DailyGameState {
    guesses: string[];
    revealLevel: number;
    status: "active" | "correct";
}

export const DAILY_STORAGE_VERSION = 1;

export const createDailyGameState = (): DailyGameState => ({
    guesses: [],
    revealLevel: 0,
    status: "active",
});

export const addDailyGuess = (state: DailyGameState, guess: string, correct: boolean): DailyGameState => {
    if (state.status !== "active") {
        return state;
    }

    const guesses = [ ...state.guesses, guess ];

    return correct ? { ...state, guesses, status: "correct" } : { ...state, guesses, revealLevel: Math.min(MAX_REVEAL_LEVEL, state.revealLevel + 1) };
};

export const revealMoreDaily = (state: DailyGameState): DailyGameState =>
    state.status === "active" ? { ...state, revealLevel: Math.min(MAX_REVEAL_LEVEL, state.revealLevel + 1) } : state;

export const getDailyScore = (attempts: number) => Math.max(100, (MAX_REVEAL_LEVEL - attempts + 1) * 100);
