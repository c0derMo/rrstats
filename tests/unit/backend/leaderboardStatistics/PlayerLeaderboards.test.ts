import { afterAll, beforeAll, test, expect, describe } from "vitest";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import EloController from "~~/server/controller/EloController";
import LeaderboardController from "~~/server/controller/LeaderboardController";

let database: DatabaseConnector;

describe("Player Leaderboards", () => {
    beforeAll(async () => {
        database = new DatabaseConnector(
            "sqlite",
            "./tests/test_db_post_2024.db",
            false,
        );
        await database.initialize();
        await EloController.getInstance().fetchCompetitions();
        await EloController.getInstance().recalculateAllElos();
    });

    afterAll(async () => {
        await database.destroy();
    });

    test("Roulette Rankings", async () => {
        const players =
            await LeaderboardController.getEntries("Roulette Rankings");

        expect(players.length).toBe(93);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Scruffy"],
                Score: 330,
                Badge: "/rankingBadges/master.png",
            },
            backgroundColor: "bg-rankings-master",
            value: 330,
            order: 1,
            expandableRows: [
                [
                    "RR14: 100 (1st)",
                    "RRWC2024: 150 (1st)",
                    "RR13: 80 (2nd)",
                    "(RR15: 40 (7th))",
                ],
            ],
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Score: 260,
                Badge: "/rankingBadges/master.png",
            },
            backgroundColor: "bg-rankings-master",
            value: 260,
            order: 2,
            expandableRows: [
                ["RR13: 100 (1st)", "RR14: 70 (3rd)", "RRWC2024: 90 (4th)"],
            ],
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["The Rieper 47"],
                Score: 245,
                Badge: "/rankingBadges/master.png",
            },
            backgroundColor: "bg-rankings-master",
            value: 245,
            order: 3,
            expandableRows: [
                [
                    "RR14: 80 (2nd)",
                    "RRWC2024: 105 (3rd)",
                    "RR13: 60 (4th)",
                    "(RR15: 30 (9th))",
                ],
            ],
        });

        expect.soft(players[92]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["PurpleKey"],
                Score: 5,
                Badge: "/rankingBadges/bronze.png",
            },
            backgroundColor: "bg-rankings-bronze",
            value: 5,
            order: 90,
            expandableRows: [["RR14: 5 (48th)"]],
        });
    });

    test("Elo Ratings", async () => {
        const players = await LeaderboardController.getEntries("Elo Ratings");

        expect(players.length).toBe(237);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Scruffy"],
                Elo: 1458,
            },
            value: 1458,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                Elo: 1350,
            },
            value: 1350,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Music Inc"],
                Elo: 1336,
            },
            value: 1336,
            order: 3,
        });

        expect.soft(players[236]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Max Masters"],
                Elo: 706,
            },
            value: 706,
            order: 237,
        });
    });

    test("Most matches played", async () => {
        const players = await LeaderboardController.getEntries(
            "Most matches played",
        );

        expect(players.length).toBe(237);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                "Matches played": 141,
                "Competitions played": 17,
            },
            value: 141,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                "Matches played": 138,
                "Competitions played": 20,
            },
            value: 138,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                "Matches played": 124,
                "Competitions played": 15,
            },
            value: 124,
            order: 3,
        });

        expect.soft(players[236]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Janawham"],
                "Matches played": 0,
                "Competitions played": 0,
            },
            value: 0,
            order: 236,
        });
    });

    test("Most matches won", async () => {
        const players =
            await LeaderboardController.getEntries("Most matches won");

        expect(players.length).toBe(237);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Wins: 98,
                Ties: 1,
                Losses: 39,
                "Matches played": 138,
            },
            value: 98,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Wins: 97,
                Ties: 2,
                Losses: 42,
                "Matches played": 141,
            },
            value: 97,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Wins: 96,
                Ties: 1,
                Losses: 27,
                "Matches played": 124,
            },
            value: 96,
            order: 3,
        });

        expect.soft(players[236]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Wins: 0,
                Ties: 0,
                Losses: 7,
                "Matches played": 7,
            },
            value: 0,
            order: 168,
        });
    });

    test("Highest winrate", async () => {
        const players =
            await LeaderboardController.getEntries("Highest winrate");

        expect(players.length).toBe(235);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["sleazeball"],
                Winrate: 1,
                "Matches played": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ibbe"],
                Winrate: 0.8571428571428571,
                "Matches played": 7,
            },
            value: 0.8571428571428571,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["GKPunk"],
                Winrate: 0.8461538461538461,
                "Matches played": 13,
            },
            value: 0.8461538461538461,
            order: 3,
        });

        expect.soft(players[234]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Winrate: 0,
                "Matches played": 7,
            },
            value: 0,
            order: 172,
        });
    });

    test("Most maps played", async () => {
        const players =
            await LeaderboardController.getEntries("Most maps played");

        expect(players.length).toBe(237);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                "Maps played": 444,
                "Competitions played": 15,
            },
            value: 444,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                "Maps played": 443,
                "Competitions played": 20,
            },
            value: 443,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                "Maps played": 442,
                "Competitions played": 17,
            },
            value: 442,
            order: 3,
        });

        expect.soft(players[236]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["minecraft legend"],
                "Maps played": 0,
                "Competitions played": 0,
            },
            value: 0,
            order: 237,
        });
    });

    test("Most maps won", async () => {
        const players = await LeaderboardController.getEntries("Most maps won");

        expect(players.length).toBe(236);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Wins: 297,
                Ties: 10,
                Losses: 137,
                "Maps played": 444,
            },
            value: 297,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Wins: 276,
                Ties: 8,
                Losses: 158,
                "Maps played": 442,
            },
            value: 276,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Wins: 276,
                Ties: 11,
                Losses: 156,
                "Maps played": 443,
            },
            value: 276,
            order: 2,
        });

        expect.soft(players[235]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Lowress"],
                Wins: 0,
                Ties: 1,
                Losses: 2,
                "Maps played": 3,
            },
            value: 0,
            order: 191,
        });
    });

    test("Highest map winrate", async () => {
        const players = await LeaderboardController.getEntries(
            "Highest map winrate",
        );

        expect(players.length).toBe(236);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["sleazeball"],
                Winrate: 1,
                "Maps played": 2,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Tysonfoodsco"],
                Winrate: 0.75,
                "Maps played": 8,
            },
            value: 0.75,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Dein Nomos"],
                Winrate: 0.7181818181818181,
                "Maps played": 165,
            },
            value: 0.7181818181818181,
            order: 3,
        });

        expect.soft(players[235]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Los_pepos"],
                Winrate: 0,
                "Maps played": 6,
            },
            value: 0,
            order: 215,
        });
    });

    test("Highest map winrate (player picks)", async () => {
        const players = await LeaderboardController.getEntries(
            "Highest map winrate (player picks)",
        );

        expect(players.length).toBe(236);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Vendetta"],
                Winrate: 1,
                "Player picked maps": 2,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["BernardoOne"],
                Winrate: 1,
                "Player picked maps": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Scroob"],
                Winrate: 1,
                "Player picked maps": 1,
            },
            value: 1,
            order: 1,
        });

        expect.soft(players[235]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Winrate: 0,
                "Player picked maps": 7,
            },
            value: 0,
            order: 173,
        });
    });

    test("Highest map winrate (opponent picks)", async () => {
        const players = await LeaderboardController.getEntries(
            "Highest map winrate (opponent picks)",
        );

        expect(players.length).toBe(235);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["BernardoOne"],
                Winrate: 1,
                "Opponent picked maps": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frisbeehound"],
                Winrate: 1,
                "Opponent picked maps": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Crimson"],
                Winrate: 1,
                "Opponent picked maps": 2,
            },
            value: 1,
            order: 1,
        });

        expect.soft(players[234]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Winrate: 0,
                "Opponent picked maps": 7,
            },
            value: 0,
            order: 176,
        });
    });

    test("Highest map winrate (random picks)", async () => {
        const players = await LeaderboardController.getEntries(
            "Highest map winrate (random picks)",
        );

        expect(players.length).toBe(202);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Agent SSR"],
                Winrate: 1,
                "Random picked maps": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ibbe"],
                Winrate: 1,
                "Random picked maps": 4,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["mendietinha"],
                Winrate: 1,
                "Random picked maps": 1,
            },
            value: 1,
            order: 1,
        });

        expect.soft(players[201]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Harmaa.-"],
                Winrate: 0,
                "Random picked maps": 7,
            },
            value: 0,
            order: 175,
        });
    });

    test("Most maps played (specific map) - Sapienza", async () => {
        const players = await LeaderboardController.getEntries(
            "Most maps played (specific map)",
            { Map: HitmanMap.SAPIENZA },
        );

        expect(players.length).toBe(180);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Played: 42,
            },
            value: 42,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Played: 35,
            },
            value: 35,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                Played: 31,
            },
            value: 31,
            order: 3,
        });

        expect.soft(players[179]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Played: 1,
            },
            value: 1,
            order: 141,
        });
    });

    test("Most maps won (specific map) - Berlin", async () => {
        const players = await LeaderboardController.getEntries(
            "Most maps won (specific map)",
            { Map: HitmanMap.BERLIN },
        );

        expect(players.length).toBe(153);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                Wins: 25,
                "Map played": 33,
            },
            value: 25,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Nezuko Chan"],
                Wins: 17.5,
                "Map played": 24,
            },
            value: 17.5,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Wins: 16,
                "Map played": 23,
            },
            value: 16,
            order: 3,
        });

        expect.soft(players[152]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Harmaa.-"],
                Wins: 0,
                "Map played": 1,
            },
            value: 0,
            order: 113,
        });
    });

    test("Best map winrate (specific map) - Marrakesh", async () => {
        const players = await LeaderboardController.getEntries(
            "Best map winrate (specific map)",
            { Map: HitmanMap.MARRAKESH },
        );

        expect(players.length).toBe(161);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Crewdy"],
                Winrate: 1,
                "Map played": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["JoeTheBabyGrabber"],
                Winrate: 1,
                "Map played": 2,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Agent SSR"],
                Winrate: 1,
                "Map played": 1,
            },
            value: 1,
            order: 1,
        });

        expect.soft(players[160]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Harmaa.-"],
                Winrate: 0,
                "Map played": 1,
            },
            value: 0,
            order: 110,
        });
    });

    test("Personal Best (specific map) - Colorado", async () => {
        const players = await LeaderboardController.getEntries(
            "Personal Best (specific map)",
            { Map: HitmanMap.COLORADO },
        );

        expect(players.length).toBe(117);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Nezuko Chan"],
                "Personal Best": 331,
                Competition: "RRWC2024",
            },
            value: 331,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["quatilyti"],
                "Personal Best": 343,
                Competition: "RRWC2024",
            },
            value: 343,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Personal Best": 345,
                Competition: "RR11",
            },
            value: 345,
            order: 3,
        });

        expect.soft(players[116]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["PurpleKey"],
                "Personal Best": 3600,
                Competition: "RR5",
            },
            value: 3600,
            order: 115,
        });
    });

    test("Most RRs played", async () => {
        const players =
            await LeaderboardController.getEntries("Most RRs played");

        expect(players.length).toBe(236);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Participations: 20,
                First: "RR1",
                Last: "RRWC2024",
            },
            value: 20,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                Participations: 20,
                First: "RR1",
                Last: "RRWC2024",
            },
            value: 20,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["davidredsox"],
                Participations: 18,
                First: "RR1",
                Last: "RRWC2024",
            },
            value: 18,
            order: 3,
        });

        expect.soft(players[235]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Participations: 1,
                First: "RRWC2024",
                Last: "RRWC2024",
            },
            value: 1,
            order: 154,
        });
    });

    test("Most RRWCs played", async () => {
        const players =
            await LeaderboardController.getEntries("Most RRWCs played");

        expect(players.length).toBe(145);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Appearances: 5,
                First: "RRWC",
                Last: "RRWC2024",
            },
            value: 5,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Appearances: 5,
                First: "RRWC",
                Last: "RRWC2024",
            },
            value: 5,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Appearances: 5,
                First: "RRWC",
                Last: "RRWC2024",
            },
            value: 5,
            order: 1,
        });

        expect.soft(players[144]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["gekko"],
                Appearances: 1,
                First: "RRWC2024",
                Last: "RRWC2024",
            },
            value: 1,
            order: 72,
        });
    });

    test("Most titles won", async () => {
        const players =
            await LeaderboardController.getEntries("Most titles won");

        expect(players.length).toBe(12);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                "Titles won": 6,
                First: "RR1",
                Last: "RR7",
            },
            value: 6,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Titles won": 5,
                First: "RR8",
                Last: "RR15",
            },
            value: 5,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                "Titles won": 4,
                First: "RR1",
                Last: "RR6",
            },
            value: 4,
            order: 3,
        });
        expect.soft(players[11]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["TheTimeCube"],
                "Titles won": 1,
                First: "RRWC2023",
                Last: "RRWC2023",
            },
            value: 1,
            order: 8,
        });
    });

    test("Most Grand Finals played", async () => {
        const players = await LeaderboardController.getEntries(
            "Most Grand Finals played",
        );

        expect(players.length).toBe(27);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                "Grand finals played": 6,
                First: "RR1",
                Last: "RR7",
            },
            value: 6,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Grand finals played": 6,
                First: "RR4",
                Last: "RR15",
            },
            value: 6,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                "Grand finals played": 5,
                First: "RRWC",
                Last: "RR13",
            },
            value: 5,
            order: 3,
        });
        expect.soft(players[3]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Scruffy"],
                "Grand finals played": 5,
                First: "RR12",
                Last: "RRWC2024",
            },
            value: 5,
            order: 3,
        });

        expect.soft(players[26]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["The Rieper 47"],
                "Grand finals played": 1,
                First: "RR14",
                Last: "RR14",
            },
            value: 1,
            order: 15,
        });
    });

    test("Most medals won", async () => {
        const players =
            await LeaderboardController.getEntries("Most medals won");

        expect(players.length).toBe(33);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                Total: 8,
                Bronze: 2,
                Silver: 0,
                Gold: 6,
            },
            value: 8,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Total: 8,
                Bronze: 3,
                Silver: 3,
                Gold: 2,
            },
            value: 8,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                Total: 8,
                Bronze: 2,
                Silver: 1,
                Gold: 5,
            },
            value: 8,
            order: 1,
        });
        expect.soft(players[32]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Dein Nomos"],
                Total: 1,
                Bronze: 0,
                Silver: 1,
                Gold: 0,
            },
            value: 1,
            order: 22,
        });
    });

    test("Best RR Placement", async () => {
        const players =
            await LeaderboardController.getEntries("Best RR Placement");

        expect(players.length).toBe(217);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["TheTimeCube"],
                "Best placement": 1,
                "Competitions played": 5,
                "First achieved in competition": "RRWC2023",
                "Times achieved": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Blithe"],
                "Best placement": 1,
                "Competitions played": 7,
                "First achieved in competition": "RR7",
                "Times achieved": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Pigiero"],
                "Best placement": 1,
                "Competitions played": 15,
                "First achieved in competition": "RR8",
                "Times achieved": 1,
            },
            value: 1,
            order: 1,
        });

        expect.soft(players[216]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["virtualDream"],
                "Best placement": 48,
                "Competitions played": 1,
                "First achieved in competition": "RR13",
                "Times achieved": 1,
            },
            value: 48,
            order: 217,
        });
    });

    test("Average RR Placement", async () => {
        const players = await LeaderboardController.getEntries(
            "Average RR Placement",
        );

        expect(players.length).toBe(217);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ibbe"],
                "Average placement": "1.00",
                "Competitions played": 1,
            },
            value: 1,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["David Strong"],
                "Average placement": "1.50",
                "Competitions played": 2,
            },
            value: 1.5,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["DaniButa"],
                "Average placement": "2.50",
                "Competitions played": 6,
            },
            value: 2.5,
            order: 3,
        });

        expect.soft(players[216]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["virtualDream"],
                "Average placement": "48.00",
                "Competitions played": 1,
            },
            value: 48,
            order: 217,
        });
    });

    test("Longest winning streak", async () => {
        const players = await LeaderboardController.getEntries(
            "Longest winning streak",
        );

        expect(players.length).toBe(97);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                "Winning streak": 23,
                Active: false,
                "Last match": 1638475200000,
            },
            value: 23,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                "Winning streak": 14,
                Active: false,
                "Last match": 1614697200000,
            },
            value: 14,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Winning streak": 14,
                Active: false,
                "Last match": 1692558000000,
            },
            value: 14,
            order: 2,
        });

        expect.soft(players[96]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Music Inc"],
                "Winning streak": 5,
                Active: false,
                "Last match": 1725465600000,
            },
            value: 5,
            order: 59,
        });
    });

    test("Longest map winning streak", async () => {
        const players = await LeaderboardController.getEntries(
            "Longest map winning streak",
        );

        expect(players.length).toBe(349);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                "Winning streak": 28,
                Active: false,
                "Last match": 1701025200000,
            },
            value: 28,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                "Winning streak": 26,
                Active: false,
                "Last match": 1668528000000,
            },
            value: 26,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Winning streak": 25,
                Active: false,
                "Last match": 1700600400000,
            },
            value: 25,
            order: 3,
        });

        expect.soft(players[348]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["graory"],
                "Winning streak": 5,
                Active: false,
                "Last match": 1731524400000,
            },
            value: 5,
            order: 218,
        });
    });

    test("Longest map winning streak (specific map)", async () => {
        const players = await LeaderboardController.getEntries(
            "Longest map winning streak (specific map)",
        );

        expect(players.length).toBe(227);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Scruffy"],
                "Winning streak": 16,
                Active: true,
                "Last match": 1733680800000,
                Map: 11,
            },
            value: 16,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Ducker"],
                "Winning streak": 14,
                Active: false,
                "Last match": 1668353400000,
                Map: 15,
            },
            value: 14,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Winning streak": 14,
                Active: false,
                "Last match": 1715968800000,
                Map: 1,
            },
            value: 14,
            order: 2,
        });

        expect.soft(players[226]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Music Inc"],
                "Winning streak": 5,
                Active: false,
                "Last match": 1732654800000,
                Map: 5,
            },
            value: 5,
            order: 126,
        });
    });

    test("Most matches swept", async () => {
        const players =
            await LeaderboardController.getEntries("Most matches swept");

        expect(players.length).toBe(146);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Sweeps: 56,
                "Sweep rate": 0.3971631205673759,
                "Matches played": 141,
            },
            value: 56,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Sweeps: 54,
                "Sweep rate": 0.43548387096774194,
                "Matches played": 124,
            },
            value: 54,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Sweeps: 54,
                "Sweep rate": 0.391304347826087,
                "Matches played": 138,
            },
            value: 54,
            order: 2,
        });

        expect.soft(players[145]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Dynaso"],
                Sweeps: 1,
                "Sweep rate": 0.1,
                "Matches played": 10,
            },
            value: 1,
            order: 107,
        });
    });

    test("Most matches swept (6+ points)", async () => {
        const players = await LeaderboardController.getEntries(
            "Most matches swept (6+ points)",
        );

        expect(players.length).toBe(97);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                Sweeps: 40,
                "Sweep rate": 0.47619047619047616,
                "Matches played": 84,
            },
            value: 40,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Sweeps: 35,
                "Sweep rate": 0.4794520547945205,
                "Matches played": 73,
            },
            value: 35,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Sweeps: 30,
                "Sweep rate": 0.43478260869565216,
                "Matches played": 69,
            },
            value: 30,
            order: 3,
        });

        expect.soft(players[96]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Dynaso"],
                Sweeps: 1,
                "Sweep rate": 0.14285714285714285,
                "Matches played": 7,
            },
            value: 1,
            order: 80,
        });
    });

    test("Most matches swept (8+ points)", async () => {
        const players = await LeaderboardController.getEntries(
            "Most matches swept (8+ points)",
        );

        expect(players.length).toBe(10);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                Sweeps: 2,
                "Sweep rate": 0.2222222222222222,
                "Matches played": 9,
            },
            value: 2,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Sweeps: 1,
                "Sweep rate": 0.2,
                "Matches played": 5,
            },
            value: 1,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["The Buff Guy"],
                Sweeps: 1,
                "Sweep rate": 0.25,
                "Matches played": 4,
            },
            value: 1,
            order: 2,
        });

        expect.soft(players[9]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Sweeps: 1,
                "Sweep rate": 0.07692307692307693,
                "Matches played": 13,
            },
            value: 1,
            order: 2,
        });
    });

    test("Most matches reverse swept (6+ points)", async () => {
        const players = await LeaderboardController.getEntries(
            "Most matches reverse swept (6+ points)",
        );

        expect(players.length).toBe(19);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                "Reverse Sweeps": 3,
                "Last Reverse Sweep": 1707665400000,
            },
            value: 3,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Phanium"],
                "Reverse Sweeps": 3,
                "Last Reverse Sweep": 1724205600000,
            },
            value: 3,
            order: 1,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                "Reverse Sweeps": 3,
                "Last Reverse Sweep": 1724526000000,
            },
            value: 3,
            order: 1,
        });

        expect.soft(players[18]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Parapluie"],
                "Reverse Sweeps": 1,
                "Last Reverse Sweep": 1724016000000,
            },
            value: 1,
            order: 5,
        });
    });

    test("Most achievements", async () => {
        const players =
            await LeaderboardController.getEntries("Most achievements");

        expect(players.length).toBe(237);

        expect.soft(players[0]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["In4Fun"],
                Total: 132,
                Platinum: 29,
                Gold: 41,
                Silver: 37,
                Bronze: 25,
            },
            value: 132,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Frote7"],
                Total: 128,
                Platinum: 27,
                Gold: 39,
                Silver: 37,
                Bronze: 25,
            },
            value: 128,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Yannini"],
                Total: 128,
                Platinum: 27,
                Gold: 39,
                Silver: 37,
                Bronze: 25,
            },
            value: 128,
            order: 2,
        });

        expect.soft(players[236]).toEqual({
            columns: {
                Player: playerNamesToUUIDs["Myfu"],
                Total: 1,
                Platinum: 0,
                Gold: 0,
                Silver: 0,
                Bronze: 1,
            },
            value: 1,
            order: 234,
        });
    });

    test("Most matches casted", async () => {
        const players = await LeaderboardController.getEntries(
            "Most matches casted",
        );

        expect(players.length).toBe(77);

        expect.soft(players[0]).toEqual({
            columns: {
                Caster: "GKPunk",
                "Matches casted": 231,
            },
            value: 231,
            order: 1,
        });
        expect.soft(players[1]).toEqual({
            columns: {
                Caster: "gordiniroy",
                "Matches casted": 213,
            },
            value: 213,
            order: 2,
        });
        expect.soft(players[2]).toEqual({
            columns: {
                Caster: "Jokerj",
                "Matches casted": 195,
            },
            value: 195,
            order: 3,
        });

        expect.soft(players[76]).toEqual({
            columns: {
                Caster: "HOUSEN",
                "Matches casted": 1,
            },
            value: 1,
            order: 73,
        });
    });
});

const playerNamesToUUIDs: Record<string, string> = {
    Ibbe: "f93ed1b8-d423-4768-b68b-30ad8e2f9905",
    "David Strong": "52f9a138-8ef0-42df-a214-f077766c9d75",
    DaniButa: "db15be62-f05a-4300-b067-4cbba706f998",
    virtualDream: "33865cf5-bcc5-42e6-ad80-2737cf236aef",
    Scruffy: "382f3619-14c0-41fc-9ea8-c6cf05a29238",
    Phanium: "58a21881-628e-4f73-9cea-7a4d59c622ed",
    In4Fun: "564c9a2f-88df-46fa-9b93-9b1b9e5fd0d7",
    Ducker: "e1f828ca-92a8-4ce5-9616-017ec8221063",
    "The Rieper 47": "a0eccd64-36d1-4a02-8c1b-89262d444162",
    Frote7: "5e11e928-efee-4b6a-8687-1a38cbb2268e",
    Yannini: "cc613517-4f0d-4a18-aa7e-4fd56c12cc26",
    "minecraft legend": "def62eaf-1619-4d37-b77a-2885ae97bb34",
    Los_pepos: "b53d767b-5927-40fb-a431-49a95d4b7797",
    "Harmaa.-": "89ebb4c1-ede3-4a41-bf80-c2b94510969a",
    sleazeball: "28542412-14b1-4635-87fc-8e89a1a09a1a",
    Tysonfoodsco: "eb27c4f0-a040-49ab-ba4d-8e29f9184186",
    "Dein Nomos": "874cf8b0-19ce-44e4-8d3c-7e38786cd5d7",
    gekko: "05daa459-d687-4a0b-97a8-65f57bfb49d4",
    Dynaso: "040e2cb0-5426-4414-8ca0-37848473b076",
    Parapluie: "756979d8-6990-4f13-9c6a-3d3f3fd87b08",
    davidredsox: "af9ee04e-7361-4015-8f43-a54434bf5467",
    HOUSEN: "808d15b8-2f4e-451e-a567-dff777a61312",
    BernardoOne: "436e4037-f2a7-4494-a9ad-4a10977ed981",
    GKPunk: "77d7524f-7e13-47df-8659-f46722d1c530",
    Frisbeehound: "28ca1ff9-0937-4fc8-8e91-a5f117829bac",
    Crimson: "618fd579-e8ed-4a0f-85f0-8f9f2a0525e0",
    Scroob: "1b024b85-89ef-4aff-82ce-0da3edab78b9",
    Vendetta: "ecd8930c-763c-47ea-a851-308d8c6ac3c0",
    "Max Masters": "5335e4c1-a6e6-4cc2-9310-e4ee8cb07708",
    "Music Inc": "3bc6b8e6-39a7-427c-984e-a2272e94b72e",
    TheTimeCube: "3d01bc25-7a1a-4111-b480-0486d0948649",
    Janawham: "860163f0-84d8-4a23-98eb-18f6ea72024c",
    Lowress: "fcec534a-01f0-437a-a240-2580f431f163",
    Crewdy: "531b0d9a-428b-4fc3-bd7b-df2bf11adb54",
    JoeTheBabyGrabber: "a613c63f-8d97-48b7-88a0-b5249ffb7244",
    "Agent SSR": "1a4e8e9b-cfca-428a-9867-72fa916c97a0",
    "Nezuko Chan": "5d4b6a9e-3535-4e5b-a945-d18bfab91c1b",
    quatilyti: "19443c78-a672-4800-9753-72d1b7fae537",
    PurpleKey: "4ea79d5c-9744-4941-b63b-94fa7dca43bb",
    mendietinha: "02d3cd41-20ba-4023-9b2a-efd41a2c1643",
    Myfu: "d97a24c4-e943-4b8b-b641-0489b0da6be3",
    "The Buff Guy": "cc0a1608-cd6a-4cc0-8636-60efef408772",
    graory: "cfbb55cd-8447-4742-966e-eb16d24c09b1",
    Pigiero: "41c41b94-a28a-415a-b665-7bd804fb9e01",
    Blithe: "c88e329f-fedd-4bec-b107-cc8d9a1ce9a0",
};
