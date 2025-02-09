import { test, expect, type Locator } from "@playwright/test";
import { expectTableRow } from "./testUtils";

function locateStat(root: Locator, statName: string, elementType = "span") {
    const statNameLocator = root.getByText(statName);
    const followingSibling = statNameLocator.locator(
        `//following-sibling::${elementType}`,
    );
    return followingSibling.first();
}

test.describe("Spin Page", () => {
    test("Correct spins without map filter", async ({ page }) => {
        await page.goto("/spins");

        const table = page.locator("table");

        await expectTableRow(table.locator("tbody").nth(0), [
            "Dec 8, 2024, 7:00 PM",
            "New York",
            "Athena Savalas: Tanto as Job Applicant (No Target Pacification)",
            "02:38",
            "Scruffy vs Music Inc",
            "RRWC2024 Grand Final",
        ]);
        await expect(
            table.locator("tbody").nth(0).getByText("Scruffy"),
        ).toHaveCSS("color", "rgb(22, 163, 74)");
        await expectTableRow(table.locator("tbody").nth(4), [
            "Dec 8, 2024, 7:00 PM",
            "Chongqing",
            "Hush: Neck Snap as Facility Guard Imogen Royce: Cleaver as The Board Member",
            "03:24",
            "Music Inc vs Scruffy",
            "RRWC2024 Grand Final",
        ]);
        await expect(
            table.locator("tbody").nth(4).getByText("Music Inc"),
        ).toHaveCSS("color", "rgb(22, 163, 74)");
    });

    test("Correct statistics without map filter", async ({ page }) => {
        await page.goto("/spins");

        await page.getByText("Statistics").click();

        await expect(page.locator(".mb-10 > span").first()).toHaveText(
            "Estimated percentage of spins completed",
        );
        await expect(page.locator(".mb-10 > span").last()).toHaveText(
            "unknown",
        );

        const statsPanel = page.locator(".grid");

        await expect(locateStat(statsPanel, "Spins completed:")).toHaveText(
            "7328",
        );
        await expect(
            locateStat(statsPanel, "Unique spins completed:"),
        ).toHaveText("7111");
        await expect(
            locateStat(statsPanel, "Estimated total spins possible:"),
        ).toHaveText("unknown");

        const mostRepeatedSpin = locateStat(
            statsPanel,
            "Most repeated spin:",
            "div",
        );
        await expect(mostRepeatedSpin.locator("span").first()).toHaveText("6x");
        await expect(mostRepeatedSpin.locator(".mb-2 > span")).toHaveText(
            "Dartmoor",
        );
        await expect(mostRepeatedSpin.locator(".mb-2 li").first()).toHaveText(
            "Alexa Carlisle: Injected Poison as Lawyer",
        );
        await expect(mostRepeatedSpin.locator("div:not(.mb-2)")).toHaveText([
            "TheTimeCube and Ashton00122 in RR11 LB Round 3",
            "Jokerj and Nezuko Chan in RRWC2024 Group H",
            "<roulette_player> and SxyTimbyy in RR4 LB Round 1",
            "davidredsox and gekko in RRWC2024 Group G",
            "The_Buff_Guy and Redfox in RRWC2021 Group F",
            "Meme Junkie and Yannini in RR4 LB Round 5",
        ]);

        await expect(locateStat(statsPanel, "Average spin time:")).toHaveText(
            "12:15",
        );
        await expect(
            locateStat(statsPanel, "Average spin time in the last year:"),
        ).toHaveText("09:34");

        const quickestSpin = locateStat(statsPanel, "Quickest spin:");
        await expect(quickestSpin.locator("div > .font-bold")).toHaveText(
            "Dubai",
        );
        await expect(quickestSpin.locator("div li").first()).toHaveText(
            "Carl Ingram: Silenced Pistol as Penthouse Guard",
        );
        await expect(quickestSpin.locator("div li").nth(1)).toHaveText(
            "Marcus Stuyvesant: Neck Snap as Ingram's Bodyguard",
        );
        await expect(quickestSpin).toContainText(
            "in 01:15 by Scruffy (RRWC2024 Round 2 vs ChannelJoined)",
        );

        const slowestSpin = locateStat(statsPanel, "Slowest spin:");
        await expect(slowestSpin.locator("div > .font-bold")).toHaveText(
            "Colorado",
        );
        await expect(slowestSpin.locator("div li").first()).toHaveText(
            "Sean Rose: Old Axe as Militia Cook",
        );
        await expect(slowestSpin.locator("div li").nth(1)).toHaveText(
            "Penelope Graves: Pistol as Scarecrow",
        );
        await expect(slowestSpin.locator("div li").nth(2)).toHaveText(
            "Ezra Berg: Fiber Wire as Militia Spec Ops",
        );
        await expect(slowestSpin.locator("div li").nth(3)).toHaveText(
            "Maya Parvati: Screwdriver as Explosives Specialist",
        );
        await expect(slowestSpin).toContainText(
            "in 122:24 by The_Buff_Guy (RR6 Round 2 vs SovietDubov)",
        );
    });

    test("Correct spins on New York", async ({ page }) => {
        await page.goto("/spins");

        const dropdown = page.locator("div.w-fit.w-full > .relative");
        await dropdown.getByText("-- all maps --").click();
        await dropdown.getByText("New York").click();

        const table = page.locator("table");

        await expectTableRow(table.locator("tbody").nth(0), [
            "Dec 8, 2024, 7:00 PM",
            "New York",
            "Athena Savalas: Tanto as Job Applicant (No Target Pacification)",
            "02:38",
            "Scruffy vs Music Inc",
            "RRWC2024 Grand Final",
        ]);
        await expect(
            table.locator("tbody").nth(0).getByText("Scruffy"),
        ).toHaveCSS("color", "rgb(22, 163, 74)");
        await expectTableRow(table.locator("tbody").nth(5), [
            "Nov 14, 2024, 8:00 PM",
            "New York",
            "Athena Savalas: Shotgun as High Security Guard (No Target Pacification)",
            "02:22",
            "Draw (TheTimeCube, CurryMaker)",
            "RRWC2024 Round 1",
        ]);
        await expect(
            table
                .locator("tbody")
                .nth(5)
                .getByText("Draw (TheTimeCube, CurryMaker)"),
        ).toHaveCSS("font-style", "italic");
    });

    test("Correct statistics on New York", async ({ page }) => {
        await page.goto("/spins");

        const dropdown = page.locator("div.w-fit.w-full > .relative");
        await dropdown.getByText("-- all maps --").click();
        await dropdown.getByText("New York").click();

        await page.getByText("Statistics").click();

        await expect(page.locator(".mb-10 > span").first()).toHaveText(
            "Estimated percentage of spins completed",
        );
        await expect(page.locator(".mb-10 > span").last()).toHaveText(
            "32.5641%",
        );

        const statsPanel = page.locator(".grid");

        await expect(locateStat(statsPanel, "Spins completed:")).toHaveText(
            "371",
        );
        await expect(
            locateStat(statsPanel, "Unique spins completed:"),
        ).toHaveText("254");
        await expect(
            locateStat(statsPanel, "Estimated total spins possible:", "div")
                .locator("span")
                .first(),
        ).toHaveText("780");

        await expect(
            locateStat(statsPanel, "Most repeated spin:", "div"),
        ).toHaveText("4x (4 spins)");

        await expect(locateStat(statsPanel, "Average spin time:")).toHaveText(
            "06:25",
        );
        await expect(
            locateStat(statsPanel, "Average spin time in the last year:"),
        ).toHaveText("04:28");

        const quickestSpin = locateStat(statsPanel, "Quickest spin:");
        await expect(quickestSpin.locator("div > .font-bold")).toHaveText(
            "New York",
        );
        await expect(quickestSpin.locator("div li").first()).toHaveText(
            "Athena Savalas: Kitchen Knife as High Security Guard",
        );
        await expect(quickestSpin).toContainText(
            "in 01:53 by Scruffy (RR13 Grand Final vs In4Fun)",
        );

        const slowestSpin = locateStat(statsPanel, "Slowest spin:");
        await expect(slowestSpin.locator("div > .font-bold")).toHaveText(
            "New York",
        );
        await expect(slowestSpin.locator("div li").first()).toHaveText(
            "Athena Savalas: Fiber Wire as Suit",
        );
        await expect(slowestSpin).toContainText(
            "in 45:43 by BigDave (RR2 Round 1 vs Karma)",
        );
    });
});
