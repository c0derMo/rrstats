import { In } from 'typeorm';
import { Player } from '~/server/model/Player';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.players === undefined) {
        return createError({
            statusCode: 400,
            statusMessage: "players must be set"
        });
    }

    const rawPlayers = await Player.find({ where: { uuid: In(query.players as string[]) }, select: ['uuid', 'primaryName'] });
    const playerMap: Record<string, string> = {};
    for (const player of rawPlayers) {
        playerMap[player.uuid] = player.primaryName;
    }

    return playerMap;
});
