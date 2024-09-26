import { Player } from "../model/Player";
import { DataSource, In, Not } from "typeorm";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { Match } from "../model/Match";
import { PlayerElo } from "../controller/leaderboardStatistics/player/Elo";
import MapperService from "../controller/MapperService";
import { PlayedMap } from "../model/PlayedMap";

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
    const competition = await Competition.find({
        where: { tag: Not(In(ignoredComps)), officialCompetition: true },
        order: { startingTimestamp: "DESC" },
    });
    console.log(`Loaded ${competition.length} competitions.`);
    const placements = await CompetitionPlacement.find({
        where: { competition: In(competition.map((c) => c.tag)) },
    });
    console.log(`Loaded ${placements.length} placements.`);
    const matches = await Match.find({
        where: { competition: Not(In(ignoredComps)) },
        order: { timestamp: "ASC" },
    });
    console.log(`Loaded ${matches.length} matches.`);
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    const eloStats = new PlayerElo().calculate(
        players,
        matches,
        placements,
        competition,
    );

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
