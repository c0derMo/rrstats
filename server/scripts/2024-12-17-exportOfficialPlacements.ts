import { Player } from "../model/Player";
import { DataSource } from "typeorm";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { Competition, CompetitionPlacement } from "../model/Competition";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Competition, CompetitionPlacement, Player],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);
    const competitions = await Competition.find({
        where: { officialCompetition: true },
        order: { startingTimestamp: "ASC" },
    });
    console.log(`Loaded ${competitions.length} competitions.`);
    const placements = await CompetitionPlacement.find();
    console.log(`Loaded ${placements.length} placements.`);

    const playersPlacements: Record<
        string,
        Record<string, number | string>
    > = {};
    for (const placement of placements) {
        if (playersPlacements[placement.player] == null) {
            playersPlacements[placement.player] = {};
        }
        playersPlacements[placement.player][placement.competition] =
            placement.placement ?? "GS";
    }

    const rows: unknown[][] = [];
    for (const player of players) {
        const row: unknown[] = [player.primaryName];
        for (const comp of competitions) {
            if (playersPlacements[player.uuid] == null) {
                continue;
            }
            const placement = playersPlacements[player.uuid][comp.tag];
            if (placement != null) {
                row.push(placement);
            } else {
                row.push("");
            }
        }
        rows.push(row);
    }

    const headers = ["PLAYER"];
    for (const comp of competitions) {
        headers.push(comp.tag.toUpperCase());
    }

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile("./Placements.csv", output, "utf-8");
}

void main();
