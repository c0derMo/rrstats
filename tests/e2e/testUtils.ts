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

export async function expectSpreadsheetRow(
    locator: Locator,
    row: (string | string[] | null)[],
    index: number,
) {
    for (let i = 0; i < row.length; i++) {
        const td = locator.locator(".cell").nth(row.length * index + i);
        if (row[i] == null) {
            continue;
        } else if (ld.isArray(row[i])) {
            for (const part of row[i]!) {
                await expect(td).toContainText(part);
            }
        } else {
            await expect(td).toContainText(row[i]!);
        }
    }
}
