import { test, expect } from "@playwright/test";
import { expectTableRow } from "./testUtils";

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
        await expect(page.getByText("Elo rating: 1323")).toBeVisible();
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
        await outerTabPanel.getByText("Opponents").first().click();
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
        await outerTabPanel.getByText("Records").first().click();

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
            ["New York", "16", "1"],
        );
        await expectTableRow(
            tabPanel.locator("table").nth(1).locator("tbody").first(),
            ["Haven Island", "90%", "22.5", "25"],
        );
        await expectTableRow(
            tabPanel.locator("table").nth(2).locator("tbody").first(),
            ["Berlin", "10", "3"],
        );

        // Personal bests panel
        await outerTabPanel.getByText("Personal Bests").first().click();
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
            ["DUB", "SAP", "CHO", "COL", "HOK", "AMB"],
        ]);
        await expectTableRow(table.locator("tbody").nth(2), [
            "RRWC2024",
            "Quarter-Finals",
            "In4Fun",
            "10 - 6",
            "quatilyti",
            ["BER", "HOK", "COL", "HAV", "DAR", "MAR", "SGA", "BKK"],
        ]);
        await expectTableRow(table.locator("tbody").nth(4), [
            "RRWC2024",
            "Round 1",
            "In4Fun",
            "8 - 6",
            "Peter Dutton MP",
            ["SF", "MIA", "SAP", "DAR", "MEN", "MUM", "PAR"],
        ]);
    });

    test("Achievement grid", async ({ page }) => {
        await page.goto("/In4Fun");

        await page.getByText("Achievements").first().click();
        await page.locator(".fa-spinner").waitFor({ state: "hidden" });

        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).toBeVisible();
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).toHaveClass(/(\s|^)completed-shadow-plat(\s|$)/);
        expect(
            await page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .textContent(),
        ).toContain("Achieved on Nov 6, 2024");
        expect(
            await page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .count(),
        ).toBe(5);
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .nth(0),
        ).toHaveCSS("color", "rgb(208, 208, 208)");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .nth(1),
        ).toHaveCSS("color", "rgb(255, 227, 156)");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .nth(2),
        ).toHaveCSS("color", "rgb(255, 227, 156)");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .nth(3),
        ).toHaveCSS("color", "rgb(255, 207, 201)");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" })
                .locator(".fa-trophy")
                .nth(4),
        ).toHaveCSS("color", "rgb(188, 250, 242)");

        await expect(
            page.locator(".grid > div").filter({ hasText: "Open Season V" }),
        ).toBeVisible();
        await expect(
            page.locator(".grid > div").filter({ hasText: "Open Season V" }),
        ).not.toHaveClass(/(\s|^)completed-shadow-plat(\s|$)/);
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Open Season V" })
                .locator("div > div > div"),
        ).toHaveCSS("width", "116.156px");

        await expect(
            page.locator(".grid > div").filter({ hasText: "World-Renowned" }),
        ).toBeVisible();
        await expect(
            page.locator(".grid > div").filter({ hasText: "World-Renowned" }),
        ).toHaveClass(/(\s|^)completed-shadow(\s|$)/);

        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" }),
        ).toBeVisible();
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" }),
        ).not.toHaveClass(/(\s|^)completed-shadow(\s|$)/);
        expect(
            await page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" })
                .textContent(),
        ).not.toContain("Achieved on");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" })
                .locator(".fa-trophy"),
        ).toHaveCSS("color", "rgb(79, 79, 79)");

        await expect(
            page.locator(".grid > div").filter({ hasText: "A Seed to Avoid" }),
        ).toBeVisible();
        await expect(
            page.locator(".grid > div").filter({ hasText: "A Seed to Avoid" }),
        ).not.toHaveClass(/(\s|^)completed-shadow(\s|$)/);
        expect(
            await page
                .locator(".grid > div")
                .filter({ hasText: "A Seed to Avoid" })
                .textContent(),
        ).toContain("(click to submit)");

        // Hide missing
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" }),
        ).toBeVisible();
        await page
            .locator("div")
            .filter({ has: page.locator("#achievementsHideMissing") })
            .last()
            .click();
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Challenger & Defender" }),
        ).not.toBeVisible();
        await page
            .locator("div")
            .filter({ has: page.locator("#achievementsHideMissing") })
            .last()
            .click();

        // Hide completed
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).toBeVisible();
        await page
            .locator("div")
            .filter({ has: page.locator("#achievementsHideCompleted") })
            .last()
            .click();
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).not.toBeVisible();
        await page
            .locator("div")
            .filter({ has: page.locator("#achievementsHideCompleted") })
            .last()
            .click();

        // Search
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).toBeVisible();
        await page.getByRole("textbox").nth(1).fill("Play");
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Roulette Player VII" }),
        ).toBeVisible();
        await expect(
            page
                .locator(".grid > div")
                .filter({ hasText: "Getting Mileage V" }),
        ).not.toBeVisible();
        await page.getByRole("textbox").nth(1).fill("");

        // Sorting
        expect(
            await page.locator(".grid > div").first().textContent(),
        ).toContain("Getting Mileage V");
        await page
            .locator("span.flex-grow", { hasText: "Sort by completion" })
            .click();
        await page.getByText("Sort by name").click();

        expect(
            await page.locator(".grid > div").first().textContent(),
        ).toContain("Against the World V");
        await page
            .locator("span.flex-grow", { hasText: "Sort by name" })
            .click();
        await page.getByText("Sort by rarity").click();

        expect(
            await page.locator(".grid > div").nth(1).textContent(),
        ).toContain("Against the World V");
        await page
            .locator("span.flex-grow", { hasText: "Sort by rarity" })
            .click();
        await page.getByText("Sort by completion").click();

        // Categories
        expect(await page.locator(".grid").count()).toBeGreaterThan(1);
        expect(page.getByText("Experience")).toBeVisible();
        await page
            .locator("div")
            .filter({ has: page.locator("#achievementsGroup") })
            .last()
            .click();
        expect(await page.locator(".grid").count()).toBe(1);
        expect(page.getByText("Experience")).not.toBeVisible();
    });
});
