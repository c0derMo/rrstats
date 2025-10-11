import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { Player } from "~~/server/model/Player";

export class PlayerMatchesPlayed implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Matches played";
    hasMaps = false;

    basedOn = ["match" as const, "player" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
            .getMany();

        const matchesPerPlayer: Record<string, number> = {};

        for (const match of filterForfeitMatches(matches)) {
            matchesPerPlayer[match.playerOne] ??= 0;
            matchesPerPlayer[match.playerTwo] ??= 0;

            matchesPerPlayer[match.playerOne] += 1;
            matchesPerPlayer[match.playerTwo] += 1;
        }

        const result: LeaderboardPlayerEntry[] = [];

        for (const player of players) {
            result.push({
                player: player.uuid,
                displayScore: matchesPerPlayer[player.uuid]?.toString() ?? "0",
                sortingScore: matchesPerPlayer[player.uuid] ?? 0,
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
