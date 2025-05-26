import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~/server/controller/AchievementController";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import "./achievementTestUtils";
import { ApexPredator } from "~/server/controller/achievements/automatic/match/ApexPredator";
import { BehemothKiller } from "~/server/controller/achievements/automatic/match/BehemothKiller";
import { BestServedCold } from "~/server/controller/achievements/automatic/match/BestServedCold";
import { ComebackStory } from "~/server/controller/achievements/automatic/match/ComebackStory";
import { GiantKiller } from "~/server/controller/achievements/automatic/match/GiantKiller";
import { Overtime } from "~/server/controller/achievements/automatic/match/Overtime";
import { Reversal } from "~/server/controller/achievements/automatic/match/Reversal";
import { SpinToWin } from "~/server/controller/achievements/automatic/match/SpinToWin";
import { Sweeper } from "~/server/controller/achievements/automatic/match/Sweeper";
import { TheRouletteRival } from "~/server/controller/achievements/automatic/match/TheRouletteRival";
import { WorldRenowned } from "~/server/controller/achievements/automatic/match/WorldRenowned";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Match Achievements", () => {
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

    test("Apex Predator", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ApexPredator(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1645639200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["50f1b1a1-9d3c-4e58-8c9d-8fe885cf1510"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ApexPredator(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Behemoth Killer", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new BehemothKiller(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1606669200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["7e1d5e14-e191-4b45-90bc-4d36aea97726"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new BehemothKiller(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Best Served Cold", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new BestServedCold(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1595181600000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["c37a4b6d-c9c9-4c37-8572-53f3ad5b6ce9"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new BestServedCold(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1645804800000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["8c98aca9-dece-452b-a339-34f497abd1ec"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Comeback Story", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ComebackStory(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1710093600000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["9cee0d25-4235-49f0-8653-43e08cf7b59b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ComebackStory(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Giant Killer", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new GiantKiller(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1605891600000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["ba98edd0-9d27-4ff9-be3e-9f0ce1ca934b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new GiantKiller(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Overtime", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Overtime(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(5);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1606669200000, 1606669200000, 1606669200000, 1606669200000,
                1606669200000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1, 1, 1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Overtime(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(2);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1676415600000, 1676415600000, 0, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "43328317-ef7c-4753-9744-6eb5b105e147",
                "43328317-ef7c-4753-9744-6eb5b105e147",
                null,
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 0, 0, 0]);
    });

    test("Reversal", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Reversal(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1701622800000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["d111ae9b-0a77-4c8c-9758-74e489d92a16"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Reversal(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Spin to Win", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new SpinToWin(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(6);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1586977200000, 1595181600000, 1604001600000, 1621625400000,
                1661522400000, 1701806400000, 0,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b",
                "c37a4b6d-c9c9-4c37-8572-53f3ad5b6ce9",
                "95bcd4f2-ea6b-4a30-b59e-2ac77e308bfc",
                "08d7319d-35bb-47ea-ab48-5acd71f01d40",
                "75c233f0-1298-4005-a4ac-4e6d88645c44",
                "df6abbe5-cb93-4323-b15b-a125d707803c",
                null,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 1, 0.96]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "96 / 1",
                "96 / 5",
                "96 / 10",
                "96 / 25",
                "96 / 50",
                "96 / 75",
                "96 / 100",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new SpinToWin(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(4);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1613851200000, 1630339200000, 1644784200000, 1731160800000, 0,
                0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "547c7d1c-af21-496b-ab1f-de8f85bd54cd",
                "b7927fba-ab1f-44bb-9428-5d52d947b365",
                "edc349de-dbe3-40b0-90f2-ea58813e200a",
                "c8cf141c-9a34-4131-9c7d-ecc2755d972c",
                null,
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([
                1, 1, 1, 1, 0.5, 0.3333333333333333, 0.25,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "25 / 1",
                "25 / 5",
                "25 / 10",
                "25 / 25",
                "25 / 50",
                "25 / 75",
                "25 / 100",
            ]);
    });

    test("Sweeper", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Sweeper(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1603555200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["2c4306c5-b43d-4f03-8f5f-6b782c40711b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Sweeper(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1645804800000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["8c98aca9-dece-452b-a339-34f497abd1ec"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("The Roulette Rival", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TheRouletteRival(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(2);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614817800000, 1701806400000, 0]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "b0d6837e-c2b7-4457-91f0-ffae2f760923",
                "df6abbe5-cb93-4323-b15b-a125d707803c",
                null,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 0.8571428571428571]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["6 / 3", "6 / 5", "6 / 7"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TheRouletteRival(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1660478400000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "c2854b92-a4d5-45fd-b291-4cff63320da0",
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 0.8, 0.5714285714285714]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["4 / 3", "4 / 5", "4 / 7"]);
    });

    test("World-Renowned", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WorldRenowned(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614268800000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["25 / 10"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WorldRenowned(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0.9]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["9 / 10"]);
    });
});
