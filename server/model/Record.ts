import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import {
    GenericRecordType,
    IGenericRecord,
    IMapRecord,
} from "~/utils/interfaces/IRecord";
import { HitmanMap } from "~/utils/mapUtils";

@Entity()
export class GenericRecord extends BaseEntity implements IGenericRecord {
    @PrimaryColumn("integer")
    timestamp: number;
    @PrimaryColumn("text")
    record: GenericRecordType;

    @Column("simple-json")
    players: string[];
    @Column("integer")
    time: number;
    @Column("text")
    match: string;
    @Column("simple-json")
    maps: { map: HitmanMap; time: number }[];
}

@Entity()
export class MapRecord extends BaseEntity implements IMapRecord {
    @PrimaryColumn("integer")
    timestamp: number;
    @PrimaryColumn("integer")
    map: HitmanMap;

    @Column("text")
    player: string;
    @Column("integer")
    time: number;
    @Column("text")
    match: string;
    @Column("integer")
    mapIndex: number;
}
