import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import type { IMatch, RRBannedMap, RRMap } from "~/utils/interfaces/IMatch";

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
    playedMaps: RRMap[];
    @Column("simple-json")
    bannedMaps: RRBannedMap[];

    @Column("simple-json", { nullable: true })
    shoutcasters?: string[];
    @Column("simple-json", { nullable: true })
    vodLink?: string[];
}
