import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { CompetitionPlacement } from "~/server/model/Competition";
import { DateTime } from "luxon";

export class AllRounder extends AutomaticAchievement<boolean[]> {
    name = "All-Rounder";
    description = [
        "Win a Roulette Rivals and a Roulette Rivals World Championship",
    ];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    placementOfPlayer: Record<string, Record<string, number | null>> = {};
    lastCacheClear = 0;

    public getDefaultData(): boolean[] {
        return [false, false];
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
        playerOneAchievement: Achievement<boolean[]>,
        playerTwoAchievement: Achievement<boolean[]>,
    ): Promise<void> {
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
            if (match.competition.toLowerCase().includes("rrwc")) {
                playerOneAchievement.data[0] = true;
            } else {
                playerOneAchievement.data[1] = true;
            }
            if (playerOneAchievement.data.every((e) => e)) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
        if (placementOfPlayerTwo != null && placementOfPlayerTwo === 1) {
            if (match.competition.toLowerCase().includes("rrwc")) {
                playerTwoAchievement.data[0] = true;
            } else {
                playerTwoAchievement.data[1] = true;
            }
            if (playerTwoAchievement.data.every((e) => e)) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }
}
