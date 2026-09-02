import { test, expect } from "@playwright/test";
import { expectSpreadsheetRow } from "./testUtils";

test.describe("Leaderboards Page", () => {
    test("Correct categories", async ({ page }) => {
        await page.goto("/leaderboards");

        const tabs = page.locator(".p-5").first();

        await expect(tabs.getByText("Roulette Rankings")).toBeVisible();
        await expect(tabs.getByText("Elo Ratings")).toBeVisible();

        await tabs.getByText("Matches").first().click();

        await expect(tabs.getByText("Most matches played")).toBeVisible();
        await expect(tabs.getByText("Most matches won")).toBeVisible();
        await expect(tabs.getByText("Highest winrate")).toBeVisible();

        await tabs.getByText("Matches").first().click();
        await tabs.getByText("Maps").nth(2).click();

        await expect(
            tabs.getByText("Most maps played", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most maps won", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Highest map winrate", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Highest map winrate (player picks)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Highest map winrate (opponent picks)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Highest map winrate (random picks)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most maps played (specific map)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most maps won (specific map)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Best map winrate (specific map)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Personal Best (specific map)"),
        ).toBeVisible();

        await tabs.getByText("Maps").nth(2).click();
        await tabs.getByText("Participation").first().click();

        await expect(tabs.getByText("Most RRs played")).toBeVisible();
        await expect(tabs.getByText("Most RRWCs played")).toBeVisible();
        await expect(tabs.getByText("Most titles won")).toBeVisible();
        await expect(tabs.getByText("Most Grand Finals played")).toBeVisible();
        await expect(tabs.getByText("Most medals won")).toBeVisible();
        await expect(tabs.getByText("Best RR Placement")).toBeVisible();
        await expect(tabs.getByText("Average RR Placement")).toBeVisible();

        await tabs.getByText("Participation").first().click();
        await tabs.getByText("Streaks").first().click();

        await expect(tabs.getByText("Longest winning streak")).toBeVisible();
        await expect(
            tabs.getByText("Longest map winning streak", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Longest map winning streak (specific map)"),
        ).toBeVisible();

        await tabs.getByText("Streaks").first().click();
        await tabs.getByText("Sweeps").first().click();

        await expect(
            tabs.getByText("Most matches swept", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most matches swept (6+ points)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most matches swept (8+ points)"),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most matches reverse swept (6+ points)"),
        ).toBeVisible();

        await tabs.getByText("Sweeps").first().click();
        await tabs.getByText("Other").first().click();

        await expect(tabs.getByText("Most achievements")).toBeVisible();
        await expect(tabs.getByText("Most matches casted")).toBeVisible();

        await tabs.getByText("Countries").first().click();

        await expect(tabs.getByText("Most players per country")).toBeVisible();
        await expect(tabs.getByText("Most matches per country")).toBeVisible();
        await expect(tabs.getByText("Most wins per country")).toBeVisible();
        await expect(tabs.getByText("Best winrate per country")).toBeVisible();
        await expect(tabs.getByText("Most titles per country")).toBeVisible();

        await tabs.getByText("Maps").first().click();

        await expect(tabs.getByText("Most times picked")).toBeVisible();
        await expect(tabs.getByText("Most times banned")).toBeVisible();
        await expect(
            tabs.getByText("Most times played", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Most times played as random map"),
        ).toBeVisible();
        await expect(tabs.getByText("Most times appeared")).toBeVisible();
    });

    test("Top leaderboard entries", async ({ page }) => {
        await page.goto("/leaderboards");

        const table = page.locator(".table");

        await expectSpreadsheetRow(
            table,
            ["1st", null, "Scruffy", "330", null],
            1,
        );
        await expectSpreadsheetRow(
            table,
            ["2nd", null, "In4Fun", "260", null],
            2,
        );

        await page.getByText("Participation").click();
        await page.getByText("Most Grand Finals played").click();
        await expectSpreadsheetRow(
            table,
            ["1st", "Ducker", "6", "RR1", "RR7"],
            1,
        );
        await expectSpreadsheetRow(
            table,
            ["3rd", "In4Fun", "5", "RRWC", "RR13"],
            3,
        );

        await page.getByText("Sweeps").click();
        await page.getByText("Most matches reverse swept (6+ points)").click();
        await expectSpreadsheetRow(
            table,
            ["1st", "Yannini", "3", "Feb 11, 2024, 4:30 PM"],
            1,
        );
        await expectSpreadsheetRow(
            table,
            ["1st", "Frote7", "3", "Aug 24, 2024, 9:00 PM"],
            3,
        );

        await page.getByText("Countries").first().click();
        await page.getByText("Most players per country").click();
        await expectSpreadsheetRow(
            table,
            ["1st", null, "United States", "74", null],
            1,
        );
        await expectSpreadsheetRow(
            table,
            ["3rd", null, "Canada", "16", null],
            3,
        );

        await page.getByText("Best winrate per country").first().click();
        await expectSpreadsheetRow(
            table,
            ["1st", null, "Hungary", "80.06%", "173", null],
            1,
        );
        await expectSpreadsheetRow(
            table,
            ["3rd", null, "Indonesia", "70.19%", "52", null],
            3,
        );

        await page.getByText("Maps").first().click();
        await page.getByText("Most times picked").first().click();
        await expectSpreadsheetRow(table, ["1st", "Sapienza", "362", null], 1);
        await expectSpreadsheetRow(table, ["3rd", "Miami", "337", null], 3);

        await page.getByText("Most times played as random map").click();
        await expectSpreadsheetRow(
            table,
            ["1st", "Whittleton Creek", "161", null],
            1,
        );
        await expectSpreadsheetRow(table, ["3rd", "Sapienza", "154", null], 3);
    });
});
