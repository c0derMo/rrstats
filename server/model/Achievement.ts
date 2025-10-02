import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

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
    @Column("simple-json", { nullable: true })
    progressionString?: string[];
    @Column("simple-json", { nullable: true })
    match?: string[];

    achieveIfNotAchieved(
        timestamp: number,
        level: number = 0,
        setProgression: boolean = false,
        match?: string,
    ) {
        if (this.achievedAt[level] <= 0) {
            this.achievedAt[level] = timestamp;
            if (setProgression) {
                this.progression[level] = 1;
            }
            if (match) {
                if (this.match == null) {
                    this.match = Array(this.achievedAt.length).fill(undefined);
                }
                this.match[level] = match;
            }
        }
    }

    isFullyAchieved(): boolean {
        return this.achievedAt[this.achievedAt.length - 1] > 0;
    }
}
