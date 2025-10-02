import { Match } from "../model/Match";
import { Player } from "../model/Player";
import { DataSource } from "typeorm";
import MapperService from "../controller/MapperService";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, Player],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);
    const matches = await Match.find();
    console.log(`Loaded ${matches.length} matches.`);
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    const pbs = new DefaultedMap<string, DefaultedMap<number, number>>(
        () => new DefaultedMap<number, number>(() => -1),
    );

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit) continue;
            if (map.timeTaken < 0) continue;

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                const previousBest = pbs.get(match.playerOne).get(map.map);
                if (map.timeTaken < previousBest || previousBest < 0) {
                    pbs.get(match.playerOne).set(map.map, map.timeTaken);
                }
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                const previousBest = pbs.get(match.playerTwo).get(map.map);
                if (map.timeTaken < previousBest || previousBest < 0) {
                    pbs.get(match.playerTwo).set(map.map, map.timeTaken);
                }
            }
        }
    }

    const headers = [
        { key: "player", header: "PLAYER" },
        ...getAllMaps().map((m) => {
            return {
                key: m.toString(),
                header: getMap(m)!.abbreviation,
            };
        }),
    ];

    const rows = pbs.mapAll((player, playerPBs) => {
        const result = {
            player: playerLookupMap[player],
        } as Record<string | number, unknown>;
        playerPBs.mapAll((map, time) => {
            result[map.toString()] = time;
        });
        return result;
    });

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile("./PBs.csv", output, "utf-8");
}

void main();
