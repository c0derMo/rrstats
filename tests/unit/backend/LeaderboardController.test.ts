import { DateTime } from "luxon";
import { afterEach, beforeEach, expect, test, describe } from "vitest";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import LeaderboardController from "~~/server/controller/LeaderboardController";

let database: DatabaseConnector;

describe("LeaderboardController", () => {
    beforeEach(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false,
        );
        await database.initialize();
    });
    afterEach(async () => {
        await database.destroy();
    });

    test("Performance: Individual leaderboard calculations", async () => {
        for (const statistic of LeaderboardController.statistics) {
            const startTime = DateTime.now();
            await LeaderboardController.getEntries(
                statistic.getTableDefinition().name,
            );
            expect
                .soft(startTime.diffNow().as("milliseconds"))
                .toBeLessThan(500);
        }
    });

    test("Correct leaderboard categories", { timeout: 10000 }, async () => {
        const categories = await LeaderboardController.getCategories();

        const countryCategories = categories.filter(
            (category) => category.category === "country",
        );
        const mapCategories = categories.filter(
            (category) => category.category === "map",
        );
        const playerCategories = categories.filter(
            (category) => category.category === "player",
        );
        expect(countryCategories.length).toBe(5);
        expect(mapCategories.length).toBe(5);
        expect(playerCategories.length).toBe(31);

        expect(countryCategories.map((c) => c.name)).toEqual([
            "Most players per country",
            "Most matches per country",
            "Most wins per country",
            "Best winrate per country",
            "Most titles per country",
        ]);
        expect(mapCategories.map((c) => c.name)).toEqual([
            "Most times picked",
            "Most times banned",
            "Most times played",
            "Most times played as random map",
            "Most times appeared",
        ]);
        expect(playerCategories.map((c) => c.name)).toEqual([
            "Roulette Rankings",
            "Elo Ratings",

            "Most matches played",
            "Most matches won",
            "Highest winrate",

            "Most maps played",
            "Most maps won",
            "Highest map winrate",
            "Highest map winrate (player picks)",
            "Highest map winrate (opponent picks)",
            "Highest map winrate (random picks)",
            "Most maps played (specific map)",
            "Most maps won (specific map)",
            "Best map winrate (specific map)",
            "Personal Best (specific map)",

            "Most RRs played",
            "Most RRWCs played",
            "Most titles won",
            "Most Grand Finals played",
            "Most medals won",
            "Best RR Placement",
            "Average RR Placement",

            "Longest winning streak",
            "Longest map winning streak",
            "Longest map winning streak (specific map)",

            "Most matches swept",
            "Most matches swept (6+ points)",
            "Most matches swept (8+ points)",
            "Most matches reverse swept (6+ points)",

            "Most achievements",
            "Most matches casted",
        ]);
    });
});
