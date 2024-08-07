import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    DataSource,
    Entity,
    PrimaryColumn,
} from "typeorm";
import type {
    ICompetition,
    IGroupSettings,
} from "~/utils/interfaces/ICompetition";
import { Match } from "../model/Match";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { createInterface, type Interface } from "node:readline";
import { Player } from "../model/Player";
import MapperService from "../controller/MapperService";
import { getMap } from "~/utils/mapUtils";

@Entity("competition")
export class CompetitionWithDefault extends BaseEntity implements ICompetition {
    @PrimaryColumn("text")
    tag: string;
    @Column("text")
    name: string;

    @Column("boolean")
    officialCompetition: boolean;
    @Column("integer")
    startingTimestamp: number;

    @Column("text", { nullable: true })
    hitmapsStatsUrl?: string;
    @Column("text", { nullable: true })
    hitmapsSlug?: string;
    @Column("boolean", { nullable: true })
    updateWithHitmaps?: boolean;

    @Column("text", { nullable: true })
    backgroundImage?: string;

    @Column("simple-json", { nullable: true })
    groupsConfig?: IGroupSettings;

    @Column("integer", { default: -1 })
    matchTimeoutTime: number;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.backgroundImage === "") {
            this.backgroundImage = undefined;
        }
        if (this.hitmapsSlug === "") {
            this.hitmapsSlug = undefined;
        }
        if (this.hitmapsStatsUrl === "") {
            this.hitmapsStatsUrl = undefined;
        }
    }
}

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [CompetitionWithDefault, Match, Player],
        synchronize: true,
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const inter = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const comps = await CompetitionWithDefault.find({
        where: { officialCompetition: true },
    });
    console.log(`${comps.length} official competitions loaded.`);

    const timeouts: Record<string, number> = {};

    const matches = await Match.find();
    console.log(`${matches.length} matches loaded`);

    const players = await Player.find();
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    let updatedMaps = 0;

    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.winner !== WinningPlayer.DRAW) {
                continue;
            }

            if (map.timeTaken === -1) {
                let stage = "ko";
                if (match.round.includes("Group")) {
                    stage = "group";
                }

                if (timeouts[match.competition + stage] == null) {
                    const timeStr = await input(
                        inter,
                        `Timeout time for ${match.competition + stage}: `,
                    );
                    const time = parseInt(timeStr);
                    timeouts[match.competition + stage] = time;
                    const comp = comps.find(
                        (comp) => comp.tag === match.competition,
                    );
                    if (comp != null) {
                        comp.matchTimeoutTime = time;
                        await comp.save();
                    }
                }
                map.timeTaken = timeouts[match.competition + stage];
                updatedMaps += 1;
                console.log(
                    `${match.competition} ${match.round} ${
                        playerLookupMap[match.playerOne]
                    } - ${playerLookupMap[match.playerTwo]} ${
                        getMap(map.map)!.name
                    } set to ${map.timeTaken}`,
                );
            }
        }
        await match.save();
    }

    console.log(`${updatedMaps} matches edited.`);
    await dataSource.destroy();
    inter.close();
}

void run();

async function input(inter: Interface, prompt: string): Promise<string> {
    return new Promise((resolve) => {
        inter.question(prompt, resolve);
    });
}
