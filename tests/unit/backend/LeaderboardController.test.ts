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

test("Correct top entry: winrate", { timeout: 10000 }, async () => {
    await LeaderboardController.recalculate();
    const players = await LeaderboardController.getEntries("Winrate");
    expect(players[0]).toEqual({
        player: "28542412-14b1-4635-87fc-8e89a1a09a1a",
        sortingScore: 1,
        displayScore: "100.00%",
        secondaryScore: 1,
    });
});
