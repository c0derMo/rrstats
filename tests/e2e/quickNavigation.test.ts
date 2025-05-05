import { test, expect, type Page, type Locator } from "@playwright/test";

function getRecommendation(page: Page, type: string, value: string): Locator {
    return page
        .locator(".fixed .relative .cursor-pointer")
        .filter({ has: page.getByText(type, { exact: true }) })
        .filter({ has: page.getByText(value, { exact: true }) });
}

test.describe("Quick Navigation", () => {
    test("Quick Navigation show/hide via hotkey", async ({ page }) => {
        await page.goto("/CurryMaker");

        await expect(page.getByText("Quick Navigation")).not.toBeVisible();

        await page.keyboard.press("Control+k");

        await expect(page.getByText("Quick Navigation")).toBeVisible();

        await page.locator(".fixed .relative .relative > input").click();
        await page.keyboard.press("Escape");

        await expect(page.getByText("Quick Navigation")).not.toBeVisible();
    });

    test("Quick Navigation show/hide via buttons", async ({ page }) => {
        await page.goto("/CurryMaker");

        await expect(page.getByText("Quick Navigation")).not.toBeVisible();

        await page.locator(".fa-bolt").click();

        await expect(page.getByText("Quick Navigation")).toBeVisible();

        await page.mouse.click(10, 10);

        await expect(page.getByText("Quick Navigation")).not.toBeVisible();
    });

    test("Player page recommendations", async ({ page }) => {
        await page.goto("/CurryMaker");

        await page.keyboard.press("Control+k");
        const inputField = page.locator(".fixed .relative .relative > input");

        await expect(page.getByText("Start typing!")).toBeVisible();

        await inputField.fill("In4");
        await expect(getRecommendation(page, "Player", "In4Fun")).toBeVisible();
        await expect(
            getRecommendation(page, "Compare to", "In4Fun"),
        ).toBeVisible();

        await inputField.fill("Play");
        await expect(
            getRecommendation(page, "Map Leaderboard", "Played"),
        ).toBeVisible();
        await expect(
            getRecommendation(
                page,
                "Country Leaderboard",
                "Players per country",
            ),
        ).toBeVisible();
        await expect(
            getRecommendation(page, "Player Leaderboard", "Maps played"),
        ).toBeVisible();

        await inputField.fill("Paris");
        await expect(getRecommendation(page, "Spins", "Paris")).toBeVisible();
        await expect(getRecommendation(page, "Records", "Paris")).toBeVisible();

        await inputField.fill("SF");
        await expect(getRecommendation(page, "Spins", "SF")).toBeVisible();
        await expect(getRecommendation(page, "Records", "SF")).toBeVisible();

        await inputField.fill("RR");
        await expect(
            getRecommendation(page, "Competition", "RRWC2024"),
        ).toBeVisible();
    });

    test("Record page recommendations", async ({ page }) => {
        await page.goto("/records");

        await page.keyboard.press("Control+k");
        const inputField = page.locator(".fixed .relative .relative > input");

        await expect(page.getByText("Start typing!")).toBeVisible();

        await inputField.fill("In4");
        await expect(getRecommendation(page, "Player", "In4Fun")).toBeVisible();
        await expect(
            getRecommendation(page, "Compare to", "In4Fun"),
        ).not.toBeVisible();

        await inputField.fill("Play");
        await expect(
            getRecommendation(page, "Map Leaderboard", "Played"),
        ).toBeVisible();
        await expect(
            getRecommendation(
                page,
                "Country Leaderboard",
                "Players per country",
            ),
        ).toBeVisible();
        await expect(
            getRecommendation(page, "Player Leaderboard", "Maps played"),
        ).toBeVisible();

        await inputField.fill("Paris");
        await expect(getRecommendation(page, "Spins", "Paris")).toBeVisible();
        await expect(getRecommendation(page, "Records", "Paris")).toBeVisible();

        await inputField.fill("SF");
        await expect(getRecommendation(page, "Spins", "SF")).toBeVisible();
        await expect(getRecommendation(page, "Records", "SF")).toBeVisible();

        await inputField.fill("RR");
        await expect(
            getRecommendation(page, "Competition", "RRWC2024"),
        ).toBeVisible();
    });

    test("Working links", async ({ page }) => {
        await page.goto("/CurryMaker");

        await page.locator(".fa-bolt").click();
        const inputField = page.locator(".fixed .relative .relative > input");

        await inputField.fill("Play");
        await inputField.press("Enter");
        await expect(page).toHaveURL(/.*\/leaderboards#map.Played/);
        await expect(
            page.locator(".text-center.font-bold.text-2xl", {
                hasText: "Played",
            }),
        ).toBeVisible();

        await page.locator(".fa-bolt").click();
        await inputField.fill("Paris");
        await getRecommendation(page, "Spins", "Paris").click();
        await expect(page).toHaveURL(/.*\/spins/);
        await expect(
            page
                .locator(
                    ".relative.w-full > .p-2 > .text-nowrap.flex.flex-nowrap.min-h-6 > .flex-grow",
                )
                .filter({ hasText: "Paris" }),
        ).toBeVisible();

        await page.locator(".fa-bolt").click();
        await inputField.fill("HAV");
        await getRecommendation(page, "Records", "HAV").click();
        await expect(page).toHaveURL(/.*\/records/);
        await expect(page.locator("#haven_island")).toBeInViewport({
            ratio: 1,
        });

        await page.locator(".fa-bolt").click();
        await inputField.fill("RRWC");
        await inputField.press("Enter");
        await expect(page).toHaveURL(/.*\/matches\?tournament=RRWC/);

        await page.locator(".fa-bolt").click();
        await inputField.fill("In4");
        await inputField.press("Enter");
        await expect(page).toHaveURL(/.*\/In4Fun/);

        await page.locator(".fa-bolt").click();
        await inputField.fill("Curry");
        await inputField.press("ArrowDown");
        await inputField.press("Enter");
        await expect(page).toHaveURL(
            /.*\/compare\?leftPlayer=In4Fun&rightPlayer=Curry/,
        );
    });
});
