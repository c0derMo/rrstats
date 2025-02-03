import { expect, type Locator } from "@playwright/test";
import ld from "lodash";

export async function expectTableRow(
    locator: Locator,
    row: (string | string[] | null)[],
) {
    for (const idx in row) {
        const td = locator.locator("td").nth(parseInt(idx));
        if (row[idx] == null) {
            continue;
        } else if (ld.isArray(row[idx])) {
            for (const part of row[idx]!) {
                await expect(td).toContainText(part);
            }
        } else {
            await expect(td).toContainText(row[idx]!);
        }
    }
}

export async function expectTable(
    locator: Locator,
    rows: (string | string[] | null)[][],
    rowElement = "tbody",
    rowOffset = 0,
) {
    for (const idx in rows) {
        const tbody = locator
            .locator(rowElement)
            .nth(parseInt(idx) + rowOffset);
        await expectTableRow(tbody, rows[idx]);
    }
}
