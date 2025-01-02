import { DataSource, ILike } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";

const OLD_NAME = "aphrodyqe";
const NEW_NAME = "aphro";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, PlayedMap],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        where: { shoutcasters: ILike(`%${OLD_NAME}%`) },
        relations: {
            playedMaps: false,
        },
    });
    console.log(`Loaded ${matches.length} matches.`);

    for (const match of matches) {
        const shoutcasterIndex = match.shoutcasters!.findIndex(
            (s) => s === OLD_NAME,
        );
        if (shoutcasterIndex < 0) {
            console.log(`Shoutcaster not found in match ${match.uuid}`);
        } else {
            match.shoutcasters![shoutcasterIndex] = NEW_NAME;
            await match.save();
        }
    }

    await dataSource.destroy();
}

void main();
