import { test, expect } from "@playwright/test";

test.describe("Achievement Page", () => {
    test("Correct top achievement stats", async ({ page }) => {
        await page.goto("/achievements");

        expect(await page.content()).toContain("Roulette Player");

        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 1: 100.00%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 2: 70.83%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 3: 52.08%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 4: 26.25%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 5: 12.92%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 6: 5.83%");
        expect(
            await page
                .locator(":right-of(#roulette_player)")
                .first()
                .textContent(),
        ).toContain("Level 7: 3.33%");
    });

    test("Bar attributes top achievement", async ({ page }) => {
        await page.goto("/achievements");

        const roulettePlayerBars = page
            .locator(":right-of(#roulette_player)")
            .first();
        await expect(roulettePlayerBars.locator("div").nth(0)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(1)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(2)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(3)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(4)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(5)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(roulettePlayerBars.locator("div").nth(6)).toHaveCSS(
            "color",
            "rgba(0, 0, 0, 0)",
        );

        await expect(roulettePlayerBars.locator("div").nth(0)).toHaveCSS(
            "width",
            "25.0156px",
        );
        await expect(roulettePlayerBars.locator("div").nth(1)).toHaveCSS(
            "width",
            "43.7812px",
        );
        await expect(roulettePlayerBars.locator("div").nth(2)).toHaveCSS(
            "width",
            "96.9531px",
        );
        await expect(roulettePlayerBars.locator("div").nth(3)).toHaveCSS(
            "width",
            "197.031px",
        );
        await expect(roulettePlayerBars.locator("div").nth(4)).toHaveCSS(
            "width",
            "390.953px",
        );
        await expect(roulettePlayerBars.locator("div").nth(5)).toHaveCSS(
            "width",
            "531.703px",
        );
        await expect(roulettePlayerBars.locator("div").nth(6)).toHaveCSS(
            "width",
            "750.641px",
        );

        await expect(roulettePlayerBars.locator("div").nth(0)).toHaveCSS(
            "background-color",
            "rgb(116, 178, 170)",
        );
        await expect(roulettePlayerBars.locator("div").nth(1)).toHaveCSS(
            "background-color",
            "rgb(128, 190, 182)",
        );
        await expect(roulettePlayerBars.locator("div").nth(2)).toHaveCSS(
            "background-color",
            "rgb(207, 179, 108)",
        );
        await expect(roulettePlayerBars.locator("div").nth(3)).toHaveCSS(
            "background-color",
            "rgb(219, 191, 120)",
        );
        await expect(roulettePlayerBars.locator("div").nth(4)).toHaveCSS(
            "background-color",
            "rgb(184, 184, 184)",
        );
        await expect(roulettePlayerBars.locator("div").nth(5)).toHaveCSS(
            "background-color",
            "rgb(243, 195, 189)",
        );
        await expect(roulettePlayerBars.locator("div").nth(6)).toHaveCSS(
            "background-color",
            "rgb(255, 207, 201)",
        );

        const lastElement = roulettePlayerBars.locator("div").nth(6);
        const boundingBox = await lastElement.boundingBox();
        expect(boundingBox).not.toBe(null);
        await lastElement.hover({
            position: {
                x: boundingBox!.width - 5,
                y: boundingBox!.height / 2,
            },
        });
        await expect(roulettePlayerBars.locator("div").nth(6)).toHaveCSS(
            "color",
            "rgb(0, 0, 0)",
        );
    });

    test("Hovering achievement name", async ({ page }) => {
        await page.goto("/achievements");

        const roulettePlayer = page.locator("#roulette_player");
        await expect(roulettePlayer.getByText("Play a match")).toHaveCSS(
            "opacity",
            "0",
        );
        await roulettePlayer.hover();
        await expect(roulettePlayer.getByText("Play a match")).toHaveCSS(
            "opacity",
            "1",
        );
    });
});
