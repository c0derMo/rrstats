import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RRRecord {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        category: string;
    @Column()
        isMapRecord: boolean;
    @Column("simple-json")
        players: string[];
    @Column()
        match: string;
    @Column()
        details: string;
    @Column()
        time: number;
    @Column()
        videoLink: string;
    @Column()
        sortingIndex: number;
}