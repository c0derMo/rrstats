import { Player } from "~/server/model/Player";
import {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { Match } from "~/server/model/Match";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { In, Not } from "typeorm";

export class InvalidScores implements DatabaseCheck {
    info: CheckInfo = {
        id: "scores",
        name: "Invalid scores",
        description: "Checks for invalid scores, map- & match winners",
    };

    async execute(ignoredCompetitions: string[]): Promise<CheckResult> {
        const players = await Player.find({
            select: ["uuid", "primaryName"],
        });
        const uuidsToPlayers: Record<string, string> = {};
        for (const player of players) {
            uuidsToPlayers[player.uuid] = player.primaryName;
        }

        const matches = await Match.find({
            where: { competition: Not(In(ignoredCompetitions)) },
        });
        const issues: string[] = [];
        const errors: string[] = [];
        for (const match of matches) {
            // Checking for abnormal total scores
            const totalScore = match.playerOneScore + match.playerTwoScore;
            if (totalScore === 1) continue;

            if (totalScore % 2 !== 0) {
                issues.push(
                    `Match ${this.formatMatch(
                        match,
                        uuidsToPlayers,
                    )} has abnormal total score: ${match.playerOneScore} - ${
                        match.playerTwoScore
                    }`,
                );
            }

            // Checking if map wins & total score align
            let p1MapScore = 0;
            let p2MapScore = 0;
            for (const map of match.playedMaps) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    p1MapScore += 2;
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    p2MapScore += 2;
                } else if (map.winner === WinningPlayer.DRAW) {
                    p1MapScore += 1;
                    p2MapScore += 1;
                }
            }
            if (p1MapScore !== match.playerOneScore) {
                errors.push(
                    `${
                        uuidsToPlayers[match.playerOne]
                    } of match ${this.formatMatch(
                        match,
                        uuidsToPlayers,
                    )} has a score of ${
                        match.playerOneScore
                    } but won ${p1MapScore} worth of maps`,
                );
            }
            if (p2MapScore !== match.playerTwoScore) {
                errors.push(
                    `${
                        uuidsToPlayers[match.playerTwo]
                    } of match ${this.formatMatch(
                        match,
                        uuidsToPlayers,
                    )} has a score of ${
                        match.playerTwoScore
                    } but won ${p2MapScore} worth of maps`,
                );
            }
        }

        return { name: "Invalid scores", issues, errors };
    }

    private formatMatch(match: Match, uuidsToPlayers: Record<string, string>) {
        return `${uuidsToPlayers[match.playerOne]} vs ${
            uuidsToPlayers[match.playerTwo]
        } (${match.competition}, ${match.round})`;
    }
}
