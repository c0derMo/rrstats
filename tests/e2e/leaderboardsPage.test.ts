import { test, expect, type Locator } from "@playwright/test";

async function expectTableRow(locator: Locator, row: string[]) {
    for (const idx in row) {
        await expect(locator.locator("td").nth(parseInt(idx))).toContainText(
            row[idx],
        );
    }
}

test.describe("Leaderboards Page", () => {
    test("Correct categories", async ({ page }) => {
        await page.goto("/leaderboards");

        const tabs = page.locator(".p-5").first();

        await expect(tabs.getByText("Winrate", { exact: true })).toBeVisible();
        await expect(tabs.getByText("Map Winrate")).toBeVisible();
        await expect(
            tabs.getByText("Roulette Rivals Participations"),
        ).toBeVisible();
        await expect(tabs.getByText("RRWC Participations")).toBeVisible();
        await expect(tabs.getByText("Average RR Placement")).toBeVisible();
        await expect(tabs.getByText("Grand Final Appearances")).toBeVisible();
        await expect(
            tabs.getByText("Matches played", { exact: true }),
        ).toBeVisible();
        await expect(
            tabs.getByText("Matches won", { exact: true }),
        ).toBeVisible();
        await expect(tabs.getByText("Maps played")).toBeVisible();
        await expect(tabs.getByText("Maps won", { exact: true })).toBeVisible();
        await expect(tabs.getByText("Winrate on own-map-picks")).toBeVisible();
        await expect(
            tabs.getByText("Winrate on opponent-map-picks"),
        ).toBeVisible();
        await expect(tabs.getByText("Most matches won in a row")).toBeVisible();
        await expect(tabs.getByText("Most maps won in a row")).toBeVisible();
        await expect(tabs.getByText("Winning streak on a map")).toBeVisible();
        await expect(tabs.getByText("Sweeps (6+ points)")).toBeVisible();
        await expect(tabs.getByText("Sweeps", { exact: true })).toBeVisible();
        await expect(tabs.getByText("Reverse sweeps")).toBeVisible();
        await expect(
            tabs.getByText("Spins played on specific map"),
        ).toBeVisible();
        await expect(tabs.getByText("Winrate on specific map")).toBeVisible();
        await expect(tabs.getByText("Elo rating")).toBeVisible();
        await expect(tabs.getByText("Matches casted")).toBeVisible();

        await tabs.getByText("Countries").click();

        await expect(tabs.getByText("Players per country")).toBeVisible();
        await expect(tabs.getByText("Matches per country")).toBeVisible();
        await expect(tabs.getByText("Wins per country")).toBeVisible();
        await expect(tabs.getByText("Winrate per country")).toBeVisible();
        await expect(tabs.getByText("Titles per country")).toBeVisible();

        await tabs.getByText("Maps").click();

        await expect(tabs.getByText("Picked")).toBeVisible();
        await expect(tabs.getByText("Banned")).toBeVisible();
        await expect(tabs.getByText("Played", { exact: true })).toBeVisible();
        await expect(tabs.getByText("Played as random map")).toBeVisible();
        await expect(tabs.getByText("Appearances")).toBeVisible();
    });

    test("Correct default secondary filters", async ({ page }) => {
        await page.goto("/leaderboards");

        const secondaryFilterInput = page.locator("input[type=number]");
        await expect(secondaryFilterInput).toHaveValue("5");

        await page.getByText("Map Winrate").click();
        await expect(secondaryFilterInput).toHaveValue("10");

        await page.getByText("Average RR Placement").click();
        await expect(secondaryFilterInput).toHaveValue("3");

        await page.getByText("Winrate on own-map-picks").click();
        await expect(secondaryFilterInput).toHaveValue("5");

        await page.getByText("Winrate on opponent-map-picks").click();
        await expect(secondaryFilterInput).toHaveValue("5");

        await page.getByText("Winrate on specific map").click();
        await expect(secondaryFilterInput).toHaveValue("5");

        await page.getByText("Countries").click();
        await page.getByText("Winrate per country").click();
        await expect(secondaryFilterInput).toHaveValue("5");
    });

    test("Top leaderboard entries", async ({ page }) => {
        await page.goto("/leaderboards");

        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Ibbe",
            "85.71%",
            "7",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "Scruffy",
            "83.62%",
            "58",
        ]);
        await page.getByText("Grand Final Appearances").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Ducker",
            "6",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "In4Fun",
            "5",
        ]);
        await page.getByText("Reverse sweeps").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Yannini",
            "3",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "1st",
            "Frote7",
            "3",
        ]);

        await page.getByText("Countries").click();
        await page.getByText("Players per country").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "United States",
            "74",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "Canada",
            "16",
        ]);
        await page.getByText("Winrate per country").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Hungary",
            "80.06%",
            "173",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "Indonesia",
            "70.19%",
            "52",
        ]);

        await page.getByText("Maps").click();
        await page.getByText("Picked").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Sapienza",
            "362",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "Miami",
            "337",
        ]);
        await page.getByText("Played as random map").click();
        await expectTableRow(page.locator("tbody").first(), [
            "1st",
            "Whittleton Creek",
            "161",
        ]);
        await expectTableRow(page.locator("tbody").nth(2), [
            "3rd",
            "Sapienza",
            "154",
        ]);
    });
});
