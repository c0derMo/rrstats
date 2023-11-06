import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { ICompetition } from "~/utils/interfaces/ICompetition";

@Entity()
export class Competition extends BaseEntity implements ICompetition {
    @PrimaryColumn('text')
    tag: string;
    @Column('text')
    name: string;

    @Column('boolean')
    officialCompetition: boolean;
    @Column('integer')
    startingTimestamp: number;
    
    @Column('text', { nullable: true })
    hitmapsStatsUrl?: string;
    @Column('text', { nullable: true })
    hitmapsSlug?: string;
    @Column('boolean', { nullable: true })
    updateWithHitmaps?: boolean

    @Column('text', { nullable: true })
    backgroundImage?: string;
}