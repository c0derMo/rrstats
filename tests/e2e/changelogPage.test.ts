import { test, expect } from "@playwright/test";

test.describe("Changelog Page", () => {
    test("Titles displayed", async ({ page }) => {
        await page.goto("/changelog");

        expect(await page.locator("h1").textContent()).toContain("Changelog");
        expect(await page.locator(".text-2xl").allTextContents()).toContain(
            "Version 3.4",
        );
        expect(await page.locator(".text-3xl").allTextContents()).toContain(
            "The Achievement Update",
        );
    });
});
