import { test, expect } from "@playwright/test";

test.describe("Index Page", () => {
    test("Correct stats on front page", async ({ page }) => {
        await page.goto("/");

        expect(await page.content()).toContain(
            "Currently storing 2411 matches of 20 RR tournaments with 237 players!",
        );
    });

    test("Autocomplete correctly working", async ({ page }) => {
        await page.goto("/");
        const autocompleteInput = page.locator("input[type='text']");

        await expect(page.getByText("CurryMaker")).not.toBeVisible();

        await autocompleteInput.fill("Curry");
        await expect(page.getByText("CurryMaker")).toBeVisible();

        await autocompleteInput.fill("<roulette_");
        await expect(page.getByText("CurryMaker")).not.toBeVisible();
        await expect(page.getByText("<roulette_player>")).not.toBeVisible();

        await autocompleteInput.fill("Scruff");
        await expect(page.getByText("Scruffy")).toBeVisible();
    });

    test("Direct links on main page", async ({ page }) => {
        await page.goto("/");
        await page.getByText("Compare").click();
        await expect(page).toHaveURL(/.*\/compare/);

        await page.goto("/");
        await page.getByText("Records").click();
        await expect(page).toHaveURL(/.*\/records/);

        await page.goto("/");
        await page.getByText("Leaderboards").click();
        await page.getByText("Players", { exact: true }).click();
        await expect(page).toHaveURL(/.*\/leaderboards/);

        await page.goto("/");
        await page.getByText("Leaderboards").click();
        await page.getByText("Countries").click();
        await expect(page).toHaveURL(/.*\/leaderboards/);

        await page.goto("/");
        await page.getByText("Leaderboards").click();
        await page.getByText("Maps", { exact: true }).click();
        await expect(page).toHaveURL(/.*\/leaderboards/);

        await page.goto("/");
        await page.getByText("Leaderboards").click();
        await page.getByText("Achievements").click();
        await expect(page).toHaveURL(/.*\/achievements/);

        await page.goto("/");
        await page.getByText("Spins").click();
        await expect(page).toHaveURL(/.*\/spins/);

        await page.goto("/");
        await page.getByText("Changelog").click();
        await expect(page).toHaveURL(/.*\/changelog/);
    });

    test("Tournament dropdown on main page", async ({ page }) => {
        await page.goto("/");

        await expect(page.getByText("RRWC2024")).not.toBeVisible();
        await expect(page.getByText("RR13")).not.toBeVisible();
        await expect(page.getByText("RRWC", { exact: true })).not.toBeVisible();
        await expect(page.getByText("RR8")).not.toBeVisible();
        await expect(page.getByText("RR1", { exact: true })).not.toBeVisible();

        await page.getByText("Tournaments", { exact: true }).click();

        await expect(page.getByText("RRWC2024")).toBeVisible();
        await expect(page.getByText("RR13")).toBeVisible();
        await expect(page.getByText("RRWC", { exact: true })).toBeVisible();
        await expect(page.getByText("RR8")).toBeVisible();
        await expect(page.getByText("RR1", { exact: true })).toBeVisible();

        await page.getByText("RRWC2024").click();
        await expect(page).toHaveURL(/.*\/matches\?tournament=RRWC2024/);
    });

    test("Accessing player pages", async ({ page }) => {
        await page.goto("/");
        const autocompleteInput = page.locator("input[type='text']");

        await autocompleteInput.fill("Curry");
        await autocompleteInput.press("Enter");
        await expect(page).toHaveURL(/.*\/CurryMaker/);

        await page.goto("/");
        await autocompleteInput.fill("In4Fun");
        await autocompleteInput.press("Enter");
        await expect(page).toHaveURL(/.*\/In4Fun/);
    });
});
