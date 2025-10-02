import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~~/server/controller/AchievementController";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import "./achievementTestUtils";
import { AFullCalendar } from "~~/server/controller/achievements/automatic/streak/AFullCalendar";
import { DoubleDown } from "~~/server/controller/achievements/automatic/streak/DoubleDown";
import { GuessWhosBack } from "~~/server/controller/achievements/automatic/streak/GuessWhosBack";
import { OnAMission } from "~~/server/controller/achievements/automatic/streak/OnAMission";
import { OnARoll } from "~~/server/controller/achievements/automatic/streak/OnARoll";
import { OnAStreak } from "~~/server/controller/achievements/automatic/streak/OnAStreak";
import { StayCation } from "~~/server/controller/achievements/automatic/streak/StayCation";
import { TheEncore } from "~~/server/controller/achievements/automatic/streak/TheEncore";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Streak Achievements", () => {
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

    test("A Full Calendar", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new AFullCalendar(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1640941200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([0]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new AFullCalendar(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1640941200000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Double Down", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new DoubleDown(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1595784600000]);
        expect.soft(achievementFun).toHaveAchievementProgress([0]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new DoubleDown(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Guess Who's Back", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new GuessWhosBack(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(2);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1603555200000, 1629478800000, 0]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "2c4306c5-b43d-4f03-8f5f-6b782c40711b",
                "b3ae0d04-74ea-4732-8157-60d0b7b92aed",
                null,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 0.8]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["8 / 2", "8 / 5", "8 / 10"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new GuessWhosBack(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(2);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1629486000000, 1715436000000, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "8c38b191-23aa-45d9-bca4-d6787aa45b76",
                "f0b6e761-3b76-4c2c-b0de-d7766793b401",
                null,
            ]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1, 1, 0.6]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["6 / 2", "6 / 5", "6 / 10"]);
    });

    test("On a Mission", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OnAMission(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1587218400000, 1604422800000, 1710093600000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "b2031181-33d7-42eb-8e35-295468bbe6fb",
                "1e169dec-3ce1-417b-8d1c-71dfd7575a73",
                "9cee0d25-4235-49f0-8653-43e08cf7b59b",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["13 / 2", "13 / 5", "13 / 10"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OnAMission(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614195000000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "8640ad05-69d4-4580-a250-be66ddb0ef98",
                null,
                null,
            ]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1, 0.4, 0.2]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["2 / 2", "2 / 5", "2 / 10"]);
    });

    test("On a Roll", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OnARoll(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1595350800000, 1666962000000, 1667044800000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "1da4f094-1dd8-4051-b11d-03e4cba91401",
                "708b503c-f911-45d7-a2fa-bf6fe3d73e79",
                "77ac87bc-76aa-4441-9fdf-6d79dd8845a0",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([0, 0, 0]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["0 / 5", "0 / 10", "0 / 15"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OnARoll(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1645804800000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "8c98aca9-dece-452b-a339-34f497abd1ec",
                null,
                null,
            ]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["0 / 5", "0 / 10", "0 / 15"]);
    });

    test("On a Streak", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OnAStreak(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1595181600000, 1604422800000, 1606500000000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "c37a4b6d-c9c9-4c37-8572-53f3ad5b6ce9",
                "1e169dec-3ce1-417b-8d1c-71dfd7575a73",
                "03c9939e-a559-4bae-b179-cf8b065e3b7d",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([0, 0, 0]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["0 / 2", "0 / 5", "0 / 10"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OnAStreak(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1621681200000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "0114e041-835c-4d41-bd06-3846c01d099f",
                null,
                null,
            ]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["0 / 2", "0 / 5", "0 / 10"]);
    });

    test("Stay-Cation", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new StayCation(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1603821600000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);
        expect.soft(achievementFun).toHaveAchievementProgressString(["4 / 3"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new StayCation(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614537000000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([0.3333333333333333]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["1 / 3"]);
    });

    test("The Encore", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TheEncore(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(0);
        expect.soft(achievementFun).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementFun).toHaveAchievementProgress([0]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TheEncore(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });
});
