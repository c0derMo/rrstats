import {
    BaseEntity,
    Column,
    DataSource,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { RRMap, RRBannedMap } from "~/utils/interfaces/IMatch";

@Entity("match")
export class OldMatch extends BaseEntity {
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
    playedMaps: RRMap[];
    @Column("simple-json")
    bannedMaps: RRBannedMap[];

    @Column("simple-json", { nullable: true })
    shoutcasters?: string[];
    @Column("text", { nullable: true })
    vodLink?: string;
}

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [OldMatch],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await OldMatch.find();
    console.log(`${matches.length} matches loaded.`);

    for (const match of matches) {
        if (match.vodLink != null && match.vodLink !== "") {
            const newVodLink = `["${match.vodLink}"]`;
            match.vodLink = newVodLink;
            await match.save();
        }
    }

    console.log(`${matches.length} matches edited.`);
    await dataSource.destroy();
}

void run();
