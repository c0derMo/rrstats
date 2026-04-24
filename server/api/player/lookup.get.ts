import { In } from "typeorm";
import { validate } from "uuid";
import { Player } from "~~/server/model/Player";

export default defineEventHandler<Promise<Record<string, string>>>(
    async (event) => {
        const query = getQuery<{
            players?: string[] | string;
            names?: string[] | string;
        }>(event);

        let rawPlayers: IPlayer[];
        if (query.players !== undefined) {
            if (Array.isArray(query.players)) {
                const validUuids = query.players.filter((player) =>
                    validate(player),
                );
                if (validUuids.length === 0) {
                    return {};
                }
                rawPlayers = await Player.find({
                    where: { uuid: In(validUuids) },
                    select: ["uuid", "primaryName"],
                });
            } else {
                if (!validate(query.players)) {
                    return {};
                }
                rawPlayers = await Player.find({
                    where: { uuid: query.players },
                    select: ["uuid", "primaryName"],
                });
            }
        } else if (query.names !== undefined) {
            if (Array.isArray(query.names)) {
                rawPlayers = await Player.find({
                    where: { primaryName: In(query.names) },
                    select: ["uuid", "primaryName"],
                });
            } else {
                rawPlayers = await Player.find({
                    where: { primaryName: query.names },
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
    },
);
