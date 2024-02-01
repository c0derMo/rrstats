import { Player } from "~/server/model/Player";
import {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { CompetitionPlacement } from "~/server/model/Competition";
import { Match } from "~/server/model/Match";

export class MissingPlacements implements DatabaseCheck {
    info: CheckInfo = {
        id: "placements",
        name: "Missing placements",
        description:
            "Checks for players that have matches in a tournament, but no assigned placement",
    };

    async execute(): Promise<CheckResult> {
        const players = await Player.find({
            select: ["uuid", "primaryName"],
        });
        const uuidsToPlayers: Record<string, string> = {};
        for (const player of players) {
            uuidsToPlayers[player.uuid] = player.primaryName;
        }

        const issues: string[] = [];

        for (const player of players) {
            const playedComps = await Match.createQueryBuilder("match")
                .distinct(true)
                .select("match.competition")
                .where("match.playerOne = :player", { player: player.uuid })
                .orWhere("match.playerTwo = :player", { player: player.uuid })
                .getMany();
            const placements = (
                await CompetitionPlacement.find({
                    select: ["competition"],
                    where: { player: player.uuid },
                })
            ).map((placement) => placement.competition);

            for (const competition of playedComps) {
                if (!placements.includes(competition.competition)) {
                    issues.push(
                        `Player ${player.primaryName} is missing placement for competition ${competition.competition}`,
                    );
                }
            }
        }

        return { name: "Missing placements", issues, errors: [] };
    }
}
