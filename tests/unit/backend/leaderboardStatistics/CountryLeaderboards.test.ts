import { afterAll, beforeAll, test, expect, describe } from "vitest";
import DatabaseConnector from "~~/server/controller/DatabaseConnnector";
import LeaderboardController from "~~/server/controller/LeaderboardController";

let database: DatabaseConnector;

describe("Country Leaderboards", () => {
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

    test("Most matches per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Most matches per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            columns: {
                Country: "United States",
                Flag: "https://flagicons.lipis.dev/flags/4x3/us.svg",
                Matches: 1232,
            },
        });
        expect(countries[1]).toMatchObject({
            columns: {
                Country: "United Kingdom",
                Flag: "https://flagicons.lipis.dev/flags/4x3/gb.svg",
                Matches: 439,
            },
        });
        expect(countries[2]).toMatchObject({
            columns: {
                Country: "Netherlands",
                Flag: "https://flagicons.lipis.dev/flags/4x3/nl.svg",
                Matches: 390,
            },
        });

        expect(countries[40]).toMatchObject({
            columns: {
                Country: "Kuwait",
                Flag: "https://flagicons.lipis.dev/flags/4x3/kw.svg",
                Matches: 1,
            },
        });
    });

    test("Most players per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Most players per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            columns: {
                Country: "United States",
                Flag: "https://flagicons.lipis.dev/flags/4x3/us.svg",
                Players: 74,
            },
        });
        expect(countries[1]).toMatchObject({
            columns: {
                Country: "United Kingdom",
                Flag: "https://flagicons.lipis.dev/flags/4x3/gb.svg",
                Players: 21,
            },
        });
        expect(countries[2]).toMatchObject({
            columns: {
                Country: "Canada",
                Flag: "https://flagicons.lipis.dev/flags/4x3/ca.svg",
                Players: 16,
            },
        });

        expect(countries[40]).toMatchObject({
            columns: {
                Country: "Italy",
                Flag: "https://flagicons.lipis.dev/flags/4x3/it.svg",
                Players: 1,
            },
        });
    });

    test("Most titles per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Most titles per country",
        );

        expect(countries.length).toBe(8);

        expect(countries[0]).toMatchObject({
            columns: {
                Country: "Serbia",
                Flag: "https://flagicons.lipis.dev/flags/4x3/rs.svg",
                Titles: 6,
            },
        });
        expect(countries[1]).toMatchObject({
            columns: {
                Country: "United States",
                Flag: "https://flagicons.lipis.dev/flags/4x3/us.svg",
                Titles: 6,
            },
        });
        expect(countries[2]).toMatchObject({
            columns: {
                Country: "Hungary",
                Flag: "https://flagicons.lipis.dev/flags/4x3/hu.svg",
                Titles: 5,
            },
        });
        expect(countries[3]).toMatchObject({
            columns: {
                Country: "Netherlands",
                Flag: "https://flagicons.lipis.dev/flags/4x3/nl.svg",
                Titles: 5,
            },
        });
        expect(countries[4]).toMatchObject({
            columns: {
                Country: "Germany",
                Flag: "https://flagicons.lipis.dev/flags/4x3/de.svg",
                Titles: 4,
            },
        });
        expect(countries[5]).toMatchObject({
            columns: {
                Country: "Ireland",
                Flag: "https://flagicons.lipis.dev/flags/4x3/ie.svg",
                Titles: 3,
            },
        });
        expect(countries[6]).toMatchObject({
            columns: {
                Country: "Sweden",
                Flag: "https://flagicons.lipis.dev/flags/4x3/se.svg",
                Titles: 1,
            },
        });
        expect(countries[7]).toMatchObject({
            columns: {
                Country: "India",
                Flag: "https://flagicons.lipis.dev/flags/4x3/in.svg",
                Titles: 1,
            },
        });
    });

    test("Best winrate per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Best winrate per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            columns: {
                Country: "Kuwait",
                Flag: "https://flagicons.lipis.dev/flags/4x3/kw.svg",
                Winrate: 1,
                "Total matches": 1,
            },
        });
        expect(countries[1]).toMatchObject({
            columns: {
                Country: "Hungary",
                Flag: "https://flagicons.lipis.dev/flags/4x3/hu.svg",
                Winrate: 0.8005780346820809,
                "Total matches": 173,
            },
        });
        expect(countries[2]).toMatchObject({
            columns: {
                Country: "Japan",
                Flag: "https://flagicons.lipis.dev/flags/4x3/jp.svg",
                Winrate: 0.7021276595744681,
                "Total matches": 47,
            },
        });

        expect(countries[38]).toMatchObject({
            columns: {
                Country: "Malaysia",
                Flag: "https://flagicons.lipis.dev/flags/4x3/my.svg",
                Winrate: 0,
                "Total matches": 3,
            },
        });
        expect(countries[39]).toMatchObject({
            columns: {
                Country: "Türkiye",
                Flag: "https://flagicons.lipis.dev/flags/4x3/tr.svg",
                Winrate: 0,
                "Total matches": 4,
            },
        });
        expect(countries[40]).toMatchObject({
            columns: {
                Country: "Bulgaria",
                Flag: "https://flagicons.lipis.dev/flags/4x3/bg.svg",
                Winrate: 0,
                "Total matches": 1,
            },
        });
    });

    test("Most wins per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Most wins per country",
        );

        expect(countries.length).toBe(38);

        expect(countries[0]).toMatchObject({
            columns: {
                Country: "United States",
                Flag: "https://flagicons.lipis.dev/flags/4x3/us.svg",
                Wins: 659.5,
            },
        });
        expect(countries[1]).toMatchObject({
            columns: {
                Country: "Netherlands",
                Flag: "https://flagicons.lipis.dev/flags/4x3/nl.svg",
                Wins: 235.5,
            },
        });
        expect(countries[2]).toMatchObject({
            columns: {
                Country: "United Kingdom",
                Flag: "https://flagicons.lipis.dev/flags/4x3/gb.svg",
                Wins: 223,
            },
        });

        expect(countries[37]).toMatchObject({
            columns: {
                Country: "Kuwait",
                Flag: "https://flagicons.lipis.dev/flags/4x3/kw.svg",
                Wins: 1,
            },
        });
    });
});
