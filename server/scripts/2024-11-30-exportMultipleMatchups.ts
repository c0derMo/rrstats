import { DataSource, In } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";
import { Player } from "../model/Player";
import { Competition, CompetitionPlacement } from "../model/Competition";
import MapperService from "../controller/MapperService";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, PlayedMap, Player, Competition, CompetitionPlacement],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        where: {
            competition: In(["RR13", "RR14", "RR15", "RRWC2024"]),
        },
        select: ["playerOne", "playerTwo", "uuid"],
    });
    console.log(`Loaded ${matches.length} matches.`);

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);

    const playerLookup = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );
    const multiMatchups: DefaultedMap<string, number> = new DefaultedMap(
        () => 0,
    );

    for (const match of matches) {
        const pl = [
            playerLookup[match.playerOne],
            playerLookup[match.playerTwo],
        ].sort((a, b) => a.localeCompare(b));
        const pls = JSON.stringify(pl);
        if (pl.includes("In4Fun")) {
            console.log(pl);
        }
        multiMatchups.set(pls, multiMatchups.get(pls) + 1);
    }

    const map = multiMatchups.getAll();
    for (const players of map.keys()) {
        if (map.get(players)! > 1) {
            console.log(`${players} ${map.get(players)!}`);
        }
    }

    await dataSource.destroy();
}

void main();
