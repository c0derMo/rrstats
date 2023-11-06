import { Match } from '~/server/model/Match';
import { Player } from '../../model/Player';
import { In, IsNull, Not } from 'typeorm';
import HitmapsIntegration from '../../controller/HitmapsIntegration';
import { Competition } from '~/server/model/Competition';

export default defineEventHandler(async (event) => {
    const playerName = getRouterParam(event, 'player');

    const competitionsToUpdate = await Competition.find({ where: { updateWithHitmaps: true, hitmapsSlug: Not(IsNull()) }, select: ['hitmapsSlug'] });
    for (const competitionToUpdate of competitionsToUpdate) {
        await HitmapsIntegration.updateHitmapsTournament(competitionToUpdate.hitmapsSlug!, competitionToUpdate.tag);
    }

    const player = await Player.findOneBy({ primaryName: playerName });
    let matches: Match[] = [];
    let opponents: Record<string, string> = {};
    if (player != null) {
        matches = await Match.find({ where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }] });
        const rawOpponentUUIDs = matches.map(m => m.playerOne)
            .concat(matches.map(m => m.playerTwo));
        const rawOpponents = await Player.find({ where: { uuid: In(rawOpponentUUIDs) }, select: ['primaryName', 'uuid']});
        rawOpponents.forEach((op) => {
            opponents[op.uuid] = op.primaryName;
        });
    }

    return {
        ...player,
        matches,
        opponents
    };
});