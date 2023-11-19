import { Player } from "~/server/model/Player";

export default defineEventHandler(async () => {
    const rawPlayers = await Player.find({ select: ["primaryName"] });

    return rawPlayers.map((p) => p.primaryName);
});
