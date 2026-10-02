import { MAX_REVEAL_LEVEL } from "@/lib/canvas/meme-effects";
import { normalizeAnswer } from "@/lib/game/normalize-answer";

export interface ClassicGameState {
    roundIndex: number;
    rounds: ClassicRoundState[];
}

export interface ClassicGuess {
    kind: "guess" | "reveal";
    result?: "correct" | "incorrect";
    value: string;
}

export interface ClassicRoundState {
    guesses: ClassicGuess[];
    revealLevel: number;
    status: ClassicRoundStatus;
}

export type ClassicRoundStatus = "active" | "correct" | "failed" | "skipped";

export const CLASSIC_STORAGE_VERSION = 3;

export const createClassicGameState = (roundCount: number): ClassicGameState => ({
    roundIndex: 0,
    rounds: Array.from({ length: roundCount }, () => ({ guesses: [], revealLevel: 0, status: "active" })),
});

export const submitClassicGuess = (state: ClassicRoundState, guess: string, answer: string): ClassicRoundState => {
    if (state.status !== "active") {
        return state;
    }

    const isCorrect = normalizeAnswer(guess) === normalizeAnswer(answer);
    const guesses = [ ...state.guesses, { kind: "guess" as const, result: isCorrect ? "correct" as const : "incorrect" as const, value: guess } ];

    if (isCorrect) {
        return { ...state, guesses, status: "correct" };
    }

    const revealLevel = Math.min(MAX_REVEAL_LEVEL, state.revealLevel + 1);

    return { ...state, guesses, revealLevel, status: revealLevel === MAX_REVEAL_LEVEL ? "failed" : "active" };
};

export const revealClassicRound = (state: ClassicRoundState): ClassicRoundState => {
    if (state.status !== "active") {
        return state;
    }

    const guesses = [ ...state.guesses, { kind: "reveal" as const, value: "" } ];
    const revealLevel = Math.min(MAX_REVEAL_LEVEL, state.revealLevel + 1);

    return { ...state, guesses, revealLevel, status: revealLevel === MAX_REVEAL_LEVEL ? "failed" : "active" };
};

export const skipClassicRound = (state: ClassicRoundState): ClassicRoundState => (
    state.status === "active" ? { ...state, revealLevel: MAX_REVEAL_LEVEL, status: "skipped" } : state
);

export const isClassicGameComplete = (state: ClassicGameState) => state.roundIndex >= state.rounds.length;

export const getClassicRoundScore = (round: ClassicRoundState) => (
    round.status === "correct" ? (MAX_REVEAL_LEVEL - round.guesses.length + 1) * 100 : 0
);

export const getClassicScore = (state: ClassicGameState) => state.rounds.reduce((total, round) => total + getClassicRoundScore(round), 0);

export const getClassicAverageAttempts = (state: ClassicGameState) => {
    const solvedRounds = state.rounds.filter(round => round.status === "correct");

    if (solvedRounds.length === 0) {
        return undefined;
    }

    return solvedRounds.reduce((total, round) => total + round.guesses.length, 0) / solvedRounds.length;
};
