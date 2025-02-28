import { DateTime } from "luxon";
import { afterEach, beforeEach, describe, test, expect } from "vitest";
import DatabaseConnector from "~/server/controller/DatabaseConnnector";
import PlayerStatisticController from "~/server/controller/PlayerStatisticController";

let database: DatabaseConnector;

describe("PlayerStatisticController", () => {
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

    test("Performance: Statistic calculation", async () => {
        const startTime = DateTime.now();
        await PlayerStatisticController.get(
            "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
        );
        expect(startTime.diffNow().as("milliseconds")).toBeLessThan(1000);
    });

    test("Correct statistic calculations: Single player", async () => {
        const stats = await PlayerStatisticController.get(
            "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
        ); // In4Fun

        expect.soft(stats.winrate).toBe(0.7782258064516129);
        expect.soft(stats.mapWinrate).toBe(0.6801801801801802);
        expect.soft(stats.bestPlacement).toBe(1);
        expect.soft(stats.winTieLoss).toEqual({ w: 96, t: 1, l: 27 });
        expect
            .soft(stats.debutMatch!.uuid)
            .toBe("b0062fbd-02e0-40d2-a5f7-2e1c4045aa0b");
        expect.soft(stats.matchCount).toBe(124);
        expect.soft(stats.mapCount).toBe(444);
        expect.soft(stats.officialCompetitionCount).toBe(15);
        expect.soft(stats.competitionsWon).toBe(2);
        expect.soft(stats.averagePlacement).toBe(4.6);
        expect
            .soft(stats.mapsPicked)
            .toEqual([
                5, 9, 2, 16, 3, 4, 11, 8, 2, 14, 10, 16, 12, 5, 7, 2, 7, 7, 3,
            ]);
        expect
            .soft(stats.mapsBanned)
            .toEqual([
                6, 2, 4, 1, 4, 4, 4, 6, 7, 2, 2, 5, 3, 6, 4, 10, 2, 7, 3,
            ]);
        expect
            .soft(stats.mapsPickedAgainst)
            .toEqual([
                10, 9, 4, 6, 15, 12, 11, 7, 6, 6, 3, 1, 6, 8, 5, 15, 6, 12, 2,
            ]);
        expect
            .soft(stats.mapsBannedAgainst)
            .toEqual([
                6, 1, 4, 10, 3, 2, 1, 3, 4, 4, 6, 9, 10, 3, 4, 3, 6, 2, 1,
            ]);
        expect
            .soft(stats.mapsPlayed)
            .toEqual([
                24, 30, 12, 27, 31, 24, 30, 20, 17, 31, 22, 30, 25, 24, 17, 25,
                20, 28, 7,
            ]);
        expect
            .soft(stats.mapsWon)
            .toEqual([
                13.5, 18, 8.5, 21, 19, 18, 18, 12.5, 11.5, 25, 16.5, 20.5, 22.5,
                18, 11, 14, 16, 14.5, 4,
            ]);
        expect
            .soft(stats.perMapWinrate)
            .toEqual([
                0.5625, 0.6, 0.7083333333333334, 0.7777777777777778,
                0.6129032258064516, 0.75, 0.6, 0.625, 0.6764705882352942,
                0.8064516129032258, 0.75, 0.6833333333333333, 0.9, 0.75,
                0.6470588235294118, 0.56, 0.8, 0.5178571428571429,
                0.5714285714285714,
            ]);
        expect.soft(stats.mapPBs).toMatchObject([
            { map: 2, match: { uuid: "c8507495-90f1-4602-a937-4f3d510f5262" } },
            { map: 0, match: { uuid: "ad842b1b-4789-447c-9d29-13a53934a9ab" } },
            { map: 1, match: { uuid: "c736f9ea-6c6a-47d0-8179-d359ce857d5e" } },
            { map: 7, match: { uuid: "742f6a94-a232-4a2f-9e85-afc0e00ef972" } },
            { map: 0, match: { uuid: "9cee0d25-4235-49f0-8653-43e08cf7b59b" } },
            { map: 1, match: { uuid: "742f6a94-a232-4a2f-9e85-afc0e00ef972" } },
            { map: 1, match: { uuid: "c8507495-90f1-4602-a937-4f3d510f5262" } },
            { map: 1, match: { uuid: "0399943f-b25f-402a-8084-3f6678b240e8" } },
            { map: 3, match: { uuid: "df6abbe5-cb93-4323-b15b-a125d707803c" } },
            { map: 2, match: { uuid: "ca38f9e6-7446-4291-8701-80b552aeee15" } },
            { map: 1, match: { uuid: "1917be34-06df-464d-ae89-74c99d0c6e6b" } },
            { map: 0, match: { uuid: "8f8de8f7-727a-4f1a-83ca-6f3016b0fa12" } },
            { map: 4, match: { uuid: "de7b5cdb-8601-46b0-821d-efe7d7ea9cb9" } },
            { map: 0, match: { uuid: "015dc861-8c3d-4725-8afb-51e43838bb41" } },
            { map: 2, match: { uuid: "df6abbe5-cb93-4323-b15b-a125d707803c" } },
            { map: 1, match: { uuid: "87d3c3b0-97d6-4743-99bd-84f9dc202557" } },
            { map: 2, match: { uuid: "d68cce78-4a06-4870-bda2-889a3c032fed" } },
            { map: 3, match: { uuid: "c64d9b3b-be04-4e75-8633-f16fe2fb0abc" } },
            { map: 3, match: { uuid: "1917be34-06df-464d-ae89-74c99d0c6e6b" } },
        ]);
    });

    test("Correct statistic calculations: H2H", async () => {
        const stats = await PlayerStatisticController.get(
            "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
            "cc613517-4f0d-4a18-aa7e-4fd56c12cc26",
        ); // In4Fun vs Yannini

        expect(stats.h2hVsOpponent).toEqual({ w: 2, t: 0, l: 2 });
    });
});
