import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import type {
    ChoosingPlayer,
    IPlayedMap,
    Spin,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import type { HitmanMap } from "~/utils/mapUtils";
import { Match } from "./Match";

@Entity()
export class PlayedMap extends BaseEntity implements IPlayedMap {
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
    @Column("integer")
    index: number;
    @Column("boolean", { nullable: true })
    forfeit?: boolean;
    @Column("boolean", { nullable: true })
    unscored?: boolean;
    @Column("simple-json", { nullable: true })
    spin?: Spin;
    @Column("integer")
    timeTaken: number;
    @Column("text", { nullable: true })
    notes?: string;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.notes === "") {
            this.notes = undefined;
        }
    }
}
