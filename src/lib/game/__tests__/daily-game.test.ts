import { describe, expect, it } from "vitest";

import { addDailyGuess, createDailyGameState, type DailyGameState, getDailyScore, revealMoreDaily } from "../daily-game";

describe("daily game", () => {
    it("keeps accepting incorrect answers after the image is completely revealed", () => {
        const fullyRevealedGame = Array.from({ length: 6 }).reduce<DailyGameState>(state => addDailyGuess(state, "incorrect", false), createDailyGameState());

        expect(fullyRevealedGame.revealLevel).toBe(6);
        expect(fullyRevealedGame.status).toBe("active");
        expect(addDailyGuess(fullyRevealedGame, "correct", true).status).toBe("correct");
    });

    it("does not reveal more than the final level", () => {
        const state = Array.from({ length: 10 }).reduce<DailyGameState>(revealMoreDaily, createDailyGameState());

        expect(state.revealLevel).toBe(6);
        expect(state.attempts).toHaveLength(6);
        expect(state.attempts.every(attempt => attempt.kind === "reveal")).toBe(true);
    });

    it("counts requested reveals alongside guesses", () => {
        const game = addDailyGuess(
            revealMoreDaily(revealMoreDaily(createDailyGameState())),
            "correct",
            true,
        );

        expect(game.attempts).toEqual([
            { kind: "reveal", value: "" },
            { kind: "reveal", value: "" },
            { kind: "guess", value: "correct" },
        ]);
        expect(getDailyScore(game.attempts.length)).toBe(400);
    });

    it("keeps a minimum score after the six reveal levels", () => {
        expect(getDailyScore(1)).toBe(600);
        expect(getDailyScore(6)).toBe(100);
        expect(getDailyScore(42)).toBe(100);
    });
});
