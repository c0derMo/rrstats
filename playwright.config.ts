import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    forbidOnly: !!process.env.CI,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
    },
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "node .output/server/index.mjs",
        env: {
            NUXT_DATABASE: "./tests/test_db_post_2024.db",
            NUXT_ENABLE_FUNCTION_TIMINGS: "false",
            NUXT_ENABLE_ROUTE_TIMINGS: "false",
        },
        reuseExistingServer: !process.env.CI,
        url: "http://localhost:3000",
    },
});
