import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";
import { ICompetition, ICompetitionPlacement, IGroupSettings } from "~/utils/interfaces/ICompetition";

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

    @Column('simple-json', { nullable: true })
    groupsConfig?: IGroupSettings;

    @BeforeInsert()
    @BeforeUpdate()
    checkOptionalFields() {
        if (this.backgroundImage === "") {
            this.backgroundImage = undefined;
        }
        if (this.hitmapsSlug === "") {
            this.hitmapsSlug = undefined;
        }
        if (this.hitmapsStatsUrl === "") {
            this.hitmapsStatsUrl = undefined;
        }
    }
}

@Entity()
export class CompetitionPlacement extends BaseEntity implements ICompetitionPlacement {
    @PrimaryColumn('text')
    player: string;
    @PrimaryColumn('text')
    competition: string;
    @PrimaryColumn('text')
    bracket: string;

    @Column('integer', { nullable: true })
    placement?: number;

    @BeforeInsert()
    @BeforeUpdate()
    checkPlacement() {
        if (this.placement !== undefined && this.placement <= 0) {
            this.placement = undefined;
        }
    }
}