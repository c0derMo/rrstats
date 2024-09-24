import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    DataSource,
} from "typeorm";
import type { IMatch, RRBannedMap, RRMap } from "~/utils/interfaces/IMatch";
import { PlayedMap } from "../model/PlayedMap";
import { copyFile } from "node:fs/promises";
import { Match } from "../model/Match";

@Entity("match")
export class OldMatch extends BaseEntity implements IMatch {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;
    @Column("text", { nullable: true })
    hitmapsMatchId: string;
    @Column("integer")
    timestamp: number;

    @Column("text")
    playerOne: string;
    @Column("text")
    playerTwo: string;

    @Column("integer")
    playerOneScore: number;
    @Column("integer")
    playerTwoScore: number;

    @Column("boolean", { nullable: true })
    annulated?: boolean;

    @Column("text")
    competition: string;
    @Column("text")
    round: string;
    @Column("text", { nullable: true })
    platform?: string;

    @Column("simple-json")
    bannedMaps: RRBannedMap[];
    @Column("simple-json")
    playedMaps: RRMap[];

    @Column("simple-json", { nullable: true })
    shoutcasters?: string[];
    @Column("simple-json", { nullable: true })
    vodLink?: string[];
}

const oldDBName = "./rrstats_old.db";
const newDBName = "./rrstats.db";

async function main() {
    console.log("Copying database...");
    await copyFile(oldDBName, newDBName);

    const oldDB = new DataSource({
        type: "sqlite",
        database: oldDBName,
        entities: [OldMatch],
    });
    await oldDB.initialize();
    console.log("Conntected to old db.");
    const newDB = new DataSource({
        type: "sqlite",
        database: newDBName,
        entities: [Match, PlayedMap],
        synchronize: true,
    });
    await newDB.initialize();
    console.log("Connected to new db.");

    const matches = await OldMatch.find();
    console.log(`Loaded ${matches.length} matches.`);
    let i = 0;
    const queryRunner = newDB.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for (const match of matches) {
        const newMatch = await Match.findOneByOrFail({ uuid: match.uuid });

        for (const mapIndex in match.playedMaps) {
            const map = match.playedMaps[mapIndex];
            const newMap = new PlayedMap();
            newMap.map = map.map;
            newMap.picked = map.picked;
            newMap.winner = map.winner;
            newMap.forfeit = map.forfeit;
            newMap.spin = map.spin;
            newMap.timeTaken = map.timeTaken;
            newMap.index = parseInt(mapIndex);
            await queryRunner.manager.save(newMap);
            newMatch.playedMaps.push(newMap);
        }

        newMatch.notes = undefined;

        await queryRunner.manager.save(newMatch);
        i++;
        if (i % 100 == 0) {
            console.log(`${i} matches done.`);
        }
    }
    console.log("Executing transaction");
    await queryRunner.commitTransaction();
    console.log("Migrated all matches.");
    await queryRunner.release();

    newDB.query("VACUUM");
}

void main();
