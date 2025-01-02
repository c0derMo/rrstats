import { test, expect } from "@playwright/test";
import { expectTableRow } from "./testUtils";

test.describe("Compare Page", () => {
    test("Correctly loading players when entering usernames", async ({
        page,
    }) => {
        await page.goto("/compare");

        await page.locator("input[type='text']").first().fill("In4Fun");
        await page.locator("input[type='text']").first().press("Enter");

        await expect(page.getByText("In4Fun")).toBeVisible();
        await expect(page).toHaveURL(/.*\/compare\?leftPlayer=In4Fun/);

        await page.locator("input[type='text']").last().fill("CurryMaker");
        await page.locator("input[type='text']").last().press("Enter");

        await expect(page.getByText("CurryMaker")).toBeVisible();
        await expect(page).toHaveURL(
            /.*\/compare\?leftPlayer=In4Fun&rightPlayer=CurryMaker/,
        );
    });

    test("Correctly loading players when using url parameters", async ({
        page,
    }) => {
        await page.goto("/compare?leftPlayer=Frote7&rightPlayer=Yannini");
        await expect(page.getByText("Frote7")).toBeVisible();
        await expect(page.getByText("Yannini")).toBeVisible();
    });

    test("Correct stats top part", async ({ page }) => {
        await page.goto("/compare?leftPlayer=CurryMaker&rightPlayer=In4Fun");

        const leftPlayerStats = page
            .locator(".p-5")
            .first()
            .locator("div > div.text-2xl");
        const rightPlayerStats = page
            .locator(".p-5")
            .nth(1)
            .locator("div > div.text-2xl");

        await expect(leftPlayerStats).toContainText("Winrate43%");
        await expect(leftPlayerStats).toContainText("Map-Winrate46%");
        await expect(leftPlayerStats).toContainText("Matches played60");
        await expect(leftPlayerStats).toContainText("Maps played194");
        await expect(leftPlayerStats).toContainText("W-T-L25-1-34");
        await expect(leftPlayerStats).toContainText("Head-2-Head0-0-1");
        await expect(leftPlayerStats).toContainText("RRs played13");
        await expect(leftPlayerStats).toContainText("RRs won0");
        await expect(leftPlayerStats).toContainText("Best RR placement9");
        await expect(leftPlayerStats).toContainText("Average RR placement19");

        await expect(rightPlayerStats).toContainText("Winrate78%");
        await expect(rightPlayerStats).toContainText("Map-Winrate68%");
        await expect(rightPlayerStats).toContainText("Matches played124");
        await expect(rightPlayerStats).toContainText("Maps played444");
        await expect(rightPlayerStats).toContainText("W-T-L96-1-27");
        await expect(rightPlayerStats).toContainText("Head-2-Head1-0-0");
        await expect(rightPlayerStats).toContainText("RRs played15");
        await expect(rightPlayerStats).toContainText("RRs won2");
        await expect(rightPlayerStats).toContainText("Best RR placement1");
        await expect(rightPlayerStats).toContainText("Average RR placement5");

        await expect(leftPlayerStats.getByText("43%")).toHaveCSS(
            "color",
            "rgb(239, 68, 68)",
        );
        await expect(rightPlayerStats.getByText("78%")).toHaveCSS(
            "color",
            "rgb(34, 197, 94)",
        );
    });

    test("Correct map stats", async ({ page }) => {
        await page.goto("/compare?leftPlayer=CurryMaker&rightPlayer=In4Fun");

        const leftPlayerTable = page.locator(".p-5").nth(2).locator("table");
        const rightPlayerTable = page.locator(".p-5").nth(3).locator("table");

        await expectTableRow(leftPlayerTable.locator("tbody").first(), [
            "Paris",
            "3",
            "1",
            "11",
            "6",
            "55%",
        ]);
        await expectTableRow(rightPlayerTable.locator("tbody").first(), [
            "Paris",
            "5",
            "6",
            "24",
            "13.5",
            "56%",
        ]);

        await page.getByText("Season 2").click();

        await expectTableRow(leftPlayerTable.locator("tbody").first(), [
            "Miami",
            "1",
            "0",
            "8",
            "4.5",
            "56%",
        ]);
        await expectTableRow(rightPlayerTable.locator("tbody").first(), [
            "Miami",
            "11",
            "4",
            "30",
            "18",
            "60%",
        ]);

        await page.getByText("Season 3").click();

        await expectTableRow(leftPlayerTable.locator("tbody").first(), [
            "Dubai",
            "3",
            "1",
            "12",
            "8",
            "67%",
        ]);
        await expectTableRow(rightPlayerTable.locator("tbody").first(), [
            "Dubai",
            "5",
            "6",
            "24",
            "18",
            "75%",
        ]);

        await expect(leftPlayerTable.getByText("3", { exact: true })).toHaveCSS(
            "color",
            "rgb(239, 68, 68)",
        );
        await expect(
            rightPlayerTable.getByText("5", { exact: true }),
        ).toHaveCSS("color", "rgb(34, 197, 94)");
    });
});
