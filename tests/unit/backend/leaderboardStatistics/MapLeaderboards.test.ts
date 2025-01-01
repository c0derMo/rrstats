import { afterAll, beforeAll, test, expect, describe } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import LeaderboardController from "~/server/controller/LeaderboardController";

let database: DatabaseConnector;

describe("Map Leaderboards", () => {
    beforeAll(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false,
        );
        await database.initialize();
        await LeaderboardController.recalculate();
    });

    afterAll(async () => {
        await database.destroy();
    });

    test("Appearances", async () => {
        const maps = await LeaderboardController.getEntries("Appearances");

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            map: "Haven Island",
            sortingScore: 645,
            tournamentBreakdown: [
                55, 36, 31, 38, 68, 17, 24, 23, 72, 27, 27, 42, 65, 40, 36, 0,
                23, 8, 7, 6,
            ],
        });
        expect(maps[1]).toMatchObject({
            map: "Colorado",
            sortingScore: 643,
        });
        expect(maps[2]).toMatchObject({
            map: "Berlin",
            sortingScore: 615,
        });

        expect(maps[18]).toMatchObject({
            map: "Ambrose Island",
            sortingScore: 270,
        });
    });

    test("Banned", async () => {
        const maps = await LeaderboardController.getEntries("Banned");

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            map: "Mumbai",
            sortingScore: 209,
            tournamentBreakdown: [
                8, 18, 21, 16, 10, 9, 10, 9, 8, 13, 16, 13, 7, 21, 27, 0, 1, 2,
                0, 0,
            ],
        });
        expect(maps[1]).toMatchObject({
            map: "Santa Fortuna",
            sortingScore: 194,
        });
        expect(maps[2]).toMatchObject({
            map: "Haven Island",
            sortingScore: 192,
        });

        expect(maps[18]).toMatchObject({
            map: "Ambrose Island",
            sortingScore: 84,
        });
    });

    test("Picked", async () => {
        const maps = await LeaderboardController.getEntries("Picked");

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            map: "Sapienza",
            sortingScore: 362,
            tournamentBreakdown: [
                30, 13, 20, 16, 25, 8, 11, 14, 26, 15, 14, 25, 42, 19, 21, 0,
                27, 13, 14, 9,
            ],
        });
        expect(maps[1]).toMatchObject({
            map: "Hokkaido",
            sortingScore: 344,
        });
        expect(maps[2]).toMatchObject({
            map: "Miami",
            sortingScore: 337,
        });

        expect(maps[18]).toMatchObject({
            map: "Ambrose Island",
            sortingScore: 90,
        });
    });

    test("Played", async () => {
        const maps = await LeaderboardController.getEntries("Played");

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            map: "Sapienza",
            sortingScore: 516,
            tournamentBreakdown: [
                52, 19, 27, 32, 37, 13, 20, 20, 46, 21, 18, 37, 51, 20, 22, 0,
                37, 16, 19, 9,
            ],
        });
        expect(maps[1]).toMatchObject({
            map: "Miami",
            sortingScore: 487,
        });
        expect(maps[2]).toMatchObject({
            map: "Hokkaido",
            sortingScore: 477,
        });

        expect(maps[18]).toMatchObject({
            map: "Ambrose Island",
            sortingScore: 186,
        });
    });

    test("Played as random map", async () => {
        const maps = await LeaderboardController.getEntries(
            "Played as random map",
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            map: "Whittleton Creek",
            sortingScore: 161,
            tournamentBreakdown: [
                17, 6, 8, 8, 12, 8, 9, 9, 16, 5, 9, 8, 14, 2, 3, 0, 6, 0, 7, 14,
            ],
        });
        expect(maps[1]).toMatchObject({
            map: "Paris",
            sortingScore: 155,
        });
        expect(maps[2]).toMatchObject({
            map: "Sapienza",
            sortingScore: 154,
        });

        expect(maps[18]).toMatchObject({
            map: "Ambrose Island",
            sortingScore: 96,
        });
    });
});
