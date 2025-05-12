import { expect } from "vitest";
import AchievementController from "~/server/controller/AchievementController";
import type { AutomaticAchievement } from "~/server/controller/achievements/automatic/AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";

interface AchievementMatchers<R = unknown> {
    toHaveAchievementLevel: (expected: number) => R;
    toHaveAchievementAchievedAt: (expected: (number | null)[]) => R;
    toHaveAchievementMatch: (expected: (string | null)[]) => R;
    toHaveAchievementProgress: (expected: (number | null)[]) => R;
    toHaveAchievementProgressString: (expected: (string | null)[]) => R;
}

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends AchievementMatchers<T> {}
}

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

expect.extend({
    toHaveAchievementLevel(received: Achievement<unknown>, expected: number) {
        const lastLevel = received.achievedAt.findLastIndex((a) => a > 0);
        return {
            pass: lastLevel + 1 === expected,
            message: () => "Achievement level mismatch",
            actual: lastLevel + 1,
            expected,
        };
    },
    toHaveAchievementAchievedAt(
        received: Achievement<unknown>,
        expected: (number | null)[],
    ) {
        let pass = true;
        for (let idx = 0; idx < expected.length; idx++) {
            if (
                expected[idx] != null &&
                received.achievedAt[idx] !== expected[idx]
            ) {
                pass = false;
            }
        }
        return {
            pass,
            message: () => "Achievement achievedAt mismatch",
            actual: received.achievedAt,
            expected,
        };
    },
    toHaveAchievementMatch(
        received: Achievement<unknown>,
        expected: (string | null)[],
    ) {
        if (received.match == null) {
            return {
                pass: false,
                message: () =>
                    "Achievement has no matches assigned, but matches were expected",
            };
        }
        let pass = true;
        for (let idx = 0; idx < expected.length; idx++) {
            if (
                expected[idx] != null &&
                received.match[idx] !== expected[idx]
            ) {
                pass = false;
            }
        }
        return {
            pass,
            message: () => "Achievement match mismatch",
            actual: received.match,
            expected,
        };
    },
    toHaveAchievementProgress(
        received: Achievement<unknown>,
        expected: (number | null)[],
    ) {
        let pass = true;
        for (let idx = 0; idx < expected.length; idx++) {
            if (
                expected[idx] != null &&
                received.progression[idx] !== expected[idx]
            ) {
                pass = false;
            }
        }
        return {
            pass,
            message: () => "Achievement progression mismatch",
            actual: received.progression,
            expected,
        };
    },
    toHaveAchievementProgressString(
        received: Achievement<unknown>,
        expected: (string | null)[],
    ) {
        if (received.progressionString == null) {
            return {
                pass: false,
                message: () =>
                    "Achievement has no progression string assigned, but progression strings were expected",
            };
        }
        let pass = true;
        for (let idx = 0; idx < expected.length; idx++) {
            if (
                expected[idx] != null &&
                received.progressionString[idx] !== expected[idx]
            ) {
                pass = false;
            }
        }
        return {
            pass,
            message: () => "Achievement progressionString mismatch",
            actual: received.progressionString,
            expected,
        };
    },
});

export function generateSingleAchievementExpects(
    achievement: Achievement<unknown>,
    name: string,
) {
    const achievementLevel =
        achievement.achievedAt.findLastIndex((a) => a > 0) + 1;
    console.log(
        `        expect.soft(${name}).toHaveAchievementLevel(${achievementLevel});`,
    );
    console.log(
        `        expect.soft(${name}).toHaveAchievementAchievedAt(${JSON.stringify(achievement.achievedAt)});`,
    );
    if (achievement.match?.some((m) => m != null)) {
        console.log(
            `        expect.soft(${name}).toHaveAchievementMatch(${JSON.stringify(achievement.match)});`,
        );
    }
    console.log(
        `        expect.soft(${name}).toHaveAchievementProgress(${JSON.stringify(achievement.progression)});`,
    );
    if (achievement.progressionString?.some((m) => m != null)) {
        console.log(
            `        expect.soft(${name}).toHaveAchievementProgressString(${JSON.stringify(achievement.progressionString)});`,
        );
    }
}

export async function generateTest(c: new () => AutomaticAchievement<unknown>) {
    const achInstance = new c();
    console.log(`    test("${achInstance.name}", async () => {`);
    console.log(
        `        const achievementFun = await AchievementController.getAchievementOfPlayerOrCreate(UUID_In4Fun, new ${c.name}());`,
    );
    const achIn4Fun =
        await AchievementController.getAchievementOfPlayerOrCreate(
            UUID_In4Fun,
            achInstance,
        );
    generateSingleAchievementExpects(achIn4Fun, "achievementFun");
    console.log(`        `);
    console.log(
        `        const achievementCurry = await AchievementController.getAchievementOfPlayerOrCreate(UUID_CurryMaker, new ${c.name}());`,
    );
    const achCurry = await AchievementController.getAchievementOfPlayerOrCreate(
        UUID_CurryMaker,
        achInstance,
    );
    generateSingleAchievementExpects(achCurry, "achievementCurry");
    console.log(`    });`);
}
