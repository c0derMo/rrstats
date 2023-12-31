import { In } from "typeorm";
import { Match } from "~/server/model/Match";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.players === undefined || !Array.isArray(query.players)) {
        throw createError({
            statusCode: 400,
            statusMessage: "players must be set and an array",
        });
    }

    const matches = await Match.find({
        where: { playerOne: In(query.players as string[] ), playerTwo: In(query.players as string[]) },
        select: [
            "uuid",
            "competition",
            "playerOne",
            "playerTwo",
            "playedMaps",
            "round",
            "playerOneScore",
            "playerTwoScore"
        ]
    });

    return matches;
});