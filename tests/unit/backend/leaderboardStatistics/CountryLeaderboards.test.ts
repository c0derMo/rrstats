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
        await LeaderboardController.recalculate();
    });

    afterAll(async () => {
        await database.destroy();
    });

    test("Matches per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Matches per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            countryCode: "us",
            country: "United States",
            displayScore: "1232",
            sortingScore: 1232,
        });
        expect(countries[1]).toMatchObject({
            countryCode: "gb",
            country: "United Kingdom",
            displayScore: "439",
            sortingScore: 439,
        });
        expect(countries[2]).toMatchObject({
            countryCode: "nl",
            country: "Netherlands",
            displayScore: "390",
            sortingScore: 390,
        });

        expect(countries[40]).toMatchObject({
            countryCode: "kw",
            country: "Kuwait",
            displayScore: "1",
            sortingScore: 1,
        });
    });

    test("Players per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Players per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            countryCode: "us",
            country: "United States",
            displayScore: "74",
            sortingScore: 74,
        });
        expect(countries[1]).toMatchObject({
            countryCode: "gb",
            country: "United Kingdom",
            displayScore: "21",
            sortingScore: 21,
        });
        expect(countries[2]).toMatchObject({
            countryCode: "ca",
            country: "Canada",
            displayScore: "16",
            sortingScore: 16,
        });

        expect(countries[40]).toMatchObject({
            countryCode: "it",
            country: "Italy",
            displayScore: "1",
            sortingScore: 1,
        });
    });

    test("Titles per country", async () => {
        const countries =
            await LeaderboardController.getEntries("Titles per country");

        expect(countries.length).toBe(8);

        expect(countries[0]).toMatchObject({
            countryCode: "rs",
            country: "Serbia",
            displayScore: "6",
            sortingScore: 6,
        });
        expect(countries[1]).toMatchObject({
            countryCode: "us",
            country: "United States",
            displayScore: "6",
            sortingScore: 6,
        });
        expect(countries[2]).toMatchObject({
            countryCode: "hu",
            country: "Hungary",
            displayScore: "5",
            sortingScore: 5,
        });
        expect(countries[3]).toMatchObject({
            countryCode: "nl",
            country: "Netherlands",
            displayScore: "5",
            sortingScore: 5,
        });
        expect(countries[4]).toMatchObject({
            countryCode: "de",
            country: "Germany",
            displayScore: "4",
            sortingScore: 4,
        });
        expect(countries[5]).toMatchObject({
            countryCode: "ie",
            country: "Ireland",
            displayScore: "3",
            sortingScore: 3,
        });
        expect(countries[6]).toMatchObject({
            countryCode: "se",
            country: "Sweden",
            displayScore: "1",
            sortingScore: 1,
        });
        expect(countries[7]).toMatchObject({
            countryCode: "in",
            country: "India",
            displayScore: "1",
            sortingScore: 1,
        });
    });

    test("Winrate per country", async () => {
        const countries = await LeaderboardController.getEntries(
            "Winrate per country",
        );

        expect(countries.length).toBe(41);

        expect(countries[0]).toMatchObject({
            countryCode: "kw",
            country: "Kuwait",
            displayScore: "100.00%",
            sortingScore: 1,
            secondaryScore: 1,
        });
        expect(countries[1]).toMatchObject({
            countryCode: "hu",
            country: "Hungary",
            displayScore: "80.06%",
            sortingScore: 0.8005780346820809,
            secondaryScore: 173,
        });
        expect(countries[2]).toMatchObject({
            countryCode: "jp",
            country: "Japan",
            displayScore: "70.21%",
            sortingScore: 0.7021276595744681,
            secondaryScore: 47,
        });

        expect(countries[40]).toMatchObject({
            countryCode: "my",
            country: "Malaysia",
            displayScore: "0.00%",
            sortingScore: 0,
            secondaryScore: 3,
        });
    });

    test("Wins per country", async () => {
        const countries =
            await LeaderboardController.getEntries("Wins per country");

        expect(countries.length).toBe(38);

        expect(countries[0]).toMatchObject({
            countryCode: "us",
            country: "United States",
            displayScore: "659.5",
            sortingScore: 659.5,
        });
        expect(countries[1]).toMatchObject({
            countryCode: "nl",
            country: "Netherlands",
            displayScore: "235.5",
            sortingScore: 235.5,
        });
        expect(countries[2]).toMatchObject({
            countryCode: "gb",
            country: "United Kingdom",
            displayScore: "223",
            sortingScore: 223,
        });

        expect(countries[37]).toMatchObject({
            countryCode: "kw",
            country: "Kuwait",
            displayScore: "1",
            sortingScore: 1,
        });
    });
});
