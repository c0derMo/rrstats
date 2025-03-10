import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { CompetitionPlacement } from "~/server/model/Competition";
import { DateTime } from "luxon";

export class Champion extends AutomaticAchievement<string[]> {
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
            const placementOfPlayer = await CompetitionPlacement.findOne({
                where: {
                    player: playerUUID,
                    competition: tournament,
                },
                order: {
                    placement: "DESC",
                },
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

        if (placementOfPlayerOne != null && placementOfPlayerOne === 1) {
            playerOneAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
        if (placementOfPlayerTwo != null && placementOfPlayerTwo === 1) {
            playerTwoAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
    }
}
