import { type FindOptionsSelect, In } from "typeorm";
import { Match } from "~/server/model/Match";
import type { IMatch } from "~/utils/interfaces/IMatch";

const selectedFields = [
    "uuid",
    "timestamp",
    "playerOne",
    "playerTwo",
    "playerOneScore",
    "playerTwoScore",
    "annulated",
    "competition",
    "round",
    "platform",
    "bannedMaps",
    "notes",
    "shoutcasters",
    "vodLink",
    "playedMaps",
] as FindOptionsSelect<Match>;

export default defineEventHandler<Promise<IMatch[] | IMatch | null>>(
    async (event) => {
        const query = getQuery<{
            uuid?: string;
            tournament?: string;
            player?: string;
            players?: string[];
        }>(event);

        if (query.uuid != null) {
            const match = await Match.findOne({
                where: { uuid: query.uuid },
                select: selectedFields,
            });
            return match;
        } else if (query.tournament != null) {
            const matches = await Match.find({
                where: { competition: query.tournament },
                select: selectedFields,
                order: { timestamp: "DESC" },
            });
            return matches;
        } else if (query.player != null) {
            const matches = await Match.find({
                where: [
                    { playerOne: query.player },
                    { playerTwo: query.player },
                ],
                select: selectedFields,
                order: { timestamp: "DESC" },
            });
            return matches;
        } else if (query.players != null) {
            const matches = await Match.find({
                where: {
                    playerOne: In(query.players),
                    playerTwo: In(query.players),
                },
                select: selectedFields,
                order: { timestamp: "DESC" },
            });
            return matches;
        } else {
            throw createError({
                statusCode: 400,
                statusMessage:
                    "tournament, players or uuid must be set in query",
            });
        }
    },
);
