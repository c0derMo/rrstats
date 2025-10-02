import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~~/server/controller/AchievementController";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import "./achievementTestUtils";
import { SkillBasedMatchmaking } from "~~/server/controller/achievements/automatic/misc/SkillBasedMatchmaking";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Misc Achievements", () => {
    beforeAll(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false,
        );
        await database.initialize();
    });

    afterAll(async () => {
        await database.destroy();
    });

    test("Skill-Based Matchmaking", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new SkillBasedMatchmaking(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1595350800000, 1604952000000, 1614697200000,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "1414 / 1100",
                "1414 / 1200",
                "1414 / 1300",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new SkillBasedMatchmaking(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([
                0.9636363636363636, 0.8833333333333333, 0.8153846153846154,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "1060 / 1100",
                "1060 / 1200",
                "1060 / 1300",
            ]);
    });
});
