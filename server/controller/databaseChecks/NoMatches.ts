import { Player } from "~~/server/model/Player";
import type {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { Match } from "~~/server/model/Match";

export class NoMatches implements DatabaseCheck {
    info: CheckInfo = {
        id: "players",
        name: "Players without matches",
        description: "Checks for players that no assigned matches",
    };

    async execute(
        ignoredCompetitions: string[],
        knownIssues: string[],
    ): Promise<CheckResult> {
        const allPlayers = await Player.find({
            select: ["uuid", "primaryName"],
        });

        const errors: string[] = [];
        for (const player of allPlayers) {
            const matchCount = await Match.count({
                where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }],
            });
            if (matchCount <= 0 && !knownIssues.includes(player.uuid)) {
                errors.push(
                    `Player ${player.primaryName} has no assigned matches`,
                );
            }
        }

        return { name: "Players without matches", issues: [], errors };
    }
}
