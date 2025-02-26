import { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { CompetitionPlacement } from "~/server/model/Competition";

export class FallIntoPlace implements AutomaticAchievement {
    name = "Fall into Place";
    description = [
        "Finish a tournament in the top half of players",
        "Finish a tournament 9th or better",
        "Finish a tournament 5th or better",
        "Reach the Semi-Finals of a tournament",
        "Reach the Grand Final of a tournament",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
    ];
    category = AchievementCategory.TOURNAMENT;
    levels = 5;

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        const placementsThisTournament = await CompetitionPlacement.countBy({
            competition: match.competition,
        });
        const lastMatchThisTournament = await Match.findOne({
            where: {
                competition: match.competition,
            },
            select: ["timestamp", "uuid"],
            order: {
                timestamp: "DESC",
            },
            relations: {
                playedMaps: false,
            },
        });

        const placementOfPlayerOne = await CompetitionPlacement.findOneBy({
            player: match.playerOne,
            competition: match.competition,
        });
        const placementOfPlayerTwo = await CompetitionPlacement.findOneBy({
            player: match.playerTwo,
            competition: match.competition,
        });

        if (placementOfPlayerOne != null) {
            this.checkSinglePlayer(
                playerOneAchievement,
                placementOfPlayerOne,
                placementsThisTournament,
                (lastMatchThisTournament ?? match).timestamp,
            );
        }
        if (placementOfPlayerTwo != null) {
            this.checkSinglePlayer(
                playerTwoAchievement,
                placementOfPlayerTwo,
                placementsThisTournament,
                (lastMatchThisTournament ?? match).timestamp,
            );
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<string[]>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].achievedAt = [0, 0, 0, 0, 0];
            achievements[player].progression = [0, 0, 0, 0, 0];
        }

        for (const match of matches) {
            await this.update(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
            );
        }
    }

    private checkSinglePlayer(
        achievement: Achievement<unknown>,
        placement: CompetitionPlacement,
        amountPlacements: number,
        timestamp: number,
    ) {
        if (placement.placement == null) {
            return;
        }

        if (
            achievement.achievedAt[0] <= 0 &&
            placement.placement <= amountPlacements / 2
        ) {
            achievement.achievedAt[0] = timestamp;
            achievement.progression[0] = 1;
        }

        if (achievement.achievedAt[0] <= 0) {
            return;
        }

        if (placement.placement <= 9 && achievement.achievedAt[1] <= 0) {
            achievement.achievedAt[1] = timestamp;
            achievement.progression[1] = 1;
        }
        if (placement.placement <= 5 && achievement.achievedAt[2] <= 0) {
            achievement.achievedAt[2] = timestamp;
            achievement.progression[2] = 1;
        }
        if (placement.placement <= 3 && achievement.achievedAt[3] <= 0) {
            achievement.achievedAt[3] = timestamp;
            achievement.progression[3] = 1;
        }
        if (placement.placement <= 2 && achievement.achievedAt[4] <= 0) {
            achievement.achievedAt[4] = timestamp;
            achievement.progression[4] = 1;
        }
    }
}
