import { describe, expect, it } from "vitest";

import { normalizeAnswer } from "../normalize-answer";

describe("normalizeAnswer", () => {
    it("normalizes casing, accents, punctuation, and whitespace", () => {
        expect(normalizeAnswer("  DÉJÀ-vu ?!  ")).toBe("deja vu");
        expect(normalizeAnswer("L’été\tdu\nMÈME")).toBe("l ete du meme");
    });

    it("preserves alphanumeric characters", () => {
        expect(normalizeAnswer("Meme 42")).toBe("meme 42");
    });

    it("returns an empty string when no alphanumeric character remains", () => {
        expect(normalizeAnswer("  ?!—  ")).toBe("");
    });
});
