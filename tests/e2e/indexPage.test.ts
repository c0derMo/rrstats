import test, { expect } from "@playwright/test";

test.describe("Index Page", () => {
    test("Correct stats on front page", async ({ page }) => {
        await page.goto("/");

        expect(await page.content()).toContain(
            "Currently storing 2411 matches of 20 RR tournaments with 237 players!",
        );
    });
});
