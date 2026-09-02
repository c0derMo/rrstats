import { afterAll, beforeAll, test, expect, describe } from "vitest";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import LeaderboardController from "~~/server/controller/LeaderboardController";

let database: DatabaseConnector;

describe("Map Leaderboards", () => {
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

    test("Most times appeared", async () => {
        const maps = await LeaderboardController.getEntries(
            "Most times appeared",
            { Competition: [0, 19] },
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            columns: {
                Map: HitmanMap.HAVEN_ISLAND,
                Appearances: 645,
            },
            expandableRows: [
                ["Roulette Rivals", 6],
                ["Roulette Rivals 2", 7],
                ["Roulette Rivals 3", 8],
                ["Roulette Rivals World Championship", 23],
                ["Roulette Rivals 4", 0],
                ["Roulette Rivals 5", 36],
                ["Roulette Rivals 6", 40],
                ["Roulette Rivals World Championship 2021", 65],
                ["Roulette Rivals 7", 42],
                ["Roulette Rivals 8", 27],
                ["Roulette Rivals 9", 27],
                ["Roulette Rivals World Championship 2022", 72],
                ["Roulette Rivals 10", 23],
                ["Roulette Rivals 11", 24],
                ["Roulette Rivals 12", 17],
                ["Roulette Rivals World Championship 2023", 68],
                ["Roulette Rivals 13", 38],
                ["Roulette Rivals 14", 31],
                ["Roulette Rivals 15", 36],
                ["Roulette Rivals World Championship 2024", 55],
            ],
            order: 1,
            value: 645,
        });
        expect(maps[1]).toMatchObject({
            columns: {
                Map: HitmanMap.COLORADO,
                Appearances: 643,
            },
            order: 2,
            value: 643,
        });
        expect(maps[2]).toMatchObject({
            columns: {
                Map: HitmanMap.BERLIN,
                Appearances: 615,
            },
            order: 3,
            value: 615,
        });

        expect(maps[18]).toMatchObject({
            columns: {
                Map: HitmanMap.AMBROSE_ISLAND,
                Appearances: 270,
            },
            order: 19,
            value: 270,
        });
    });

    test("Most times banned", async () => {
        const maps = await LeaderboardController.getEntries(
            "Most times banned",
            { Competition: [0, 19] },
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            columns: {
                Map: HitmanMap.MUMBAI,
                Banned: 209,
            },
            expandableRows: [
                ["Roulette Rivals", 0],
                ["Roulette Rivals 2", 0],
                ["Roulette Rivals 3", 2],
                ["Roulette Rivals World Championship", 1],
                ["Roulette Rivals 4", 0],
                ["Roulette Rivals 5", 27],
                ["Roulette Rivals 6", 21],
                ["Roulette Rivals World Championship 2021", 7],
                ["Roulette Rivals 7", 13],
                ["Roulette Rivals 8", 16],
                ["Roulette Rivals 9", 13],
                ["Roulette Rivals World Championship 2022", 8],
                ["Roulette Rivals 10", 9],
                ["Roulette Rivals 11", 10],
                ["Roulette Rivals 12", 9],
                ["Roulette Rivals World Championship 2023", 10],
                ["Roulette Rivals 13", 16],
                ["Roulette Rivals 14", 21],
                ["Roulette Rivals 15", 18],
                ["Roulette Rivals World Championship 2024", 8],
            ],
            order: 1,
            value: 209,
        });
        expect(maps[1]).toMatchObject({
            columns: {
                Map: HitmanMap.SANTA_FORTUNA,
                Banned: 194,
            },
            order: 2,
            value: 194,
        });
        expect(maps[2]).toMatchObject({
            columns: {
                Map: HitmanMap.HAVEN_ISLAND,
                Banned: 192,
            },
            order: 3,
            value: 192,
        });

        expect(maps[18]).toMatchObject({
            columns: {
                Map: HitmanMap.AMBROSE_ISLAND,
                Banned: 84,
            },
            order: 19,
            value: 84,
        });
    });

    test("Most times picked", async () => {
        const maps = await LeaderboardController.getEntries(
            "Most times picked",
            { Competition: [0, 19] },
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            columns: {
                Map: HitmanMap.SAPIENZA,
                Picked: 362,
            },
            expandableRows: [
                ["Roulette Rivals", 9],
                ["Roulette Rivals 2", 14],
                ["Roulette Rivals 3", 13],
                ["Roulette Rivals World Championship", 27],
                ["Roulette Rivals 4", 0],
                ["Roulette Rivals 5", 21],
                ["Roulette Rivals 6", 19],
                ["Roulette Rivals World Championship 2021", 42],
                ["Roulette Rivals 7", 25],
                ["Roulette Rivals 8", 14],
                ["Roulette Rivals 9", 15],
                ["Roulette Rivals World Championship 2022", 26],
                ["Roulette Rivals 10", 14],
                ["Roulette Rivals 11", 11],
                ["Roulette Rivals 12", 8],
                ["Roulette Rivals World Championship 2023", 25],
                ["Roulette Rivals 13", 16],
                ["Roulette Rivals 14", 20],
                ["Roulette Rivals 15", 13],
                ["Roulette Rivals World Championship 2024", 30],
            ],
            order: 1,
            value: 362,
        });
        expect(maps[1]).toMatchObject({
            columns: {
                Map: HitmanMap.HOKKAIDO,
                Picked: 344,
            },
            order: 2,
            value: 344,
        });
        expect(maps[2]).toMatchObject({
            columns: {
                Map: HitmanMap.MIAMI,
                Picked: 337,
            },
            order: 3,
            value: 337,
        });

        expect(maps[18]).toMatchObject({
            columns: {
                Map: HitmanMap.AMBROSE_ISLAND,
                Picked: 90,
            },
            order: 19,
            value: 90,
        });
    });

    test("Most times played", async () => {
        const maps = await LeaderboardController.getEntries(
            "Most times played",
            { Competition: [0, 19] },
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            columns: {
                Map: HitmanMap.SAPIENZA,
                Played: 516,
            },
            expandableRows: [
                ["Roulette Rivals", 9],
                ["Roulette Rivals 2", 19],
                ["Roulette Rivals 3", 16],
                ["Roulette Rivals World Championship", 37],
                ["Roulette Rivals 4", 0],
                ["Roulette Rivals 5", 22],
                ["Roulette Rivals 6", 20],
                ["Roulette Rivals World Championship 2021", 51],
                ["Roulette Rivals 7", 37],
                ["Roulette Rivals 8", 18],
                ["Roulette Rivals 9", 21],
                ["Roulette Rivals World Championship 2022", 46],
                ["Roulette Rivals 10", 20],
                ["Roulette Rivals 11", 20],
                ["Roulette Rivals 12", 13],
                ["Roulette Rivals World Championship 2023", 37],
                ["Roulette Rivals 13", 32],
                ["Roulette Rivals 14", 27],
                ["Roulette Rivals 15", 19],
                ["Roulette Rivals World Championship 2024", 52],
            ],
            order: 1,
            value: 516,
        });
        expect(maps[1]).toMatchObject({
            columns: {
                Map: HitmanMap.MIAMI,
                Played: 487,
            },
            order: 2,
            value: 487,
        });
        expect(maps[2]).toMatchObject({
            columns: {
                Map: HitmanMap.HOKKAIDO,
                Played: 477,
            },
            order: 3,
            value: 477,
        });

        expect(maps[18]).toMatchObject({
            columns: {
                Map: HitmanMap.AMBROSE_ISLAND,
                Played: 186,
            },
            order: 19,
            value: 186,
        });
    });

    test("Most times played as random map", async () => {
        const maps = await LeaderboardController.getEntries(
            "Most times played as random map",
            { Competition: [0, 19] },
        );

        expect(maps.length).toBe(19);

        expect(maps[0]).toEqual({
            columns: {
                Map: HitmanMap.WHITTLETON_CREEK,
                "Played as random map": 161,
            },
            expandableRows: [
                ["Roulette Rivals", 14],
                ["Roulette Rivals 2", 7],
                ["Roulette Rivals 3", 0],
                ["Roulette Rivals World Championship", 6],
                ["Roulette Rivals 4", 0],
                ["Roulette Rivals 5", 3],
                ["Roulette Rivals 6", 2],
                ["Roulette Rivals World Championship 2021", 14],
                ["Roulette Rivals 7", 8],
                ["Roulette Rivals 8", 9],
                ["Roulette Rivals 9", 5],
                ["Roulette Rivals World Championship 2022", 16],
                ["Roulette Rivals 10", 9],
                ["Roulette Rivals 11", 9],
                ["Roulette Rivals 12", 8],
                ["Roulette Rivals World Championship 2023", 12],
                ["Roulette Rivals 13", 8],
                ["Roulette Rivals 14", 8],
                ["Roulette Rivals 15", 6],
                ["Roulette Rivals World Championship 2024", 17],
            ],
            order: 1,
            value: 161,
        });
        expect(maps[1]).toMatchObject({
            columns: {
                Map: HitmanMap.PARIS,
                "Played as random map": 155,
            },
            order: 2,
            value: 155,
        });
        expect(maps[2]).toMatchObject({
            columns: {
                Map: HitmanMap.SAPIENZA,
                "Played as random map": 154,
            },
            order: 3,
            value: 154,
        });

        expect(maps[18]).toMatchObject({
            columns: {
                Map: HitmanMap.AMBROSE_ISLAND,
                "Played as random map": 96,
            },
            order: 19,
            value: 96,
        });
    });
});
