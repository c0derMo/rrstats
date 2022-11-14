import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ParserConfigOverrides } from "../gDriveIntegration";

@Entity()
export class RRCompetiton {
    @PrimaryGeneratedColumn("uuid")
        uuid: string;
    @Column()
        name: string;
    @Column()
        tag: string;
    @Column({ nullable: true })
        challongeURL: string;
    @Column({ nullable: true })
        hitmapsStatsURL: string;
    @Column("simple-json")
        placements: IRRCompetitionPlacement[]
    @Column()
        updateWithSheet: boolean;
    @Column({ nullable: true })
        sheetId: string;
    @Column({ nullable: true })
        gid: string;
    @Column()
        officialCompetition: boolean;
    @Column()
        sortingIndex: number;
    @Column({ nullable: true, type: "simple-json"})
        parserOptions: ParserConfigOverrides;
}

interface IRRCompetitionPlacement {
    playerId: string;
    bracket: string;
    placement: number;
}