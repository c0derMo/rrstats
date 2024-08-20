import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChoosingPlayer, RRMap, Spin, WinningPlayer } from "~/utils/interfaces/IMatch";
import { HitmanMap } from "~/utils/mapUtils";
import { Match } from "./Match";

@Entity()
export class PlayedMap extends BaseEntity implements RRMap {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;
    @ManyToOne(() => Match, (match) => match.playedMaps)
    match: Match;
    @Column("integer")
    map: HitmanMap;
    @Column("integer")
    picked: ChoosingPlayer;
    @Column("integer")
    winner: WinningPlayer;
    @Column("boolean", { nullable: true })
    forfeit?: boolean;
    @Column("simple-json")
    spin?: Spin;
    @Column("integer")
    timeTaken: number;
}