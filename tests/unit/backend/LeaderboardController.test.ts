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
            await LeaderboardController.getEntries(statistic.getTableDefinition().name);
            expect
                .soft(startTime.diffNow().as("milliseconds"))
                .toBeLessThan(500);
        }
    });

    test("Correct leaderboard categories", { timeout: 10000 }, async () => {
        const categories = await LeaderboardController.getCategories();

        const countryCategories = categories.filter((category) => category.category === 'country');
        const mapCategories = categories.filter((category) => category.category === 'map');
        const playerCategories = categories.filter((category) => category.category === 'player');
        expect(countryCategories.length).toBe(5);
        expect(mapCategories.length).toBe(5);
        expect(playerCategories.length).toBe(25);

        expect(countryCategories.map((c) => c.name)).toEqual([
            "Players per country",
            "Matches per country",
            "Wins per country",
            "Winrate per country",
            "Titles per country",
        ]);
        expect(mapCategories.map((c) => c.name)).toEqual([
            "Picked",
            "Banned",
            "Played",
            "Played as random map",
            "Appearances",
        ]);
        expect(playerCategories.map((c) => c.name)).toEqual([
            "Winrate",
            "Map Winrate",
            "Roulette Rivals Participations",
            "RRWC Participations",
            "Average RR Placement",
            "Grand Final Appearances",
            "Titles won",
            "Matches played",
            "Matches won",
            "Maps played",
            "Maps won",
            "Winrate on own-map-picks",
            "Winrate on opponent-map-picks",
            "Most matches won in a row",
            "Most maps won in a row",
            "Winning streak on a map",
            "Sweeps (6+ points)",
            "Sweeps",
            "Reverse sweeps",
            "Spins played on specific map",
            "Winrate on specific map",
            "Personal best on map",
            "Elo rating",
            "Achievements",
            "Matches casted",
        ]);
    });
});
