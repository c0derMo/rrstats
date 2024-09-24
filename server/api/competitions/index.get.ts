import HitmapsIntegration from "~/server/controller/integrations/HitmapsIntegration";
import { Competition } from "~/server/model/Competition";
import type { ICompetition } from "~/utils/interfaces/ICompetition";
import type { Retryable } from "~/utils/interfaces/Retryable";

export default defineEventHandler<Promise<Retryable<ICompetition> | null>>(
    async (event) => {
        const query = getQuery<{
            tag?: string;
            initialLoad?: string;
        }>(event);

        if (query.tag == null) {
            throw createError({
                statusCode: 400,
                statusMessage: "competition tag query must be set",
            });
        }

        const competition = await Competition.findOneBy({
            tag: query.tag,
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
            shouldRetry: shouldRetry,
        };
    },
);
