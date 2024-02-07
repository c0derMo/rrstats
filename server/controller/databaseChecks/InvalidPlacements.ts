import { CompetitionPlacement } from "~/server/model/Competition";
import { CheckInfo, CheckResult, DatabaseCheck } from "../DatabaseCheckController";
import { In, Not } from "typeorm";
import { Player } from "~/server/model/Player";

export class InvalidPlacements implements DatabaseCheck {
    info: CheckInfo = {
        id: "invalidPlacements",
        name: "Invalid placements",
        description: "Checks for placements to nonexistant players"
    };

    async execute(ignoredCompetitions: string[]): Promise<CheckResult> {
        const placements = await CompetitionPlacement.find({
            where: { competition: Not(In(ignoredCompetitions)) }
        });
        const players = (await Player.find({
            select: ['uuid']
        })).map(p => p.uuid);

        const errors: string[] = [];
        for (const placement of placements) {
            if (!players.includes(placement.player)) {
                errors.push(`${placement.competition} has placement for ${placement.player} (${placement.placement ?? "GS"}), who doesnt exist`);
            }
        }

        return { name: "Invalid placements", issues: [], errors };
    }
}