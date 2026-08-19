import EloController from "../../EloController";
import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerElo extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const, "match" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const result: LeaderboardRow[] = [];

        for (const player of players) {
            const elo = EloController.getInstance().getEloOfPlayer(player.uuid);
            result.push({
                columns: {
                    Player: player.uuid,
                    Elo: elo,
                },
                order: 0,
                value: elo,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Elo rating",
            category: "player",
            explanatoryText:
                "Elo score based on In4Fun's formula. Note: Players playing on multiple platforms are combined here, which may cause inconsistencies with In4Fun's Elo sheet.",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Elo", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
