import { DateTime } from "luxon";
import { afterEach, beforeEach, expect, test } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import LeaderboardController from "~/server/controller/LeaderboardController";

let database: DatabaseConnector;

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

test("Performance: Leaderboard recalculation", { timeout: 10000 }, async () => {
    const startTime = DateTime.now();
    await LeaderboardController.recalculate();
    expect(startTime.diffNow().as("milliseconds")).toBeLessThan(10000);
});

test("Correct leaderboard categories", { timeout: 10000 }, async () => {
    const categories = await LeaderboardController.getCategories();

    expect(categories.country.length).toBe(5);
    expect(categories.map.length).toBe(5);
    expect(categories.player.length).toBe(22);

    expect(categories.country.map((c) => c.name)).toEqual([
        "Players per country",
        "Matches per country",
        "Wins per country",
        "Winrate per country",
        "Titles per country",
    ]);
    expect(categories.map.map((c) => c.name)).toEqual([
        "Picked",
        "Banned",
        "Played",
        "Played as random map",
        "Appearances",
    ]);
    expect(categories.player.map((c) => c.name)).toEqual([
        "Winrate",
        "Map Winrate",
        "Roulette Rivals Participations",
        "RRWC Participations",
        "Average RR Placement",
        "Grand Final Appearances",
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
        "Elo rating",
        "Matches casted",
    ]);
});
