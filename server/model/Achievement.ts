import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Achievement<T = unknown> extends BaseEntity {
    @PrimaryColumn("text")
    player: string;
    @PrimaryColumn("text")
    achievement: string;
    @Column("simple-json")
    achievedAt: number[];
    @Column("simple-json")
    progression: number[];
    @Column("simple-json")
    data: T;
    @Column("text", { nullable: true })
    link: string;
    @Column("boolean")
    verified: boolean;
}
