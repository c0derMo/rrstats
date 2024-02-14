import HitmapsIntegration from "~/server/controller/integrations/HitmapsIntegration";
import { Competition } from "~/server/model/Competition";
import { ICompetition } from "~/utils/interfaces/ICompetition";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.tag === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "competition tag query must be set",
        });
    }

    const competition = await Competition.findOneBy({
        tag: query.tag as string,
    });

    if (competition == null) {
        return null;
    }

    let shouldRetry = false;

    if (
        competition?.updateWithHitmaps &&
        competition.hitmapsSlug !== undefined
    ) {
        const promise = HitmapsIntegration.updateHitmapsTournament(
            competition.hitmapsSlug,
            competition.tag,
        );
        if (query.initialLoad == null) {
            await promise;
        } else {
            shouldRetry = true;
        }
    }

    return {
        ...competition,
        shouldRetry: shouldRetry
    } as ICompetition & { shouldRetry: boolean };
});
