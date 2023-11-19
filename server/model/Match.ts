import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { IMatch, RRBannedMap, RRMap } from "~/utils/interfaces/IMatch";

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
