import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import type { SubmittedAchievement } from "~/utils/interfaces/AchievementInfo";

@Entity()
export class Achievement<T = unknown>
    extends BaseEntity
    implements SubmittedAchievement
{
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
    @Column("boolean")
    verified: boolean;
}
