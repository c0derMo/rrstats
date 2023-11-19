import { Match } from "~/server/model/Match";
import { Player } from "../../model/Player";
import { In, IsNull, Not } from "typeorm";
import HitmapsIntegration from "../../controller/HitmapsIntegration";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    let playerName;
    if (query.player !== undefined) {
        playerName = query.player as string;
    } else {
        playerName = "";
    }

    const competitionsToUpdate = await Competition.find({
        where: { updateWithHitmaps: true, hitmapsSlug: Not(IsNull()) },
        select: ["hitmapsSlug", "tag"],
    });
    for (const competitionToUpdate of competitionsToUpdate) {
        await HitmapsIntegration.updateHitmapsTournament(
            competitionToUpdate.hitmapsSlug!,
            competitionToUpdate.tag,
        );
    }

    const player = await Player.findOneBy({ primaryName: playerName });
    let matches: Match[] = [];
    const opponents: Record<string, string> = {};
    let placements: CompetitionPlacement[] = [];
    const competitions: Record<string, string> = {};
    if (player != null) {
        matches = await Match.find({
            where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }],
        });
        const rawOpponentUUIDs = matches
            .map((m) => m.playerOne)
            .concat(matches.map((m) => m.playerTwo));
        const rawOpponents = await Player.find({
            where: { uuid: In(rawOpponentUUIDs) },
            select: ["primaryName", "uuid"],
        });
        rawOpponents.forEach((op) => {
            opponents[op.uuid] = op.primaryName;
        });
        placements = await CompetitionPlacement.findBy({ player: player.uuid });
        const rawCompetitions = await Competition.findBy({
            tag: In(placements.map((p) => p.competition)),
        });
        rawCompetitions.forEach((comp) => {
            competitions[comp.tag] = comp.name;
        });
        placements.sort((a, b) => {
            const compA = rawCompetitions.find((c) => c.tag === a.competition)!;
            const compB = rawCompetitions.find((c) => c.tag === b.competition)!;
            return compB.startingTimestamp - compA.startingTimestamp;
        });
    }

    return {
        ...player,
        matches,
        opponents,
        placements,
        competitions,
    };
});
