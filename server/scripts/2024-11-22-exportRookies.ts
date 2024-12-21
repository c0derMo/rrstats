import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";
import { Player } from "../model/Player";
import { Competition, CompetitionPlacement } from "../model/Competition";
import PlayerStatisticController from "../controller/PlayerStatisticController";
import { DateTime } from "luxon";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, PlayedMap, Player, Competition, CompetitionPlacement],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const players = await Player.find();
    console.log(`Loaded ${players.length} players.`);

    for (const player of players) {
        const stats = await PlayerStatisticController.get(player.uuid);

        if (stats.debutMatch == null) {
            continue;
        }
        if (DateTime.fromMillis(stats.debutMatch.timestamp).year === 2024) {
            console.log(`${player.primaryName}: ${stats.winTieLoss.w}/${stats.matchCount} (${stats.winrate}); ${stats.mapsWon.reduce((l,r) => l+r,0)}/${stats.mapsPlayed.reduce((l,r) => l+r,0)} (${stats.mapWinrate}; ${stats.bestPlacement} best, ${stats.averagePlacement} avg)`)
        }
    }

    await dataSource.destroy();
}

void main();