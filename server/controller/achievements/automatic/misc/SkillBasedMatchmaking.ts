import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import EloController from "~/server/controller/EloController";

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
        const p1EloChanges =
            EloController.getInstance().getEloProgressionOfPlayer(
                match.playerOne,
            );
        const p2EloChanges =
            EloController.getInstance().getEloProgressionOfPlayer(
                match.playerTwo,
            );

        const p1EloAfterThisMatch = p1EloChanges.findLast(
            (point) => point.timestamp <= match.timestamp,
        );
        const p2EloAfterThisMatch = p2EloChanges.findLast(
            (point) => point.timestamp <= match.timestamp,
        );

        if (p1EloAfterThisMatch?.elo != null) {
            this.checkCondition(
                playerOneAchievement,
                p1EloAfterThisMatch.elo,
                match.timestamp,
            );
        }
        if (p2EloAfterThisMatch?.elo != null) {
            this.checkCondition(
                playerTwoAchievement,
                p2EloAfterThisMatch.elo,
                match.timestamp,
            );
        }
    }

    private checkCondition(
        achievement: Achievement<number>,
        elo: number,
        timestamp: number,
    ) {
        const levelRequirements = [1100, 1200, 1300];

        for (let i = 0; i < this.levels; i++) {
            if (elo >= levelRequirements[i]) {
                achievement.achieveIfNotAchieved(timestamp, i);
            }
        }

        achievement.progression = levelRequirements.map((req, i) => {
            if (achievement.achievedAt[i] > 0) {
                return 1;
            }
            return Math.min(1, elo / req);
        });
    }
}
