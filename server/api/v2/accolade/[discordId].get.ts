import { AuthController } from "~~/server/controller/AuthController";
import { Player } from "~~/server/model/Player";
import type { AccoladeResponse } from "../APITypes";

export default defineEventHandler<AccoladeResponse>(async (event) => {
    const authHeader = getRequestHeader(event, "authorization");

    if (!(await AuthController.isValidAPIKey(authHeader))) {
        throw createError({
            statusCode: 403,
        });
    }

    const playerDiscordId = getRouterParam(event, "discordId");
    if (playerDiscordId == null || playerDiscordId === "") {
        throw createError({
            statusCode: 400,
            statusMessage: "discordId must be set",
        });
    }

    const player = await Player.findOne({
        select: ["uuid", "defaultAccolade", "accolade"],
        where: { discordId: playerDiscordId },
    });
    if (player == null) {
        return "Roulette Rookie";
    }

    return player.accolade;

    // if (
    //     player.accolade != null
    // ) {
    //     return player.title;
    // }

    // const officialCompetitions = await Competition.find({
    //     select: ["tag"],
    //     where: { officialCompetition: true },
    // });
    // const placements = await CompetitionPlacement.countBy({
    //     player: player.uuid,
    //     competition: In(officialCompetitions.map((c) => c.tag)),
    // });
    // if (placements > 0) {
    //     return "Returning Rival";
    // } else {
    //     return "Roulette Rookie";
    // }
});
