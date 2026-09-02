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
                "match.timestamp",
                "match.playerOne",
                "match.playerOneScore",
                "match.playerTwo",
                "match.playerTwoScore",
                "map.winner",
                "map.index",
            ])
            .getMany();

        const data = new DefaultedMap<string, { sweeps: number; last: number }>(
            () => {
                return { sweeps: 0, last: -1 };
            },
        );

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
                    data.get(match.playerOne).sweeps += 1;
                    data.get(match.playerOne).last = Math.max(
                        data.get(match.playerOne).last,
                        match.timestamp,
                    );
                } else if (winner === WinningPlayer.PLAYER_TWO) {
                    data.get(match.playerTwo).sweeps += 1;
                    data.get(match.playerTwo).last = Math.max(
                        data.get(match.playerTwo).last,
                        match.timestamp,
                    );
                }
            }
        }

        const result: LeaderboardRow[] = data.mapAll((player, sweepData) => {
            return {
                columns: {
                    Player: player,
                    "Reverse Sweeps": sweepData.sweeps,
                    "Last Reverse Sweep": sweepData.last,
                },
                value: sweepData.sweeps,
                order: 0,
            };
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches reverse swept (6+ points)",
            category: "player",
            subcategory: "Sweeps",
            explanatoryText:
                "Winning the match with 6 or more points after losing the first half of the maps.",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Reverse Sweeps", type: LeaderboardColumnType.TEXT },
                {
                    name: "Last Reverse Sweep",
                    type: LeaderboardColumnType.DATE,
                    sortable: true,
                },
            ],
        };
    }
}
