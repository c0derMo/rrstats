import { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { CompetitionPlacement } from "~/server/model/Competition";
import { DateTime } from "luxon";

export class FallIntoPlace extends AutomaticAchievement<string[]> {
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

    placementsInTournament: Record<string, number> = {};
    placementOfPlayer: Record<string, Record<string, number | null>> = {};
    finalTimestampInTournament: Record<string, number> = {};
    lastCacheClear = 0;

    public getDefaultData(): string[] {
        return [];
    }

    private invalidateCache() {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.placementsInTournament = {};
            this.placementOfPlayer = {};
            this.finalTimestampInTournament = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }
    }

    private async getPlacementsInTournament(
        tournament: string,
    ): Promise<number> {
        this.invalidateCache();
        if (this.placementsInTournament[tournament] == null) {
            this.placementsInTournament[tournament] =
                await CompetitionPlacement.countBy({
                    competition: tournament,
                });
        }
        return this.placementsInTournament[tournament];
    }

    private async getPlacementOfPlayerInTournament(
        tournament: string,
        playerUUID: string,
    ): Promise<number | null> {
        this.invalidateCache();
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

    private async getFinalTimestampOfTournament(
        tournament: string,
        defaultTimestamp: number,
    ): Promise<number> {
        this.invalidateCache();
        if (this.finalTimestampInTournament[tournament] == null) {
            const lastMatchThisTournament = await Match.findOne({
                where: {
                    competition: tournament,
                },
                select: ["timestamp", "uuid"],
                order: {
                    timestamp: "DESC",
                },
                relations: {
                    playedMaps: false,
                },
            });
            if (lastMatchThisTournament == null) {
                return defaultTimestamp;
            }
            this.finalTimestampInTournament[tournament] =
                lastMatchThisTournament.timestamp;
        }
        return this.finalTimestampInTournament[tournament];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        const placementsThisTournament = await this.getPlacementsInTournament(
            match.competition,
        );
        const finalTimestampThisTournament =
            await this.getFinalTimestampOfTournament(
                match.competition,
                match.timestamp,
            );

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

        if (placementOfPlayerOne != null) {
            this.checkSinglePlayer(
                playerOneAchievement,
                placementOfPlayerOne,
                placementsThisTournament,
                finalTimestampThisTournament,
            );
        }
        if (placementOfPlayerTwo != null) {
            this.checkSinglePlayer(
                playerTwoAchievement,
                placementOfPlayerTwo,
                placementsThisTournament,
                finalTimestampThisTournament,
            );
        }
    }

    private checkSinglePlayer(
        achievement: Achievement<unknown>,
        placement: number,
        amountPlacements: number,
        timestamp: number,
    ) {
        if (placement <= amountPlacements / 2) {
            achievement.achieveIfNotAchieved(timestamp, 0, true);
        }

        if (achievement.achievedAt[0] <= 0) {
            return;
        }

        if (placement <= 9) {
            achievement.achieveIfNotAchieved(timestamp, 1, true);
        }
        if (placement <= 5) {
            achievement.achieveIfNotAchieved(timestamp, 2, true);
        }
        if (placement <= 3) {
            achievement.achieveIfNotAchieved(timestamp, 3, true);
        }
        if (placement <= 2) {
            achievement.achieveIfNotAchieved(timestamp, 4, true);
        }
    }
}
