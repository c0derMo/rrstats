import { test, expect } from "@playwright/test";
import { expectTable, expectTableRow } from "./testUtils";

test.describe("Records Page", () => {
    test("Generic record table", async ({ page }) => {
        await page.goto("/records");

        const genericTable = page.locator("table").nth(0);

        await expectTableRow(genericTable.locator("tbody").nth(0), [
            "Shortest match with 2+ maps",
            ["Whittleton Creek (04:05)", "Dartmoor (02:03)"],
            "06:08",
            "Phanium, Jokerj",
            "RR9 Round 2",
        ]);
        await expect(genericTable.getByText("Jokerj").first()).toHaveCSS(
            "text-decoration-line",
            "underline",
        );
        await expectTableRow(genericTable.locator("tbody").nth(2), [
            "Shortest match with 4+ maps",
            [
                "Dubai (02:55)",
                "Mendoza (05:18)",
                "Sapienza (07:23)",
                "Dartmoor (01:50)",
            ],
            "17:26",
            "Sparkles, Gorg",
            "RR13 LB Round 4",
        ]);
        await expect(genericTable.getByText("Sparkles")).toHaveCSS(
            "text-decoration-line",
            "underline",
        );
        await expectTableRow(genericTable.locator("tbody").nth(5), [
            "Shortest decider",
            "Dubai (02:29)",
            "02:29",
            "linux_penguin, Ducker",
            "RR13 Round 1",
        ]);
        await expect(genericTable.getByText("linux_penguin")).toHaveCSS(
            "text-decoration-line",
            "underline",
        );
    });

    test("Map record table", async ({ page }) => {
        await page.goto("/records");

        const genericTable = page.locator("table").nth(1);

        const parisSpin =
            "Viktor Novikov: Falling Object as Palace Staff Dalia Margolis: Explosion (Accident) as CICADA Bodyguard";
        await expectTableRow(genericTable.locator("tbody").nth(0), [
            "Paris",
            parisSpin,
            "01:36",
            "Scruffy",
            "RR14 Grand Final vs The Rieper 47",
        ]);
        await expectTableRow(genericTable.locator("tbody").nth(12), [
            "New York",
            "Athena Savalas: Kitchen Knife as High Security Guard",
            "01:53",
            "Scruffy",
            "RR13 Grand Final vs In4Fun",
        ]);
        await expectTableRow(genericTable.locator("tbody").nth(15), [
            "Dartmoor",
            "Alexa Carlisle: Electrocution as Private Investigator",
            "01:23",
            "Phanium",
            "RR14 LB Round 7 vs Frote7",
        ]);
        await expectTableRow(genericTable.locator("tbody").nth(16), [
            "Dartmoor",
            "Alexa Carlisle: Electrocution as Private Investigator",
            "01:23",
            "Jokerj",
            "RRWC2024 Group H vs CurryMaker",
        ]);
    });

    test("Retired records table", async ({ page }) => {
        await page.goto("/records");

        const genericTable = page.locator("table").nth(2);

        await expectTable(genericTable, [
            [
                "Longest regular match",
                [
                    "Mumbai (46:18)",
                    "Whittleton Creek (12:01)",
                    "Berlin (47:00)",
                    "Colorado (01:00:00)",
                    "Dubai (24:56)",
                ],
                "03:10:15",
                "Max Masters, OhShitMan",
                "RR7 Round 1",
            ],
            [
                "Longest decider",
                "Colorado (02:02:24)",
                "02:02:24",
                "The_Buff_Guy, SovietDubov",
                "RR6 Round 2",
            ],
        ]);

        await expect(genericTable.getByText("OhShitMan")).toHaveCSS(
            "text-decoration-line",
            "underline",
        );
        await expect(genericTable.getByText("The_Buff_Guy")).toHaveCSS(
            "text-decoration-line",
            "underline",
        );
    });
});
