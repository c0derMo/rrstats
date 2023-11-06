import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const rawPlayers = await Player.find({ select: ['primaryName'] });

    return rawPlayers.map(p => p.primaryName);
});