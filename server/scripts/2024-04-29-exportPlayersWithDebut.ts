import { Match } from "../model/Match";
import { Player } from "../model/Player";
import { DateTime } from "luxon";
import { DataSource } from "typeorm";

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

    const playersWithDebuts: { player: string; debut: number; comp: string }[] =
        [];

    for (const player of players) {
        const debutMatch = await Match.findOne({
            where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }],
            order: { timestamp: "ASC" },
        });

        if (debutMatch == null) {
            console.log(`No debut match for ${player.primaryName}`);
            continue;
        }

        playersWithDebuts.push({
            player: player.primaryName,
            debut: debutMatch.timestamp,
            comp: debutMatch.competition,
        });
    }

    playersWithDebuts.sort((a, b) => {
        return a.debut - b.debut;
    });

    for (const debut of playersWithDebuts) {
        const dt = DateTime.fromMillis(debut.debut).toLocaleString(
            DateTime.DATETIME_FULL,
        );
        console.log(`${debut.player}: ${dt} (${debut.comp})`);
    }
}

void main();
