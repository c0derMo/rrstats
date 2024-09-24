import { Raw } from "typeorm";
import { Player } from "../../model/Player";
import DiscordAvatarIntegration from "~/server/controller/integrations/DiscordAvatarIntegration";

export default defineEventHandler<Promise<string>>(async (event) => {
    const query = getQuery<{
        player?: string;
    }>(event);

    const player = await Player.findOneBy({
        primaryName: Raw((player) => `LOWER(${player}) = :name`, {
            name: (query.player ?? "").toLowerCase(),
        }),
    });

    if (player === null) {
        return await DiscordAvatarIntegration.getProfilePicture("");
    }
    return await DiscordAvatarIntegration.getProfilePicture(
        player.discordId ?? "",
    );
});
