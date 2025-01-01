import { expect, test, describe } from "vitest";

describe("StreakCounter", () => {
    test("StreakCounter general usage", () => {
        const counter = new StreakCounter();

        expect(counter.getLongestStreak()).toBe(0);

        counter.increaseStreak();
        counter.increaseStreak();

        expect(counter.getLongestStreak()).toBe(2);

        counter.resetStreak();

        expect(counter.getLongestStreak()).toBe(2);

        counter.increaseStreak();

        expect(counter.getLongestStreak()).toBe(2);

        counter.increaseStreak();
        counter.increaseStreak();
        counter.increaseStreak();
        counter.increaseStreak();

        expect(counter.getLongestStreak()).toBe(5);

        counter.resetStreak();

        expect(counter.getLongestStreak()).toBe(5);
    });
});
