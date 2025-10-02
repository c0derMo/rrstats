import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";
import { DateTime } from "luxon";
import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { LessThan } from "typeorm";

export class BehemothKiller extends AutomaticAchievement<number> {
    name = "Behemoth Killer";
    description = ["Defeat the reigning RR Champion in a match"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.MATCH;
    levels = 1;

    championsCache: Record<string, string[]> = {};
    previousTournamentCache: Record<string, string | false> = {};
    lastCacheClear = 0;

    private async isChampionOfPreviousTournament(
        playerUUID: string,
        tournament: string,
    ): Promise<boolean> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.previousTournamentCache = {};
            this.championsCache = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }

        if (this.previousTournamentCache[tournament] == null) {
            const tourney = await Competition.findOneByOrFail({
                tag: tournament,
            });
            const previousTourney = await Competition.findOne({
                where: {
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

        const previousTournament = this.previousTournamentCache[tournament];

        if (previousTournament === false) {
            return false;
        }

        if (this.championsCache[previousTournament] == null) {
            const winnersOfComp = await CompetitionPlacement.findBy({
                competition: previousTournament,
                placement: 1,
            });
            this.championsCache[previousTournament] = winnersOfComp.map(
                (player) => player.player,
            );
        }

        return this.championsCache[previousTournament].includes(playerUUID);
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
            (await this.isChampionOfPreviousTournament(
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
            (await this.isChampionOfPreviousTournament(
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
