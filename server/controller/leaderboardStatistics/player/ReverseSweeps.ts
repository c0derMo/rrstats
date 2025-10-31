import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerReverseSweeps implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Reverse sweeps";
    hasMaps = false;
    explanatoryText =
        "Winning the match with 6 or more points after losing the first half of the maps.";

    basedOn = ["match" as const, "map" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
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

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in playerMap) {
            result.push({
                player: player,
                sortingScore: playerMap[player],
                displayScore: playerMap[player].toString(),
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
