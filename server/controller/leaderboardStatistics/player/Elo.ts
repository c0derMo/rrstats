import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import EloController from "../../EloController";
import { Player } from "~~/server/model/Player";

export class PlayerElo implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Elo rating";
    hasMaps = false;
    explanatoryText =
        "Elo score based on In4Fun's formula. Note: Players playing on multiple platforms are combined here, which may cause inconsistencies with In4Fun's Elo sheet.";

    basedOn = ["player" as const, "match" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const result: LeaderboardPlayerEntry[] = [];

        for (const player of players) {
            const elo = EloController.getInstance().getEloOfPlayer(player.uuid);
            result.push({
                player: player.uuid,
                displayScore: elo.toString(),
                sortingScore: elo,
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
