import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { DateTime } from "luxon";
import { LessThan } from "typeorm";

export class ChallengerDefender extends AutomaticAchievement<string[]> {
    name = "Challenger & Defender";
    description = ["Defend your title by winning two consecutive tournaments"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    placementOfPlayer: Record<string, Record<string, number | null>> = {};
    tournamentBefore: Record<string, string | null> = {};
    lastCacheClear = 0;

    public getDefaultData(): string[] {
        return [];
    }

    private async getTournamentBefore(
        tournament: string,
    ): Promise<string | null> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.placementOfPlayer = {};
            this.tournamentBefore = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }
        if (this.tournamentBefore[tournament] == null) {
            const currentTourneyStarting = await Competition.findOneBy({
                tag: tournament,
            });
            if (currentTourneyStarting == null) {
                return null;
            }
            const tourneyBefore = await Competition.findOne({
                where: {
                    startingTimestamp: LessThan(
                        currentTourneyStarting.startingTimestamp,
                    ),
                    officialCompetition: true,
                },
                order: {
                    startingTimestamp: "DESC",
                },
            });
            this.tournamentBefore[tournament] = tourneyBefore?.tag ?? null;
        }
        return this.tournamentBefore[tournament];
    }

    private async getPlacementOfPlayerInTournament(
        tournament: string,
        playerUUID: string,
    ): Promise<number | null> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.placementOfPlayer = {};
            this.tournamentBefore = {};
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
        const tournamentBefore = await this.getTournamentBefore(
            match.competition,
        );
        if (tournamentBefore == null) {
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
        const lastPlacementOfPlayerOne =
            await this.getPlacementOfPlayerInTournament(
                tournamentBefore,
                match.playerOne,
            );
        const lastPlacementOfPlayerTwo =
            await this.getPlacementOfPlayerInTournament(
                tournamentBefore,
                match.playerTwo,
            );

        if (placementOfPlayerOne === 1 && lastPlacementOfPlayerOne === 1) {
            playerOneAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
        if (placementOfPlayerTwo === 1 && lastPlacementOfPlayerTwo === 1) {
            playerTwoAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
    }
}
