import { afterAll, beforeAll, describe, expect, test } from "vitest";
import AchievementController from "~~/server/controller/AchievementController";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import { AgainstTheWorld } from "~~/server/controller/achievements/automatic/experience/AgainstTheWorld";
import "./achievementTestUtils";
import { GettingMileage } from "~~/server/controller/achievements/automatic/experience/GettingMileage";
import { Globetrotter } from "~~/server/controller/achievements/automatic/experience/Globetrotter";
import { OpenSeason } from "~~/server/controller/achievements/automatic/experience/OpenSeason";
import { ReturningRival } from "~~/server/controller/achievements/automatic/experience/ReturningRival";
import { RoulettePlayer } from "~~/server/controller/achievements/automatic/experience/RoulettePlayer";
import { SpinTheWheel } from "~~/server/controller/achievements/automatic/experience/SpinTheWheel";

let database: DatabaseConnector;

const UUID_In4Fun = "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7";
const UUID_CurryMaker = "b3793b1b-3ace-4dee-a678-5168f40abbb9";

describe("Experience Achievements", () => {
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

    test("Against the World", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new AgainstTheWorld(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(5);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1603555200000, 1635181200000, 1666112400000, 1698076800000,
                1729710000000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "2c4306c5-b43d-4f03-8f5f-6b782c40711b",
                "b06ef866-83b3-4094-ad7b-5c5c6723ff00",
                "d9bda8af-4ed5-4d24-a63c-19aaa2420d35",
                "35fe9d36-81b8-47fe-90c2-72afbb051b0f",
                "87d3c3b0-97d6-4743-99bd-84f9dc202557",
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "5 / 1",
                "5 / 2",
                "5 / 3",
                "5 / 4",
                "5 / 5",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new AgainstTheWorld(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(3);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1635181200000, 1698436800000, 1729443600000, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "b06ef866-83b3-4094-ad7b-5c5c6723ff00",
                "9e04c401-9223-42a2-bac2-bbb057390d74",
                "bb76c8bf-8cee-4431-9497-5e18fa642ae2",
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 0.75, 0.6]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "3 / 1",
                "3 / 2",
                "3 / 3",
                "3 / 4",
                "3 / 5",
            ]);
    });

    test("Getting Mileage", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new GettingMileage(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(5);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1603821600000, 1622998800000, 1646577000000, 1667044800000,
                1730925000000,
            ]);
        expect.soft(achievementFun).toHaveAchievementProgress([1, 1, 1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "31 / 5",
                "31 / 10",
                "31 / 15",
                "31 / 20",
                "31 / 30",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new GettingMileage(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(4);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1630429200000, 1676019600000, 1698849000000, 1731610800000, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 1, 2 / 3]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "20 / 5",
                "20 / 10",
                "20 / 15",
                "20 / 20",
                "20 / 30",
            ]);
    });

    test("Globetrotter", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new Globetrotter(),
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
                new Globetrotter(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(1);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([1698512400000, 0, 0]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([
                1, 0.8947368421052632, 0.5263157894736842,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString(["19 / 19", "17 / 19", "10 / 19"]);
    });

    test("Open Season", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new OpenSeason(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(4);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1604001600000, 1638127800000, 1699034400000, 1730836800000, 0,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 0.85]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "17 / 1",
                "17 / 5",
                "17 / 10",
                "17 / 15",
                "17 / 20",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new OpenSeason(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(2);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1614537000000, 1700092800000, 0, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 0.8, 0.5333333333333333, 0.4]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "8 / 1",
                "8 / 5",
                "8 / 10",
                "8 / 15",
                "8 / 20",
            ]);
    });

    test("Returning Rival", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new ReturningRival(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(4);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1594494000000, 1621162800000, 1666112400000, 1729710000000, 0,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "e1a12b53-fe13-4712-a57f-d3e9ad4f22a3",
                "47103ff1-ed53-43d6-be6b-eb7426c6c57f",
                "d9bda8af-4ed5-4d24-a63c-19aaa2420d35",
                "87d3c3b0-97d6-4743-99bd-84f9dc202557",
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 0.75]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "15 / 2",
                "15 / 5",
                "15 / 10",
                "15 / 15",
                "15 / 20",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new ReturningRival(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(3);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1621447200000, 1644784200000, 1698436800000, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "e91b95d7-c3a1-4cf6-8c06-45d60ff46e2e",
                "edc349de-dbe3-40b0-90f2-ea58813e200a",
                "9e04c401-9223-42a2-bac2-bbb057390d74",
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 0.8666666666666667, 0.65]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "13 / 2",
                "13 / 5",
                "13 / 10",
                "13 / 15",
                "13 / 20",
            ]);
    });

    test("Roulette Player", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new RoulettePlayer(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(7);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1586977200000, 1594494000000, 1595624400000, 1614697200000,
                1637352000000, 1668528000000, 1708704000000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b",
                "e1a12b53-fe13-4712-a57f-d3e9ad4f22a3",
                "cfd52644-854c-4fba-9d18-883381715fb4",
                "9b8219b1-88e2-4eca-8d65-ee6ae8d210a8",
                "058f6d07-5bd0-4439-a583-84bc0945c2a4",
                "20742c74-b7f6-425e-945d-28a7b9a4f7b2",
                "de7b5cdb-8601-46b0-821d-efe7d7ea9cb9",
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "124 / 1",
                "124 / 5",
                "124 / 10",
                "124 / 25",
                "124 / 50",
                "124 / 75",
                "124 / 100",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new RoulettePlayer(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(5);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1613851200000, 1621533600000, 1630339200000, 1645804800000,
                1707948000000, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "547c7d1c-af21-496b-ab1f-de8f85bd54cd",
                "d043b063-7586-4de3-b875-5ec93f44bc0e",
                "b7927fba-ab1f-44bb-9428-5d52d947b365",
                "8c98aca9-dece-452b-a339-34f497abd1ec",
                "1d00e496-b5ff-47b9-ace1-37a8d09cec5d",
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 0.8, 0.6]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "60 / 1",
                "60 / 5",
                "60 / 10",
                "60 / 25",
                "60 / 50",
                "60 / 75",
                "60 / 100",
            ]);
    });

    test("Spin the Wheel", async () => {
        const achievementFun =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_In4Fun,
                new SpinTheWheel(),
            );
        expect.soft(achievementFun).toHaveAchievementLevel(7);
        expect
            .soft(achievementFun)
            .toHaveAchievementAchievedAt([
                1587160800000, 1595709000000, 1605542400000, 1622998800000,
                1662127200000, 1701003600000, 1730314800000,
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementMatch([
                "7ec9d4b1-b34b-4665-aa5d-73dc867d2734",
                "9a484585-4859-4689-8188-4e8cec1b82bc",
                "557a87ef-11f1-436b-81f1-e7f05c7ec01b",
                "fa0be922-6399-43ca-b0ac-a4ef7d9b35ac",
                "4321e081-5904-480a-a92b-711b3bb985de",
                "81a39a24-1235-492b-b495-3cd04e6dd50b",
                "22c2a8c0-6da8-41ad-8099-f4d886cfe892",
            ]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 1, 1]);
        expect
            .soft(achievementFun)
            .toHaveAchievementProgressString([
                "444 / 5",
                "444 / 25",
                "444 / 50",
                "444 / 100",
                "444 / 200",
                "444 / 300",
                "444 / 400",
            ]);

        const achievementCurry =
            await AchievementController.getAchievementOfPlayerOrCreate(
                UUID_CurryMaker,
                new RoulettePlayer(),
            );
        expect.soft(achievementCurry).toHaveAchievementLevel(5);
        expect
            .soft(achievementCurry)
            .toHaveAchievementAchievedAt([
                1613851200000, 1621533600000, 1630339200000, 1645804800000,
                1707948000000, 0, 0,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementMatch([
                "547c7d1c-af21-496b-ab1f-de8f85bd54cd",
                "d043b063-7586-4de3-b875-5ec93f44bc0e",
                "b7927fba-ab1f-44bb-9428-5d52d947b365",
                "8c98aca9-dece-452b-a339-34f497abd1ec",
                "1d00e496-b5ff-47b9-ace1-37a8d09cec5d",
                null,
                null,
            ]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgress([1, 1, 1, 1, 1, 0.8, 0.6]);
        expect
            .soft(achievementCurry)
            .toHaveAchievementProgressString([
                "60 / 1",
                "60 / 5",
                "60 / 10",
                "60 / 25",
                "60 / 50",
                "60 / 75",
                "60 / 100",
            ]);
    });
});
