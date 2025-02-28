import type { Match } from "~/server/model/Match";
import type { AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { CompetitionPlacement } from "~/server/model/Competition";
import { DateTime } from "luxon";

export class Champion implements AutomaticAchievement {
    name = "Champion";
    description = ["Win a Roulette Rivals tournament"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    placementOfPlayer: Record<string, Record<string, number | null>> = {};
    lastCacheClear = 0;

    public getDefaultData(): string[] {
        return [];
    }

    private async getPlacementOfPlayerInTournament(
        tournament: string,
        playerUUID: string,
    ): Promise<number | null> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.placementOfPlayer = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }
        if (this.placementOfPlayer[tournament] == null) {
            this.placementOfPlayer[tournament] = {};
        }
        if (this.placementOfPlayer[tournament][playerUUID] === undefined) {
            const placementOfPlayer = await CompetitionPlacement.findOneBy({
                player: playerUUID,
                competition: tournament,
            });
            this.placementOfPlayer[tournament][playerUUID] =
                placementOfPlayer?.placement ?? null;
        }
        return this.placementOfPlayer[tournament][playerUUID];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (match.competition.toLowerCase().includes("rrwc")) {
            return;
        }
        const placementOfPlayerOne =
            await this.getPlacementOfPlayerInTournament(
                match.competition,
                match.playerOne,
            );
        const placementOfPlayerTwo =
            await this.getPlacementOfPlayerInTournament(
                match.competition,
                match.playerTwo,
            );

        if (
            placementOfPlayerOne != null &&
            placementOfPlayerOne === 1 &&
            playerOneAchievement.achievedAt[0] <= 0
        ) {
            playerOneAchievement.achievedAt[0] = match.timestamp;
            playerOneAchievement.progression[0] = 1;
        }
        if (
            placementOfPlayerTwo != null &&
            placementOfPlayerTwo === 1 &&
            playerTwoAchievement.achievedAt[0] <= 0
        ) {
            playerTwoAchievement.achievedAt[0] = match.timestamp;
            playerTwoAchievement.progression[0] = 1;
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<string[]>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].achievedAt = [0];
            achievements[player].progression = [0];
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
