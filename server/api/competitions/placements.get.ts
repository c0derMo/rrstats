import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import type { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler<Promise<ICompetitionPlacement[]>>(
    async (event) => {
        const query = getQuery<{
            tag?: string;
            player?: string;
        }>(event);
        const session = await AuthController.useSession(event);

        if (query.tag != null) {
            const isAuthenticated = await AuthController.isAuthenticated(
                session.data.discordId,
                IPermission.EDIT_COMPETITIONS,
            );
            if (!isAuthenticated) {
                throw createError({
                    statusCode: 403,
                });
            }
            return await CompetitionPlacement.findBy({
                competition: query.tag,
            });
        } else if (query.player != null) {
            const placements = await CompetitionPlacement.findBy({
                player: query.player,
            });
            const competitions = await Competition.findBy({
                tag: In(placements.map((p) => p.competition)),
            });
            placements.sort((a, b) => {
                const compA = competitions.find(
                    (c) => c.tag === a.competition,
                )!;
                const compB = competitions.find(
                    (c) => c.tag === b.competition,
                )!;
                return compB.startingTimestamp - compA.startingTimestamp;
            });
            return placements;
        } else {
            throw createError({
                statusCode: 400,
                statusMessage: "competition tag or player must be set in query",
            });
        }
    },
);
