import { getParisDateKey } from "../date/paris";

export interface DailyStreak {
    current: number;
    longest: number;
}

const DAY_IN_MILLISECONDS = 86_400_000;

const getDayIndex = (dateKey: string) => Date.parse(`${ dateKey }T00:00:00.000Z`) / DAY_IN_MILLISECONDS;

export const getDailyStreak = (completedDateKeys: string[], todayDateKey = getParisDateKey()): DailyStreak => {
    const completedDays = [ ...new Set(completedDateKeys.map(getDayIndex)) ].sort((first, second) => first - second);

    if (completedDays.length === 0) {
        return { current: 0, longest: 0 };
    }

    const completedDaySet = new Set(completedDays);
    const longest = completedDays.reduce((longestStreak, day, index) => {
        const previousDay = completedDays[index - 1];
        const streakLength = index > 0 && previousDay === day - 1
            ? longestStreak.current + 1
            : 1;

        return {
            current: streakLength,
            longest: Math.max(longestStreak.longest, streakLength),
        };
    }, { current: 0, longest: 0 }).longest;

    let expectedDay = getDayIndex(todayDateKey);

    if (!completedDaySet.has(expectedDay)) {
        expectedDay -= 1;
    }

    let current = 0;

    while (completedDaySet.has(expectedDay)) {
        current += 1;
        expectedDay -= 1;
    }

    return { current, longest };
};
