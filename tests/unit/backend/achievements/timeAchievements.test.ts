import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~~/server/controller/AchievementController";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import "./achievementTestUtils";
import { ForTheRecord } from "~~/server/controller/achievements/automatic/time/ForTheRecord";
import { MasterOfNone } from "~~/server/controller/achievements/automatic/time/MasterOfNone";
import { PerfectingTheCraft } from "~~/server/controller/achievements/automatic/time/PerfectingTheCraft";
import { ScratchedRecord } from "~~/server/controller/achievements/automatic/time/ScratchedRecord";
import { Speedrunner } from "~~/server/controller/achievements/automatic/time/Speedrunner";
import { Timekeeper } from "~~/server/controller/achievements/automatic/time/Timekeeper";
import { TrilogySpeedrunner } from "~~/server/controller/achievements/automatic/time/TrilogySpeedrunner";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Time Achievements", () => {
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

    test("For the Record", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ForTheRecord(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586973600000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ForTheRecord(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Master of None", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new MasterOfNone(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1685214000000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["19 / 19"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new MasterOfNone(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([0.7894736842105263]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["15 / 19"]);
    });

    test("Perfecting the Craft", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new PerfectingTheCraft(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new PerfectingTheCraft(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Scratched Record", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ScratchedRecord(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1667674800000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["1eed35e3-fb70-448f-8820-a3ccf6bce9fa"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ScratchedRecord(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Speedrunner", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Speedrunner(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614268800000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["03a9217e-2b61-4cdf-8bbb-9e58cdf1ab76"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Speedrunner(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1729706400000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["572c0977-34f6-4c86-901d-3b6feece648a"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Timekeeper", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Timekeeper(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614279600000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Timekeeper(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Trilogy Speedrunner", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TrilogySpeedrunner(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614697200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TrilogySpeedrunner(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });
});
