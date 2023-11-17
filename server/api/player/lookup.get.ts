import { In } from 'typeorm';
import { AuthController } from '~/server/controller/AuthController';
import { Player } from '~/server/model/Player';
import { IPlayer } from '~/utils/interfaces/IPlayer';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.players === undefined && !AuthController.isAuthenticated()) {
        return createError({
            statusCode: 400,
            statusMessage: "players must be set"
        });
    }

    let rawPlayers: IPlayer[];
    if (query.players !== undefined) {
        rawPlayers = await Player.find({ where: { uuid: In(query.players as string[]) }, select: ['uuid', 'primaryName'] });
    } else if (query.names !== undefined) {
        rawPlayers = await Player.find({ where: { primaryName: In(query.names as string[] )}, select: ['uuid', 'primaryName'] });
    } else {
        rawPlayers = await Player.find({ select: ['uuid', 'primaryName'] });
    }
    const playerMap: Record<string, string> = {};
    for (const player of rawPlayers) {
        playerMap[player.uuid] = player.primaryName;
    }

    return playerMap;
});
