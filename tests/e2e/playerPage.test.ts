import { test, expect, type Locator } from "@playwright/test";

async function expectTableRow(locator: Locator, row: string[]) {
    for (const idx in row) {
        await expect(locator.locator("td").nth(parseInt(idx))).toContainText(
            row[idx],
        );
    }
}

test.describe("Player Page", () => {
    test("Correct stats on top of page", async ({ page }) => {
        await page.goto("/In4Fun");

        await expect(
            page.getByRole("heading", { name: "In4Fun" }),
        ).toBeVisible();
        await expect(page.getByText("RRWC 2020 & RR13 Champion")).toBeVisible();

        const winrateStats = page.locator("div.text-xl.font-light.text-right");
        await expect(winrateStats).toContainText("Winrate: 78%");
        await expect(winrateStats).toContainText("Map-Winrate: 68%");
        await expect(winrateStats).toContainText("Debut: 4/15/2020 (RR2)");

        await expect(page.getByText("Best RR Placement: 1st")).toBeVisible();
        await expect(page.getByText("Maps played: 444")).toBeVisible();
        await expect(page.getByText("Matches played: 124")).toBeVisible();
        await expect(page.getByText("W-T-L: 96-1-27")).toBeVisible();
    });

    test("Left tab panel", async ({ page }) => {
        await page.goto("/In4Fun");

        const outerTabPanel = page
            .locator("div:nth-child(2) > div:nth-child(3) > div")
            .first();
        const tabPanel = outerTabPanel.locator("div > .mt-2 > div");

        // Competitions panel
        await expectTableRow(tabPanel.locator("tbody").first(), [
            "Roulette Rivals World Championship 2024",
            "4th",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(2), [
            "Roulette Rivals 13",
            "1st",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(3), [
            "Retro Rivals",
            "1st",
        ]);

        await tabPanel.getByRole("checkbox").locator("..").click();

        await expectTableRow(tabPanel.locator("tbody").nth(3), [
            "Roulette Rivals World Championship 2023",
            "4th",
        ]);

        // Opponents panel
        await outerTabPanel.getByText("Opponents").click();
        await expectTableRow(tabPanel.locator("tbody").first(), [
            "The Rieper 47",
            "6",
            "4-0-2",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(1), [
            "Frote7",
            "5",
            "2-0-3",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(2), [
            "mikulers",
            "5",
            "5-0-0",
        ]);

        // Records panel
        await outerTabPanel.getByText("Records").click();

        await expectTableRow(tabPanel.locator("tbody").first(), [
            "Isle of Sgàil",
            "02:24",
            "11/20/2024 - now",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(1), [
            "Shortest match with 6+ maps",
            "35:37",
            "5/27/2023 - 6/9/2024",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(2), [
            "Isle of Sgàil",
            "02:52",
            "5/19/2023 - 11/20/2024",
        ]);
    });

    test("Bottom Tab Panel", async ({ page }) => {
        await page.goto("/In4Fun");

        const outerTabPanel = page.locator(
            "div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div:nth-child(4)",
        );
        const tabPanel = outerTabPanel.locator("div > .mt-2 > div");

        // Maps panel
        await expectTableRow(
            tabPanel.locator("table").first().locator("tbody").first(),
            ["New York", "16"],
        );
        await expectTableRow(
            tabPanel.locator("table").nth(1).locator("tbody").first(),
            ["Haven Island", "90%", "22.5", "25"],
        );
        await expectTableRow(
            tabPanel.locator("table").nth(2).locator("tbody").first(),
            ["Berlin", "10"],
        );

        // Personal bests panel
        await outerTabPanel.getByText("Personal Bests").click();
        const parisSpin =
            "Viktor Novikov: Falling Object as Sheikh Salman Al-Ghazali Dalia Margolis: Silenced SMG as Helmut Kruger (No Target Pacification)";
        const newYorkSpin = "Athena Savalas: Neck Snap as Security Guard";
        await expectTableRow(tabPanel.locator("tbody").first(), [
            "Paris",
            "02:58",
            parisSpin,
            "RRWC2023 Round 1 vs Fuzk",
        ]);
        await expectTableRow(tabPanel.locator("tbody").nth(12), [
            "New York",
            "02:15",
            newYorkSpin,
            "RRWC2021 Round 1 vs davidredsox",
        ]);
    });

    test("Matches list", async ({ page }) => {
        await page.goto("/In4Fun");

        const table = page.locator("table").nth(2);
        await expectTableRow(table.locator("tbody").nth(0), [
            "RRWC2024",
            "3rd Place Playoff",
            "In4Fun",
            "4 - 8",
            "The Rieper 47",
        ]);
        await expectTableRow(table.locator("tbody").nth(2), [
            "RRWC2024",
            "Quarter-Finals",
            "In4Fun",
            "10 - 6",
            "quatilyti",
        ]);
        await expectTableRow(table.locator("tbody").nth(4), [
            "RRWC2024",
            "Round 1",
            "In4Fun",
            "8 - 6",
            "Peter Dutton MP",
        ]);
    });
});
