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

    achieveIfNotAchieved(
        timestamp: number,
        level: number = 0,
        setProgression: boolean = false,
    ) {
        if (this.achievedAt[level] <= 0) {
            this.achievedAt[level] = timestamp;
            if (setProgression) {
                this.progression[level] = 1;
            }
        }
    }

    isFullyAchieved(): boolean {
        return this.achievedAt[this.achievedAt.length - 1] > 0;
    }
}
