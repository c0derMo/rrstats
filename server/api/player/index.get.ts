import { Player } from "../../model/Player";
import { IsNull, Not, Raw } from "typeorm";
import HitmapsIntegration from "../../controller/integrations/HitmapsIntegration";
import { Competition } from "~/server/model/Competition";
import type { Retryable } from "~/utils/interfaces/Retryable";
import type { IPlayer } from "~/utils/interfaces/IPlayer";

export default defineEventHandler<Promise<Retryable<IPlayer>>>(
    async (event) => {
        const query = getQuery<{
            player?: string;
            uuid?: string;
            initialLoad?: string;
        }>(event);

        let playerName;
        if (query.player !== undefined) {
            playerName = query.player;
        } else {
            playerName = "";
        }

        const initialLoad = query.initialLoad != null;
        let shouldRetry = false;

        const competitionsToUpdate = await Competition.find({
            where: { updateWithHitmaps: true, hitmapsSlug: Not(IsNull()) },
            select: ["hitmapsSlug", "tag"],
        });
        for (const competitionToUpdate of competitionsToUpdate) {
            const updateRequest = HitmapsIntegration.updateHitmapsTournament(
                competitionToUpdate.hitmapsSlug!,
                competitionToUpdate.tag,
            );
            if (!initialLoad) {
                await updateRequest;
            } else {
                shouldRetry = true;
            }
        }

        let player: Player | null;
        if (query.uuid != null) {
            player = await Player.findOneBy({
                uuid: query.uuid,
            });
        } else {
            player = await Player.findOneBy({
                primaryName: Raw((player) => `LOWER(${player}) = :name`, {
                    name: playerName.toLowerCase(),
                }),
            });
        }

        if (player == null) {
            throw createError({
                statusCode: 404,
            });
        }

        return {
            ...player,
            shouldRetry,
        };
    },
);
