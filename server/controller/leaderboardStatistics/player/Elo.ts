import type {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

interface EloPlayerInfo {
    elo: number;
    amountMatches: number;
    playedRRs: Set<string>;
}

export class PlayerElo implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Elo rating";
    hasMaps = false;
    explanatoryText =
        "Elo score based on In4Fun's formula. Note: Players playing on multiple platforms are combined here, which may cause inconsistencies with In4Fun's Elo sheet.";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
        comps: ICompetition[],
    ): LeaderboardPlayerEntry[] {
        if (matches.length <= 0) {
            return [];
        }

        const sortedMatches = filterForfeitMatches(matches);

        let playerInfo: Record<string, EloPlayerInfo> = {};
        let lastCompetition = sortedMatches[0].competition;

        for (const match of sortedMatches) {
            if (match.competition != lastCompetition) {
                playerInfo = this.decayElo(playerInfo, lastCompetition);
                lastCompetition = match.competition;
            }

            if (playerInfo[match.playerOne] == null)
                playerInfo[match.playerOne] = {
                    elo: 1000,
                    amountMatches: 0,
                    playedRRs: new Set(),
                };
            if (playerInfo[match.playerTwo] == null)
                playerInfo[match.playerTwo] = {
                    elo: 1000,
                    amountMatches: 0,
                    playedRRs: new Set(),
                };

            const QA = Math.pow(10, playerInfo[match.playerOne].elo / 400);
            const QB = Math.pow(10, playerInfo[match.playerTwo].elo / 400);
            const expectedScore = QA / (QA + QB);
            let actualScore = 0.5;
            if (match.playerOneScore > match.playerTwoScore) {
                actualScore = 1;
            } else if (match.playerTwoScore > match.playerOneScore) {
                actualScore = 0;
            }

            const roundKFactor = this.getBaseKFactor(
                match.competition,
                match.round,
            );
            const playerOneKFactor =
                roundKFactor +
                this.getKFactorBonus(playerInfo[match.playerOne].amountMatches);
            const playerTwoKFactor =
                roundKFactor +
                this.getKFactorBonus(playerInfo[match.playerTwo].amountMatches);

            const playerOneEloChange = Math.round(
                playerOneKFactor * (actualScore - expectedScore),
            );
            const playerTwoEloChange = Math.round(
                playerTwoKFactor * (expectedScore - actualScore),
            ); // Equivalent to (1-actual) - (1-expected)

            playerInfo[match.playerOne].elo += playerOneEloChange;
            playerInfo[match.playerOne].amountMatches += 1;
            playerInfo[match.playerOne].playedRRs.add(match.competition);
            playerInfo[match.playerTwo].elo += playerTwoEloChange;
            playerInfo[match.playerTwo].amountMatches += 1;
            playerInfo[match.playerTwo].playedRRs.add(match.competition);
        }

        if (
            comps.find((c) => c.tag === lastCompetition)?.updateWithHitmaps ===
            false
        ) {
            playerInfo = this.decayElo(playerInfo, lastCompetition);
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in playerInfo) {
            result.push({
                player: player,
                displayScore: playerInfo[player].elo.toString(),
                sortingScore: playerInfo[player].elo,
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }

    private getBaseKFactor(competition: string, round: string): number {
        if (
            competition.toLowerCase().includes("wc") &&
            round.toLowerCase().includes("final")
        ) {
            return 45;
        } else if (
            competition.toLowerCase().includes("wc") &&
            round.toLowerCase().includes("round")
        ) {
            return 35;
        } else if (
            competition.toLowerCase().includes("wc") &&
            round.toLowerCase().includes("group")
        ) {
            return 25;
        } else if (round.toLowerCase().includes("final")) {
            return 40;
        }
        return 30;
    }

    private getKFactorBonus(matchesPlayed: number): number {
        if (matchesPlayed < 10) {
            return 10;
        } else if (matchesPlayed < 20) {
            return 5;
        }
        return 0;
    }

    private decayElo(
        playerInfo: Record<string, EloPlayerInfo>,
        competition: string,
    ): Record<string, EloPlayerInfo> {
        for (const player in playerInfo) {
            if (playerInfo[player].playedRRs.has(competition)) continue;

            let decayingValue = Math.abs(playerInfo[player].elo - 1000) * 0.1;
            decayingValue = this.bankersRoundingToInteger(decayingValue);
            decayingValue = Math.max(decayingValue, 5);
            decayingValue = Math.min(decayingValue, 25);
            if (playerInfo[player].elo > 1000) {
                playerInfo[player].elo -= decayingValue;
            } else if (playerInfo[player].elo < 1000) {
                playerInfo[player].elo += decayingValue;
            }
        }
        return playerInfo;
    }

    private bankersRoundingToInteger(toRound: number): number {
        const n = +toRound.toFixed(8);
        const i = Math.floor(n);
        const f = n - i;
        const e = 1e-8;
        if (f > 0.5 - e && f < 0.5 + e) {
            return i % 2 == 0 ? i : i + 1;
        } else {
            return Math.round(n);
        }
    }
}
