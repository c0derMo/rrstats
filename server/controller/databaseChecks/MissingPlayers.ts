import { Match } from "~~/server/model/Match";
import type {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { Player } from "~~/server/model/Player";
import { In, Not } from "typeorm";

export class MissingPlayers implements DatabaseCheck {
    info: CheckInfo = {
        id: "matches",
        name: "Matches without players",
        description:
            "Checks for matches that have players without Player-object",
    };

    async execute(
        ignoredCompetitions: string[],
        knownIssues: string[],
    ): Promise<CheckResult> {
        const allMatches = await Match.find({
            select: ["uuid", "playerOne", "playerTwo", "competition", "round"],
            where: { competition: Not(In(ignoredCompetitions)) },
        });
        const allPlayers = allMatches
            .map((m) => m.playerOne)
            .concat(allMatches.map((m) => m.playerTwo));
        const dedupedPlayers = new Set<string>(allPlayers);

        const playerObjects = await Player.find({
            select: ["uuid"],
            where: { uuid: In([...dedupedPlayers]) },
        });
        const existingUUIDs = playerObjects.map((player) => player.uuid);

        const errors: string[] = [];
        for (const uuid of dedupedPlayers) {
            if (existingUUIDs.includes(uuid)) {
                continue;
            }

            const match = allMatches.find(
                (match) => match.playerOne === uuid || match.playerTwo === uuid,
            )!;
            if (knownIssues.includes(uuid)) continue;
            errors.push(
                `Player ${uuid} has no player object but plays in ${match.uuid} (${match.competition}, ${match.round})`,
            );
        }

        return { name: "Matches without players", issues: [], errors };
    }
}
