import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import MapperService from "~/server/controller/MapperService";
import PlayerStatisticController from "~/server/controller/PlayerStatisticController";
import { Player } from "~/server/model/Player";
import type { IMatch } from "~/utils/interfaces/IMatch";

type ExtendedMatch = IMatch & {
    playerOneDiscord: string;
    playerTwoDiscord: string;
};

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
        select: ["uuid"],
        where: { discordId: playerDiscordId },
    });
    if (player == null) {
        throw createError({
            statusCode: 404,
        });
    }

    const statistics = await PlayerStatisticController.get(player.uuid);

    const playersToQuery = [
        statistics.debutMatch?.playerOne,
        statistics.debutMatch?.playerTwo,
        ...statistics.mapPBs.map((pb) => pb.match?.playerOne),
        ...statistics.mapPBs.map((pb) => pb.match?.playerTwo),
    ].filter((v) => v != null);

    const players = await Player.find({
        select: ["uuid", "discordId"],
        where: { uuid: In(playersToQuery) },
    });
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "discordId",
    );

    if (statistics.debutMatch != null) {
        (statistics.debutMatch as ExtendedMatch).playerOneDiscord =
            playerLookupMap[statistics.debutMatch.playerOne] ?? "";
        (statistics.debutMatch as ExtendedMatch).playerTwoDiscord =
            playerLookupMap[statistics.debutMatch.playerTwo] ?? "";
    }

    for (const pb of statistics.mapPBs) {
        if (pb.match == null) {
            continue;
        }

        (pb.match as ExtendedMatch).playerOneDiscord =
            playerLookupMap[pb.match.playerOne] ?? "";
        (pb.match as ExtendedMatch).playerTwoDiscord =
            playerLookupMap[pb.match.playerTwo] ?? "";
    }

    return statistics;
});
