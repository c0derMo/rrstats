import { Match } from "~/server/model/Match";
import { Player } from "../../model/Player";
import { In, IsNull, Not, Raw } from "typeorm";
import HitmapsIntegration from "../../controller/integrations/HitmapsIntegration";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import type { ICompetition } from "~/utils/interfaces/ICompetition";
import MapperService from "~/server/controller/MapperService";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    let playerName;
    if (query.player !== undefined) {
        playerName = query.player as string;
    } else {
        playerName = "";
    }

    const initialLoad = query.initialLoad != null;
    let shouldRetry = false;

    const competitionsToUpdate = await Competition.find({
        where: { updateWithHitmaps: true, hitmapsSlug: Not(IsNull()) },
        select: ["hitmapsSlug", "tag"],
    });
    for (const competitionToUpdate of competitionsToUpdate) {
        const updateRequest = HitmapsIntegration.updateHitmapsTournament(
            competitionToUpdate.hitmapsSlug!,
            competitionToUpdate.tag,
        );
        if (!initialLoad) {
            await updateRequest;
        } else {
            shouldRetry = true;
        }
    }

    const player = await Player.findOneBy({
        primaryName: Raw((player) => `LOWER(${player}) = :name`, {
            name: playerName.toLowerCase(),
        }),
    });
    let matches: Match[] = [];
    const opponents: Record<string, string> = {};
    let placements: CompetitionPlacement[] = [];
    let competitions: Record<string, ICompetition> = {};
    if (player != null) {
        matches = await Match.find({
            where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }],
            order: { timestamp: "DESC" },
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
        const rawCompetitions = await Competition.find({
            select: ["tag", "name", "officialCompetition", "startingTimestamp"],
            where: { tag: In(placements.map((p) => p.competition)) },
        });
        competitions = MapperService.createStringMapFromList(
            rawCompetitions,
            "tag",
        ) as Record<string, ICompetition>;
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
        shouldRetry,
    };
});
