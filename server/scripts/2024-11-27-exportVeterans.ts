import { DataSource, In } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";
import { Player } from "../model/Player";
import { Competition, CompetitionPlacement } from "../model/Competition";
import PlayerStatisticController from "../controller/PlayerStatisticController";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, PlayedMap, Player, Competition, CompetitionPlacement],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    // const matches = await Match.find({
    //     where: {
    //         competition: In(["RR13", "RR14", "RR15", "RRWC2024"])
    //     },
    //     select: ["playerOne", "playerTwo", "uuid"],
    // });

    // const allPlayers = matches.map((match) => [match.playerOne, match.playerTwo]).reduce((l, r) => [...l, ...r], []);

    // const players = await Player.find({ where: { uuid: In(allPlayers) }});

    const players = await Player.find({ where: { primaryName: In(["In4Fun", "Frote7", "Yannini", "Ducker", "IlikeHitman", "Pigiero", "davidredsox", "Cabben", "T_Nort23" ,"Fuzk", "Some Random Person", "Rommel of the Far East", "GuLe", "Redfox", "Gorg"]) }});

    console.log(`Loaded ${players.length} players.`);

    for (const player of players) {
        const stats = await PlayerStatisticController.get(player.uuid);

        if (stats.debutMatch == null) {
            continue;
        }

        // if (DateTime.fromMillis(stats.debutMatch.timestamp).year === 2020) {
            console.log(`${player.primaryName}: ${stats.winTieLoss.w}/${stats.matchCount} (${stats.winrate}); ${stats.mapsWon.reduce((l,r) => l+r,0)}/${stats.mapsPlayed.reduce((l,r) => l+r,0)} (${stats.mapWinrate}; ${stats.bestPlacement} best, ${stats.averagePlacement} avg)`)
        // }
    }

    await dataSource.destroy();
}

void main();