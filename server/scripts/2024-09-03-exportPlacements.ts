import { Player } from "../model/Player";
import { DataSource } from "typeorm";
import MapperService from "../controller/MapperService";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { CompetitionPlacement } from "../model/Competition";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [CompetitionPlacement, Player],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);
    const placements = await CompetitionPlacement.find();
    console.log(`Loaded ${placements.length} placements.`);
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    const rows: Record<string, unknown>[] = [];
    for (const placement of placements) {
        rows.push({
            competition: placement.competition,
            player: playerLookupMap[placement.player],
            placement: placement.placement ?? "GS",
        });
    }

    const headers = [
        { key: "competition", header: "COMP" },
        { key: "player", header: "PLAYER" },
        { key: "placement", header: "PLACEMENT" },
    ];

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile("./Placements.csv", output, "utf-8");
}

void main();
