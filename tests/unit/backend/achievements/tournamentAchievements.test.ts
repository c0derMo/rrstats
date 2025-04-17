import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~/server/controller/AchievementController";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import "./achievementTestUtils";
import { AllRounder } from "~/server/controller/achievements/automatic/tournament/AllRounder";
import { BeatenTheBest } from "~/server/controller/achievements/automatic/tournament/BeatenTheBest";
import { ChallengerDefender } from "~/server/controller/achievements/automatic/tournament/ChallengerDefender";
import { Champion } from "~/server/controller/achievements/automatic/tournament/Champion";
import { FallIntoPlace } from "~/server/controller/achievements/automatic/tournament/FallIntoPlace";
import { RarifiedAir } from "~/server/controller/achievements/automatic/tournament/RarifiedAir";
import { TheCulling } from "~/server/controller/achievements/automatic/tournament/TheCulling";
import { TitleContender } from "~/server/controller/achievements/automatic/tournament/TitleContender";
import { Untouchable } from "~/server/controller/achievements/automatic/tournament/Untouchable";
import { WorldChampion } from "~/server/controller/achievements/automatic/tournament/WorldChampion";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Tournament Achievements", () => {
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

    test("All-Rounder", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new AllRounder(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1710093600000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new AllRounder(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Beaten the Best", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new BeatenTheBest(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1604952000000, 1606669200000, 1701806400000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "3367c77e-a41d-4e46-90b9-d3f6d41a340b",
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "df6abbe5-cb93-4323-b15b-a125d707803c",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["18 / 1", "18 / 5", "18 / 15"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new BeatenTheBest(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1637568000000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "a0683209-3fa2-4cf9-baea-a30827ca4b19",
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 0.2, 0.06666666666666667]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["1 / 1", "1 / 5", "1 / 15"]);
    });

    test("Challenger & Defender", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ChallengerDefender(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(0);
        expect.soft(achievementFun).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementFun).toHaveAchievementProgress([0]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ChallengerDefender(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Champion", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Champion(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1606669200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Champion(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Fall into Place", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new FallIntoPlace(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(5);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1587929400000, 1587929400000, 1595784600000, 1595784600000,
                1606669200000,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1, 1, 1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new FallIntoPlace(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(2);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1615138200000, 1646577000000, 0, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 0, 0, 0]);
    });

    test("Rarified Air", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new RarifiedAir(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1606669200000, 1638219600000, 1733166000000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "7e1d5e14-e191-4b45-90bc-4d36aea97726",
                "59b729c2-dc2f-48f8-9e56-f47ad78df1c1",
                "9e315613-d58f-468b-8478-2a7c623d8967",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["26 / 5", "26 / 10", "26 / 25"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new RarifiedAir(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1700413200000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "988ee3b3-eb6d-41bc-87f5-4e7cf0b781f5",
                null,
                null,
            ]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1, 0.6, 0.24]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["6 / 5", "6 / 10", "6 / 25"]);
    });

    test("The Culling", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TheCulling(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1604952000000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["3367c77e-a41d-4e46-90b9-d3f6d41a340b"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TheCulling(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1637179200000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["f5f7d057-1eb5-403b-89f5-3c961f908167"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Title Contender", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TitleContender(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1604952000000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TitleContender(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Untouchable", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Untouchable(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1668196800000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Untouchable(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("World Champion", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WorldChampion(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1606669200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WorldChampion(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });
});
