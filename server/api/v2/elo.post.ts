import { AuthController } from "~~/server/controller/AuthController";
import type { EloResponse } from "./APITypes";
import LeaderboardController from "~~/server/controller/LeaderboardController";
import { Player } from "~~/server/model/Player";
import { In } from "typeorm";
import MapperService from "~~/server/controller/MapperService";

export default defineEventHandler<EloResponse>(async (event) => {
    const authHeader = getRequestHeader(event, "authorization");

    if (!(await AuthController.isValidAPIKey(authHeader))) {
        throw createError({
            statusCode: 403,
        });
    }

    const players = await readBody<string[]>(event);

    if (players == null || !Array.isArray(players)) {
        throw createError({
            statusCode: 400,
        });
    }

    const lookupPlayers = await Player.find({
        where: {
            discordId: In(players),
        },
        select: ["uuid", "discordId"]
    });
    const discordToPlayer = MapperService.createStringMapFromList(lookupPlayers, "discordId", "uuid");

    const eloLB = await LeaderboardController.getEntries("Elo rating") as LeaderboardPlayerEntry[];
    const result: { discordId: string; elo: number }[] = [];
    for (const player of players) {
        const playerElo = eloLB.find((lb) => lb.player === discordToPlayer[player]);
        result.push({
            discordId: player,
            elo: playerElo?.sortingScore ?? 1000
        });
    }

    return result;
});