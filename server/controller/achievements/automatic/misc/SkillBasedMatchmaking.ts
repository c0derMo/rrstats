import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";
import EloController from "~~/server/controller/EloController";

export class SkillBasedMatchmaking extends AutomaticAchievement<number> {
    name = "Skill-Based Matchmaking";
    description = [
        "Reach an Elo rating of 1100",
        "Reach an Elo rating of 1200",
        "Reach an Elo rating of 1300",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MISC;
    levels = 3;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        this.checkOnePlayer(playerOneAchievement);
        this.checkOnePlayer(playerTwoAchievement);
    }

    public override async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
            this.checkOnePlayer(achievements[player]);
        }
    }

    private checkOnePlayer(achievement: Achievement<number>) {
        const levelRequirements = [1100, 1200, 1300];

        const eloProgression =
            EloController.getInstance().getEloProgressionOfPlayer(
                achievement.player,
            );

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            const firstTimeAchieving = eloProgression.find(
                (moment) => moment.elo >= levelRequirements[idx],
            );
            if (firstTimeAchieving != null) {
                achievement.achieveIfNotAchieved(
                    firstTimeAchieving.timestamp,
                    idx,
                );
            }
        }

        const maxElo = Math.max(...eloProgression.map((moment) => moment.elo));

        achievement.progression = levelRequirements.map((req) =>
            Math.min(1, maxElo / req),
        );
        achievement.progressionString = levelRequirements.map(
            (req) => `${maxElo} / ${req}`,
        );
    }
}
