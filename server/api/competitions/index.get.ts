import HitmapsIntegration from "~/server/controller/HitmapsIntegration";
import { Competition } from "~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.tag === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'competition tag query must be set'
        });
    }

    const competition = await Competition.findOneBy({ tag: query.tag as string });
    if (competition?.updateWithHitmaps && competition.hitmapsSlug !== undefined) {
        await HitmapsIntegration.updateHitmapsTournament(competition.hitmapsSlug);
    }

    return competition;
});