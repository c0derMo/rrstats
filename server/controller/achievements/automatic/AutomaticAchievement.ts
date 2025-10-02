import type { Achievement } from "~~/server/model/Achievement";
import type { Match } from "~~/server/model/Match";

export abstract class AutomaticAchievement<T> implements AchievementInfo {
    abstract name: string;
    abstract description: string[];
    abstract tier: AchievementTier[];
    abstract category: AchievementCategory;
    abstract levels: number;

    abstract getDefaultData(): T;
    abstract update(
        match: Match,
        playerOneAchievement: Achievement<T>,
        playerTwoAchievement: Achievement<T>,
    ): Promise<void>;

    public async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<T>>,
    ) {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        for (const match of matches) {
            await this.update(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
            );
        }
    }
}
