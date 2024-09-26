import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import { Player } from "~/server/model/Player";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { PlayerResponse } from "../APITypes";

export default defineEventHandler<PlayerResponse>(async (event) => {
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

    const matches = await Match.find({
        select: [
            "timestamp",
            "playerOne",
            "playerTwo",
            "playerOneScore",
            "playerTwoScore",
            "competition",
            "round",
            "platform",
            "playedMaps",
            "bannedMaps",
        ],
        where: [{ playerOne: player.uuid }, { playerTwo: player.uuid }],
    });

    const playersToQuery = [
        ...matches.map((m) => m.playerOne),
        ...matches.map((m) => m.playerTwo),
    ];
    const players = await Player.find({
        select: ["uuid", "discordId"],
        where: { uuid: In(playersToQuery) },
    });
    const playerLookupMap: Record<string, string> = {};
    for (const lookedUpPlayer of players) {
        playerLookupMap[lookedUpPlayer.uuid] = lookedUpPlayer.discordId ?? "";
    }

    const returnableMatches: (IMatch & {
        playerOneDiscord: string;
        playerTwoDiscord: string;
    })[] = [];
    for (const match of matches) {
        const newMatch = match as IMatch & {
            playerOneDiscord?: string;
            playerTwoDiscord?: string;
        };
        newMatch.playerOneDiscord = playerLookupMap[newMatch.playerOne];
        newMatch.playerTwoDiscord = playerLookupMap[newMatch.playerTwo];
        returnableMatches.push(
            newMatch as IMatch & {
                playerOneDiscord: string;
                playerTwoDiscord: string;
            },
        );
    }

    return returnableMatches;
});
