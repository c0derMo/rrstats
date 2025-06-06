import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { DateTime } from "luxon";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { LessThan, Like } from "typeorm";

export class ApexPredator extends AutomaticAchievement<number> {
    name = "Apex Predator";
    description = ["Defeat the reigning RR World Champion in a match"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.MATCH;
    levels = 1;

    isChampionCache: Record<string, Record<string, boolean>> = {};
    previousTournamentCache: Record<string, string | false> = {};
    lastCacheClear = 0;

    private async isChampionOfPreviousRRWC(
        playerUUID: string,
        tournament: string,
    ): Promise<boolean> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.isChampionCache = {};
            this.previousTournamentCache = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }

        if (this.isChampionCache[playerUUID]?.[tournament] == null) {
            if (this.previousTournamentCache[tournament] == null) {
                const tourney = await Competition.findOneByOrFail({
                    tag: tournament,
                });
                const previousTourney = await Competition.findOne({
                    where: {
                        tag: Like("RRWC%"),
                        startingTimestamp: LessThan(tourney.startingTimestamp),
                        officialCompetition: true,
                    },
                    order: {
                        startingTimestamp: "DESC",
                    },
                });
                this.previousTournamentCache[tournament] =
                    previousTourney?.tag ?? false;
            }
            if (this.previousTournamentCache[tournament] === false) {
                return false;
            }

            if (this.isChampionCache[playerUUID] == null) {
                this.isChampionCache[playerUUID] = {};
            }

            const hasWinPlacement = await CompetitionPlacement.countBy({
                player: playerUUID,
                competition: this.previousTournamentCache[tournament] as string,
                placement: 1,
            });

            this.isChampionCache[playerUUID][tournament] = hasWinPlacement > 0;
        }

        return this.isChampionCache[playerUUID][tournament];
    }

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (
            match.playerOneScore > match.playerTwoScore &&
            (await this.isChampionOfPreviousRRWC(
                match.playerTwo,
                match.competition,
            ))
        ) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        } else if (
            match.playerTwoScore > match.playerOneScore &&
            (await this.isChampionOfPreviousRRWC(
                match.playerOne,
                match.competition,
            ))
        ) {
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
