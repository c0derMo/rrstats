import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
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
        select: ["uuid", "title", "hasCustomTitle"],
        where: { discordId: playerDiscordId },
    });
    if (player == null) {
        return "Roulette Rookie";
    }

    if (
        player.title != null &&
        (player.hasCustomTitle === false || player.hasCustomTitle == null)
    ) {
        return player.title;
    }

    const officialCompetitions = await Competition.find({
        select: ["tag"],
        where: { officialCompetition: true },
    });
    const placements = await CompetitionPlacement.countBy({
        player: player.uuid,
        competition: In(officialCompetitions.map((c) => c.tag)),
    });
    if (placements > 0) {
        return "Returning Rival";
    } else {
        return "Roulette Rookie";
    }
});
