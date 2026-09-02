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

    test("StreakCounter advanced usage", () => {
        const counter = new StreakCounter<number>();

        counter.increaseStreak(2);
        counter.increaseStreak(3);

        expect(counter.getLongestStreak()).toBe(2);

        counter.increaseStreak(1337);
        counter.resetStreak();

        expect(counter.getLongestStreak()).toBe(3);

        counter.increaseStreak(2);
        counter.increaseStreak(2);

        expect(counter.getAllStreaks()).toEqual([
            { length: 3, value: 1337 },
            { length: 2, value: 2 },
        ]);
        expect(counter.getFinishedStreaks()).toEqual([
            { length: 3, value: 1337 },
        ]);
        expect(counter.getActiveStreak()).toEqual({
            length: 2,
            value: 2,
        });
    });
});
