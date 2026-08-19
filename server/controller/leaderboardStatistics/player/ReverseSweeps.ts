import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerReverseSweeps extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    }

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select([
                "match.playerOne",
                "match.playerOneScore",
                "match.playerTwo",
                "match.playerTwoScore",
                "map.winner",
                "map.index",
            ])
            .getMany();
        const playerMap: Record<string, number> = {};

        for (const match of matches) {
            const scoreDelta = Math.abs(
                match.playerOneScore - match.playerTwoScore,
            );
            if (scoreDelta !== 2) continue;
            if (match.playerOneScore < 6 && match.playerTwoScore < 6) continue;

            const winner =
                match.playerOneScore > match.playerTwoScore
                    ? WinningPlayer.PLAYER_ONE
                    : WinningPlayer.PLAYER_TWO;
            let isReverseSweep = true;

            match.playedMaps.sort((a, b) => a.index - b.index);

            for (let i = 0; i < Math.floor(match.playedMaps.length / 2); i++) {
                if (
                    match.playedMaps[i].winner === winner ||
                    match.playedMaps[i].winner === WinningPlayer.DRAW
                ) {
                    isReverseSweep = false;
                    break;
                }
            }

            if (isReverseSweep) {
                if (winner === WinningPlayer.PLAYER_ONE) {
                    playerMap[match.playerOne] ??= 0;
                    playerMap[match.playerOne] += 1;
                } else if (winner === WinningPlayer.PLAYER_TWO) {
                    playerMap[match.playerTwo] ??= 0;
                    playerMap[match.playerTwo] += 1;
                }
            }
        }

        const result: LeaderboardRow[] = [];
        for (const player in playerMap) {
            result.push({
                columns: {
                    "Player": player,
                    "Reverse Sweeps": playerMap[player]
                },
                value: playerMap[player],
                order: 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Reverse sweeps",
            category: "player",
            subcategory: "Sweeps",
            explanatoryText: "Winning the match with 6 or more points after losing the first half of the maps.",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Reverse Sweeps", type: LeaderboardColumnType.TEXT },
            ]
        }
    };
}
