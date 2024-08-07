import { Match } from "~/server/model/Match";
import { Player } from "../../model/Player";
import { In } from "typeorm";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.uuid !== undefined) {
        const match = await Match.findOne({
            where: { uuid: query.uuid as string },
            select: [
                "bannedMaps",
                "competition",
                "platform",
                "round",
                "playedMaps",
                "playerOne",
                "playerTwo",
                "playerOneScore",
                "playerTwoScore",
                "shoutcasters",
                "vodLink",
                "timestamp",
                "annulated",
            ],
        });
        return {
            matches: [match],
            players: {},
        };
    }

    if (query.tournament === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "tournament query must be set",
        });
    }

    const matches = await Match.find({
        where: { competition: query.tournament as string },
        select: [
            "bannedMaps",
            "competition",
            "platform",
            "round",
            "playedMaps",
            "playerOne",
            "playerTwo",
            "playerOneScore",
            "playerTwoScore",
            "shoutcasters",
            "vodLink",
            "timestamp",
            "annulated",
        ],
        order: { timestamp: "DESC" },
    });

    const playerUUIDs = matches
        .map((m) => m.playerOne)
        .concat(matches.map((m) => m.playerTwo));
    const playersRaw = await Player.find({
        where: { uuid: In(playerUUIDs) },
        select: ["uuid", "primaryName"],
    });
    const players: Record<string, string> = {};
    for (const player of playersRaw) {
        players[player.uuid] = player.primaryName;
    }

    return {
        matches,
        players,
    };
});
