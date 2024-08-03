import { Player } from "~/server/model/Player";
import type {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { Match } from "~/server/model/Match";
import { In, IsNull, Not } from "typeorm";

export class MissingVODs implements DatabaseCheck {
    info: CheckInfo = {
        id: "vods",
        name: "Missing VODs",
        description: "Checks for matches that have no assigned VOD",
    };

    private uuidsToPlayers: Record<string, string> = {};

    async execute(
        ignoredCompetitions: string[],
        knownIssues: string[],
    ): Promise<CheckResult> {
        this.uuidsToPlayers = {};
        const players = await Player.find({
            select: ["uuid", "primaryName"],
        });
        for (const player of players) {
            this.uuidsToPlayers[player.uuid] = player.primaryName;
        }

        const matchesWithoutVODs = await Match.find({
            select: ["playerOne", "playerTwo", "competition", "round"],
            where: [
                {
                    vodLink: IsNull(),
                    competition: Not(In(ignoredCompetitions)),
                    uuid: Not(In(knownIssues)),
                },
                {
                    vodLink: "",
                    competition: Not(In(ignoredCompetitions)),
                    uuid: Not(In(knownIssues)),
                },
            ],
        });
        const matchesWithoutShoutcaster = await Match.find({
            select: ["playerOne", "playerTwo", "competition", "round"],
            where: [
                {
                    shoutcasters: IsNull(),
                    competition: Not(In(ignoredCompetitions)),
                    uuid: Not(In(knownIssues)),
                },
                {
                    shoutcasters: "",
                    competition: Not(In(ignoredCompetitions)),
                    uuid: Not(In(knownIssues)),
                },
            ],
        });

        const errors = matchesWithoutShoutcaster.map((match) => {
            return `Match ${this.uuidsToPlayers[match.playerOne]} vs ${
                this.uuidsToPlayers[match.playerTwo]
            } (${match.competition} ${
                match.round
            }) has no assigned shoutcasters.`;
        });

        const issues = matchesWithoutVODs.map((match) => {
            return `Match ${this.uuidsToPlayers[match.playerOne]} vs ${
                this.uuidsToPlayers[match.playerTwo]
            } (${match.competition} ${match.round}) has no assigned VOD.`;
        });

        return { name: "Missing VODs", issues, errors };
    }
}
