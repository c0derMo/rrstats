import {
    BaseEntity,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import type {
    ChoosingPlayer,
    RRMap,
    Spin,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import type { HitmanMap } from "~/utils/mapUtils";
import { Match } from "./Match";

@Entity()
export class PlayedMap extends BaseEntity implements RRMap {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;
    @ManyToOne(() => Match, (match) => match.playedMaps)
    match: Match;
    @Index()
    @Column("integer")
    map: HitmanMap;
    @Column("integer")
    picked: ChoosingPlayer;
    @Column("integer")
    winner: WinningPlayer;
    @Column("boolean", { nullable: true })
    forfeit?: boolean;
    @Index()
    @Column("simple-json", { nullable: true })
    spin?: Spin;
    @Column("integer")
    timeTaken: number;
}
