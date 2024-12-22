import { DateTime } from "luxon";
import { afterEach, beforeEach, expect, test } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import LeaderboardController from "~/server/controller/LeaderboardController";

let database: DatabaseConnector;

beforeEach(async () => {
    database = new DatabaseConnector(
        "sqlite",
        "./test/test_db_post_2024.db",
        false
    );
    await database.initialize();
});
afterEach(async () => {
    await database.destroy();
});

test('Performance: Leaderboard recalculation', async () => {
    const startTime = DateTime.now();
    await LeaderboardController.recalculate();
    expect(startTime.diffNow().as('milliseconds')).toBeLessThan(10000);
});

test('Correct top entry: winrate', async () => {
    await LeaderboardController.recalculate();
    const players = await LeaderboardController.getEntries("winrate");
    expect(players[0]).toEqual({
        player: "sleazeball",
        sortingScore: 100.00,
        displayScore: "100.00%",
        secondaryScore: 1
    });
})