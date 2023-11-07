import { Player } from '../../model/Player';
import DiscordAvatarIntegration from '~/server/controller/DiscordAvatarIntegration';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    let playerName;
    if (query.player !== undefined) {
        playerName = query.player as string;
    } else {
        playerName = "";
    }

    const player = await Player.findOneBy({ primaryName: playerName });

    if (player === null) {
        return await DiscordAvatarIntegration.getProfilePicture("");
    }
    return await DiscordAvatarIntegration.getProfilePicture(player.discordId);
});