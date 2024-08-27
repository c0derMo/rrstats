import { In } from "typeorm";
import { Player } from "~/server/model/Player";
import type { IPlayer } from "~/utils/interfaces/IPlayer";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    console.log("Lookup queried");

    let rawPlayers: IPlayer[];
    if (query.players !== undefined) {
        if (Array.isArray(query.players)) {
            rawPlayers = await Player.find({
                where: { uuid: In(query.players as string[]) },
                select: ["uuid", "primaryName"],
            });
        } else {
            rawPlayers = await Player.find({
                where: { uuid: query.players as string },
                select: ["uuid", "primaryName"],
            });
        }
    } else if (query.names !== undefined) {
        if (Array.isArray(query.names)) {
            rawPlayers = await Player.find({
                where: { primaryName: In(query.names as string[]) },
                select: ["uuid", "primaryName"],
            });
        } else {
            rawPlayers = await Player.find({
                where: { primaryName: query.names as string },
                select: ["uuid", "primaryName"],
            });
        }
    } else {
        rawPlayers = await Player.find({ select: ["uuid", "primaryName"] });
    }
    const playerMap: Record<string, string> = {};
    for (const player of rawPlayers) {
        playerMap[player.uuid] = player.primaryName;
    }

    return playerMap;
});
