import { describe, expect, it } from "vitest";

import { getDailyStreak } from "../daily-streak";

describe("getDailyStreak", () => {
    const today = "2026-10-08";

    it("returns no streak without a completed daily challenge", () => {
        expect(getDailyStreak([], today)).toEqual({ current: 0, longest: 0 });
    });

    it("keeps yesterday's streak while today's challenge is still pending", () => {
        expect(getDailyStreak([ "2026-10-05", "2026-10-06", "2026-10-07" ], today)).toEqual({ current: 3, longest: 3 });
    });

    it("resets the current streak after a missed day while preserving the record", () => {
        expect(getDailyStreak([ "2026-10-02", "2026-10-03", "2026-10-05" ], today)).toEqual({ current: 0, longest: 2 });
    });

    it("counts a completed challenge from today", () => {
        expect(getDailyStreak([ "2026-10-06", "2026-10-07", "2026-10-08" ], today)).toEqual({ current: 3, longest: 3 });
    });

    it("does not count a duplicate completion twice", () => {
        expect(getDailyStreak([ "2026-10-06", "2026-10-07", "2026-10-07" ], today)).toEqual({ current: 2, longest: 2 });
    });
});
