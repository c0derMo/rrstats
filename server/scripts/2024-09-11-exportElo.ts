import { Player } from "../model/Player";
import { DataSource, In, Not } from "typeorm";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { Match } from "../model/Match";
import { PlayerElo } from "../controller/leaderboardStatistics/player/Elo";
import MapperService from "../controller/MapperService";
import { PlayedMap } from "../model/PlayedMap";
import EloController from "../controller/EloController";

const ignoredComps: string[] = ["RR14"];

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [CompetitionPlacement, Player, Competition, Match, PlayedMap],
    });

    await dataSource.initialize();
    console.log("Database connection established.");
    
    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);

    await EloController.getInstance().recalculateAllElos();
    console.log(`Recalculated all elo.`);

    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    const eloStats = await new PlayerElo().calculate();

    eloStats.sort((a, b) => a.sortingScore - b.sortingScore);

    const rows = eloStats.map((p) => {
        return {
            player: playerLookupMap[p.player],
            elo: p.sortingScore,
        };
    });

    const headers = [
        { key: "player", header: "PLAYER" },
        { key: "elo", header: "ELO" },
    ];

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile("./elo.csv", output, "utf-8");
}

void main();
