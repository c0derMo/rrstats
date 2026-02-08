import { Bracket } from "~~/server/model/Bracket";

export default defineEventHandler<Promise<IBracket[]>>(async (event) => {
    const query = getQuery<{
        tag: string;
    }>(event);

    if (query.tag == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "competition tag query must be set",
        });
    }

    const brackets = await Bracket.find({
        where: {
            competition: query.tag,
        },
        order: {
            index: "ASC",
        },
    });

    return brackets;
});
