import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~~/server/controller/AchievementController";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import { AgainstAllOdds } from "~~/server/controller/achievements/automatic/map/AgainstAllOdds";
import { BeatTheHouse } from "~~/server/controller/achievements/automatic/map/BeatTheHouse";
import {
    CuttingEdge,
    DressedForTheOccasion,
    Kaboom,
    OneOfAKind,
    RememberNoPacify,
    WaitingToHappen,
    WhysItSpicy,
    WorthAShot,
} from "~~/server/controller/achievements/automatic/map/ConditionAchievements";
import { GloballyInnovative } from "~~/server/controller/achievements/automatic/map/GloballyInnovative";
import { HistoryRepeatsItself } from "~~/server/controller/achievements/automatic/map/HistoryRepeatsItself";
import { IHateThatMap } from "~~/server/controller/achievements/automatic/map/IHateThatMap";
import { ILoveThatMap } from "~~/server/controller/achievements/automatic/map/ILoveThatMap";
import { NoWeaknesses } from "~~/server/controller/achievements/automatic/map/NoWeaknesses";
import { PointsForYou } from "~~/server/controller/achievements/automatic/map/PointsForYou";
import { TheHouseEdge } from "~~/server/controller/achievements/automatic/map/TheHouseEdge";
import { WorldOfAssassination } from "~~/server/controller/achievements/automatic/map/WorldOfAssassination";
import "./achievementTestUtils";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Map Achievements", () => {
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

    test("Against All Odds", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new AgainstAllOdds(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new AgainstAllOdds(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1613851200000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Beat The House", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new BeatTheHouse(),
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
                new BeatTheHouse(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1644940800000]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch(["66d12946-634b-40e2-a25e-ab978c4c9d97"]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Cutting Edge", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new CuttingEdge(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new CuttingEdge(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1613851200000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Dressed for the Occasion", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new DressedForTheOccasion(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1587312000000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new DressedForTheOccasion(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614537000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Kaboom", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Kaboom(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new Kaboom(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1613851200000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Waiting to Happen", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WaitingToHappen(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1587218400000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WaitingToHappen(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614195000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Remember, No Pacify", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new RememberNoPacify(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1698076800000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new RememberNoPacify(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1692900000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Why's it Spicy?", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WhysItSpicy(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1587312000000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WhysItSpicy(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614195000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Worth a Shot", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WorthAShot(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WorthAShot(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614537000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("One of a Kind", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OneOfAKind(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OneOfAKind(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1613851200000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("Globally Innovative", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new GloballyInnovative(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1614697200000, 1684864800000, 1732647600000,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["10 / 1", "10 / 5", "10 / 10"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new GloballyInnovative(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1685034000000, 0, 0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1, 0.4, 0.2]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["2 / 1", "2 / 5", "2 / 10"]);
    });

    test("History Repeats Itself", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new HistoryRepeatsItself(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(3);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1604422800000, 1635357600000, 1700312400000,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["25 / 5", "25 / 10", "25 / 20"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new HistoryRepeatsItself(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(2);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1636398000000, 1730224800000, 0]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1, 1, 0.5]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["10 / 5", "10 / 10", "10 / 20"]);
    });

    test("I Hate That Map", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new IHateThatMap(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1700312400000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["19 / 19"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new IHateThatMap(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([0.7368421052631579]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["14 / 19"]);
    });

    test("I Love That Map", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ILoveThatMap(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1685635200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["19 / 19"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ILoveThatMap(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([0.7368421052631579]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["14 / 19"]);
    });

    test("No Weaknesses", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new NoWeaknesses(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1700312400000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new NoWeaknesses(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(0);
        expect.soft(achievementCurry).toHaveAchievementAchievedAt([0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([0.42105263157894735]);
    });

    test("Points for You", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new PointsForYou(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(7);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1586977200000, 1587218400000, 1595091600000, 1604176200000,
                1614697200000, 1637697600000, 1715533200000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b",
                "b2031181-33d7-42eb-8e35-295468bbe6fb",
                "399c2e28-7d47-4a17-be7e-4b397ce2fa95",
                "db1da0fe-dd72-4885-b3de-2881a3ce40c3",
                "9b8219b1-88e2-4eca-8d65-ee6ae8d210a8",
                "678b9a98-dba1-44d2-aa14-746749eb62d1",
                "04938952-03f9-4732-b887-cc555d7c765d",
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "297 / 1",
                "297 / 5",
                "297 / 10",
                "297 / 25",
                "297 / 50",
                "297 / 100",
                "297 / 250",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new PointsForYou(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(5);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1613851200000, 1621533600000, 1629486000000, 1644784200000,
                1685034000000, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "547c7d1c-af21-496b-ab1f-de8f85bd54cd",
                "d043b063-7586-4de3-b875-5ec93f44bc0e",
                "8c38b191-23aa-45d9-bca4-d6787aa45b76",
                "edc349de-dbe3-40b0-90f2-ea58813e200a",
                "d04886a3-21c7-4149-b032-cb5a84021fd8",
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 0.82, 0.328]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "82 / 1",
                "82 / 5",
                "82 / 10",
                "82 / 25",
                "82 / 50",
                "82 / 100",
                "82 / 250",
            ]);
    });

    test("The House Edge", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new TheHouseEdge(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(1);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1586977200000]);
        expect.soft(achievementFun).toHaveAchievementProgress([1]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new TheHouseEdge(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1614537000000]);
        expect.soft(achievementCurry).toHaveAchievementProgress([1]);
    });

    test("World of Assassination", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new WorldOfAssassination(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(2);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([1685214000000, 1730120400000, 0]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 0.9473684210526315]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString(["19 / 19", "19 / 19", "18 / 19"]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new WorldOfAssassination(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1698512400000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([
                1, 0.631578947368421, 0.3157894736842105,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["19 / 19", "12 / 19", "6 / 19"]);
    });
});
