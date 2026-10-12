import { MAX_REVEAL_LEVEL } from "../canvas/meme-effects";

export interface DailyGameAttempt {
    kind: "guess" | "reveal";
    value: string;
}

export interface DailyGameState {
    attempts: DailyGameAttempt[];
    revealLevel: number;
    status: "active" | "correct";
}

export const DAILY_STORAGE_VERSION = 2;

export const createDailyGameState = (): DailyGameState => ({
    attempts: [],
    revealLevel: 0,
    status: "active",
});

export const addDailyGuess = (state: DailyGameState, guess: string, correct: boolean): DailyGameState => {
    if (state.status !== "active") {
        return state;
    }

    const attempts = [ ...state.attempts, { kind: "guess" as const, value: guess } ];

    return correct ? { ...state, attempts, status: "correct" } : { ...state, attempts, revealLevel: Math.min(MAX_REVEAL_LEVEL, state.revealLevel + 1) };
};

export const revealMoreDaily = (state: DailyGameState): DailyGameState =>
    state.status === "active" && state.revealLevel < MAX_REVEAL_LEVEL
        ? {
            ...state,
            attempts: [ ...state.attempts, { kind: "reveal", value: "" } ],
            revealLevel: state.revealLevel + 1,
        }
        : state;

export const getDailyScore = (attempts: number) => Math.max(100, (MAX_REVEAL_LEVEL - attempts + 1) * 100);
