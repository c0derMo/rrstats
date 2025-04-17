import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~/server/controller/AchievementController";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import { ChrisX3 } from "~/server/controller/achievements/automatic/map_specific/ChrisX3";
import { FamilyMatters } from "~/server/controller/achievements/automatic/map_specific/FamilyMatters";
import { LandOfTheFree } from "~/server/controller/achievements/automatic/map_specific/LandOfTheFree";
import { OverTheHump } from "~/server/controller/achievements/automatic/map_specific/OverTheHump";
import { PartnersDown } from "~/server/controller/achievements/automatic/map_specific/PartnersDown";
import { RolfLured } from "~/server/controller/achievements/automatic/map_specific/RolfLured";
import { TheSmallFive } from "~/server/controller/achievements/automatic/map_specific/TheSmallFive";
import "./achievementTestUtils";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Map-Specific Achievements", () => {
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

    test("Chris X 3", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ChrisX3(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1621162800000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["47103ff1-ed53-43d6-be6b-eb7426c6c57f"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ChrisX3(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Family Matters", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new FamilyMatters(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1604176200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["db1da0fe-dd72-4885-b3de-2881a3ce40c3"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new FamilyMatters(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Land of the Free", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new LandOfTheFree(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1595350800000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["1da4f094-1dd8-4051-b11d-03e4cba91401"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new LandOfTheFree(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("Over the Hump", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OverTheHump(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1638219600000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["59b729c2-dc2f-48f8-9e56-f47ad78df1c1"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OverTheHump(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1645876800000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["f5394aa6-ac26-4ef5-b0ee-18f9e2e664d9"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Partners Down", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new PartnersDown(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1614976200000]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch(["90abacac-ec9d-495b-8315-2db791d7a054"]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new PartnersDown(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614537000000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["7517aa91-5bc4-4318-bdde-e3c50b1e907a"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Rolf Lured", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new RolfLured(),
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
                new RolfLured(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });

    test("The Small Five", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TheSmallFive(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1710093600000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TheSmallFive(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([0]);
    });
});
