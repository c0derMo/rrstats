import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany,
} from "typeorm";
import type { IMatch, RRBannedMap } from "~/utils/interfaces/IMatch";
import { PlayedMap } from "./PlayedMap";

@Entity()
export class Match extends BaseEntity implements IMatch {
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

    @Column("simple-json", { nullable: true })
    shoutcasters?: string[];
    @Column("simple-json", { nullable: true })
    vodLink?: string[];

    @OneToMany(() => PlayedMap, (map) => map.match, { eager: true })
    playedMaps: PlayedMap[];
}
