import { test, expect } from "@playwright/test";
import { expectTable, expectTableRow } from "./testUtils";

test.describe("Tournament Page", () => {
    test("Correct matches on RRWC2024", async ({ page }) => {
        await page.goto("/tournament/RRWC2024");

        const matchesTable = page.locator("table.min-w-full");

        await expectTableRow(matchesTable.locator("tbody").first(), [
            "Dec 8, 2024, 7:00 PM",
            "Grand Final",
            "Scruffy",
            "14 - 6",
            "Music Inc",
            ["MUM", "PAR", "MEN", "BKK"],
            [
                "NY",
                "DUB",
                "BER",
                "SF",
                "CHO",
                "HAV",
                "AMB",
                "SGA",
                "SAP",
                "COL",
            ],
            "In4Fun, Joats, Cabben, DeadlyMuffin_Man, CurryMaker, OhShitMan",
        ]);

        await expectTableRow(matchesTable.locator("tbody").nth(4), [
            "Nov 28, 2024, 3:30 PM",
            "Quarter-Finals",
            "Dein Nomos",
            "4 - 10",
            "The Rieper 47",
            ["MAR", "MEN", "DUB", "BKK"],
            ["MIA", "MUM", "HAV", "CHO", "HOK", "AMB", "SGA"],
            "Frote7, aphro",
        ]);
    });

    test("Correct groups on RRWC2024", async ({ page }) => {
        await page.goto("/tournament/RRWC2024");
        await page.getByText("Groups").first().click();

        const groupTables = page.locator(".grid > .w-full.flex.flex-col.gap-2");

        // Group A
        const groupA = groupTables.nth(0);
        await expect(groupA.locator("h1")).toHaveText("Group A");
        await expectTable(
            groupA.locator("table").first(),
            [
                ["1", "TheTimeCube", "7", "7", "0", "0", "38"],
                ["2", "Qrescent7", "7", "5", "0", "2", "30"],
                ["3", "Frote7", "7", "4", "0", "3", "28"],
                ["4", "HOUSEN", "7", "4", "0", "3", "25"],
                ["5", "SovietDubov", "7", "4", "0", "3", "22"],
                ["6", "Vulcat", "7", "3", "0", "4", "18"],
                ["7", "AlexHiller", "7", "1", "0", "6", "6"],
                ["8", "DeadlyMuffin_Man", "7", "0", "0", "7", "1"],
            ],
            "tr",
            1,
        );
        await expectTable(
            groupA.locator("table").nth(1),
            [
                [
                    "TheTimeCube",
                    "-",
                    "4-2",
                    "6-0",
                    "6-0",
                    "4-2",
                    "6-0",
                    "6-0",
                    "6-0",
                ],
                [
                    "Frote7",
                    "2-4",
                    "-",
                    "6-0",
                    "4-2",
                    "2-4",
                    "6-0",
                    "2-4",
                    "6-0",
                ],
                [
                    "Vulcat",
                    "0-6",
                    "0-6",
                    "-",
                    "4-2",
                    "0-6",
                    "6-0",
                    "2-4",
                    "6-0",
                ],
                [
                    "HOUSEN",
                    "0-6",
                    "2-4",
                    "2-4",
                    "-",
                    "4-2",
                    "6-0",
                    "5-1",
                    "6-0",
                ],
                [
                    "Qrescent7",
                    "2-4",
                    "4-2",
                    "6-0",
                    "2-4",
                    "-",
                    "6-0",
                    "4-2",
                    "6-0",
                ],
                [
                    "DeadlyMuffin_Man",
                    "0-6",
                    "0-6",
                    "0-6",
                    "0-6",
                    "0-6",
                    "-",
                    "1-5",
                    "0-6",
                ],
                [
                    "SovietDubov",
                    "0-6",
                    "4-2",
                    "4-2",
                    "1-5",
                    "2-4",
                    "5-1",
                    "-",
                    "6-0",
                ],
                [
                    "AlexHiller",
                    "0-6",
                    "0-6",
                    "0-6",
                    "0-6",
                    "0-6",
                    "6-0",
                    "0-6",
                    "-",
                ],
            ],
            "tr",
            1,
        );
        await groupA.getByText("Show picked maps").click();
        await expectTable(
            groupA.locator("table").nth(1),
            [
                [
                    "TheTimeCube",
                    "",
                    "AMB",
                    "MUM",
                    "SF",
                    "PAR",
                    "SAP",
                    "SGA",
                    "HAV",
                ],
                ["Frote7", "PAR", "", "HAV", "SF", "COL", "SAP", "SAP", "SAP"],
                ["Vulcat", "DUB", "SF", "", "SF", "DUB", "DUB", "SF", "DUB"],
                ["HOUSEN", "MEN", "SGA", "COL", "", "MAR", "SAP", "CHO", "PAR"],
                ["Qrescent7", "COL", "MEN", "NY", "WC", "", "NY", "BER", "SGA"],
                [
                    "DeadlyMuffin_Man",
                    "BER",
                    "COL",
                    "SAP",
                    "PAR",
                    "SF",
                    "",
                    "HOK",
                    "PAR",
                ],
                ["SovietDubov", "SF", "SF", "SF", "SF", "SF", "SF", "", "SF"],
                [
                    "AlexHiller",
                    "MAR",
                    "WC",
                    "HOK",
                    "COL",
                    "SAP",
                    "NY",
                    "SF",
                    "",
                ],
            ],
            "tr",
            1,
        );

        // Group D
        const groupD = groupTables.nth(3);
        await expect(groupD.locator("h1")).toHaveText("Group D");
        await expectTable(
            groupD.locator("table").first(),
            [
                ["1", "lukedotpng", "7", "7", "0", "0", "36"],
                ["2", "Phanium", "7", "5", "0", "2", "32"],
                ["3", "ChrisX3", "7", "5", "0", "2", "26"],
                ["4", "zRune", "7", "4", "0", "3", "24"],
                ["5", "linux_penguin", "7", "4", "0", "3", "21"],
                ["6", "Some Random Person", "7", "1", "0", "6", "11"],
                ["7", "mikulers", "7", "1", "0", "6", "11"],
                ["8", "Ashton00122", "7", "1", "0", "6", "7"],
            ],
            "tr",
            1,
        );

        // Group H
        const groupH = groupTables.nth(7);
        await expect(groupH.locator("h1")).toHaveText("Group H");
        await expectTable(
            groupH.locator("table").first(),
            [
                ["1", "Music Inc", "6", "6", "0", "0", "32"],
                ["2", "Nezuko Chan", "6", "5", "0", "1", "28"],
                ["3", "Jokerj", "6", "3", "0", "3", "22"],
                ["4", "CurryMaker", "6", "3", "0", "3", "17"],
                ["5", "Rommel of the Far East", "6", "2", "0", "4", "15"],
                ["6", "ChromeX", "6", "2", "0", "4", "10"],
                ["7", "Max Masters", "6", "0", "0", "6", "2"],
                ["8", "Meekah", "0", "0", "0", "0", "0"],
            ],
            "tr",
            1,
        );
    });

    test("Spoiler settings working properly", async ({ page }) => {
        await page.goto("/");
        await page.evaluate(() => localStorage.setItem("consent", "consented"));
        await page.clock.setFixedTime(1733763600000);
        await page.goto("/tournament/RRWC2024");

        const matchesTable = page.locator("table.min-w-full");

        // Default: hide last day
        await expectTableRow(matchesTable.locator("tbody").first(), [
            "Dec 8, 2024, 7:00 PM",
            "Grand Final",
            "Scruffy",
            "",
            "Music Inc",
            ["MUM", "PAR", "MEN", "BKK"],
            "",
            "In4Fun, Joats, Cabben, DeadlyMuffin_Man, CurryMaker, OhShitMan",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(1), [
            "Dec 7, 2024, 7:00 PM",
            "3rd Place Playoff",
            "In4Fun",
            "4 - 8",
            "The Rieper 47",
            ["BER", "DAR"],
            ["DUB", "SAP", "CHO", "COL", "HOK", "AMB"],
            "Cabben, DeadlyMuffin_Man",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(2), [
            "Dec 2, 2024, 8:00 PM",
            "Semi-Finals",
            "In4Fun",
            "6 - 12",
            "Scruffy",
            ["MAR", "HAV", "NY", "PAR"],
            ["MEN", "CHO", "WC", "BER", "BKK", "HOK", "COL", "SAP", "DUB"],
            "Moo, ChrisX3",
        ]);

        // Hide last week
        await page.locator(".fa-eye-low-vision").click();
        await page.getByText("Hide last week").click();
        await expectTableRow(matchesTable.locator("tbody").first(), [
            "Dec 8, 2024, 7:00 PM",
            "Grand Final",
            "Scruffy",
            "",
            "Music Inc",
            ["MUM", "PAR", "MEN", "BKK"],
            "",
            "In4Fun, Joats, Cabben, DeadlyMuffin_Man, CurryMaker, OhShitMan",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(1), [
            "Dec 7, 2024, 7:00 PM",
            "3rd Place Playoff",
            "In4Fun",
            "",
            "The Rieper 47",
            ["BER", "DAR"],
            "",
            "Cabben, DeadlyMuffin_Man",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(3), [
            "Dec 1, 2024, 8:00 PM",
            "Semi-Finals",
            "The Rieper 47",
            "8 - 12",
            "Music Inc",
            ["DUB", "MUM", "CHO", "BKK"],
            [
                "SAP",
                "NY",
                "PAR",
                "WC",
                "MIA",
                "COL",
                "BER",
                "SGA",
                "HOK",
                "HAV",
            ],
            "OhShitMan, Joats",
        ]);

        // Hide all
        await page.locator(".fa-eye-low-vision").click();
        await page.getByText("Hide all").click();
        await expectTableRow(matchesTable.locator("tbody").first(), [
            "Dec 8, 2024, 7:00 PM",
            "Grand Final",
            "Scruffy",
            "",
            "Music Inc",
            ["MUM", "PAR", "MEN", "BKK"],
            "",
            "In4Fun, Joats, Cabben, DeadlyMuffin_Man, CurryMaker, OhShitMan",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(1), [
            "Dec 7, 2024, 7:00 PM",
            "3rd Place Playoff",
            "In4Fun",
            "",
            "The Rieper 47",
            ["BER", "DAR"],
            "",
            "Cabben, DeadlyMuffin_Man",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(3), [
            "Dec 1, 2024, 8:00 PM",
            "Semi-Finals",
            "The Rieper 47",
            "",
            "Music Inc",
            ["DUB", "MUM", "CHO", "BKK"],
            "",
            "OhShitMan, Joats",
        ]);

        // Show all
        await page.locator(".fa-eye-low-vision").click();
        await page.getByText("Show all").click();
        await expectTableRow(matchesTable.locator("tbody").first(), [
            "Dec 8, 2024, 7:00 PM",
            "Grand Final",
            "Scruffy",
            "14 - 6",
            "Music Inc",
            ["MUM", "PAR", "MEN", "BKK"],
            [
                "NY",
                "DUB",
                "BER",
                "SF",
                "CHO",
                "HAV",
                "AMB",
                "SGA",
                "SAP",
                "COL",
            ],
            "In4Fun, Joats, Cabben, DeadlyMuffin_Man, CurryMaker, OhShitMan",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(1), [
            "Dec 7, 2024, 7:00 PM",
            "3rd Place Playoff",
            "In4Fun",
            "",
            "The Rieper 47",
            ["BER", "DAR"],
            [],
            "Cabben, DeadlyMuffin_Man",
        ]);
        await expectTableRow(matchesTable.locator("tbody").nth(3), [
            "Dec 1, 2024, 8:00 PM",
            "Semi-Finals",
            "The Rieper 47",
            "8 - 12",
            "Music Inc",
            ["DUB", "MUM", "CHO", "BKK"],
            [
                "SAP",
                "NY",
                "PAR",
                "WC",
                "MIA",
                "COL",
                "BER",
                "SGA",
                "HOK",
                "HAV",
            ],
            "OhShitMan, Joats",
        ]);
    });
});
