import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import { Player } from "~/server/model/Player";
import { MapRecord } from "~/server/model/Record";
import { getMapByName } from "~/utils/mapUtils";
import type { MapResponse } from "../APITypes";

export default defineEventHandler<MapResponse>(async (event) => {
    const authHeader = getRequestHeader(event, "authorization");

    if (!(await AuthController.isValidAPIKey(authHeader))) {
        throw createError({
            statusCode: 403,
        });
    }

    const mapName = decodeURIComponent(getRouterParam(event, "map") as string);

    const map = getMapByName(mapName ?? "");
    if (map == null) {
        throw createError({
            statusCode: 404,
        });
    }

    const recordTime = await MapRecord.findOne({
        where: { map: map.map },
        order: { timestamp: "DESC" },
        select: ["time"],
    });
    if (recordTime == null) {
        throw createError({
            statusCode: 404,
        });
    }

    const allRecords = await MapRecord.findBy({
        map: map.map,
        time: recordTime.time,
    });

    const playersToQuery = allRecords.map((record) => record.player);
    const matchesToQuery = allRecords.map((record) => record.match);

    const queriedPlayers = await Player.find({
        select: ["primaryName", "uuid"],
        where: { uuid: In(playersToQuery) },
    });
    const playerLookupMap: Record<string, string> = {};
    for (const player of queriedPlayers) {
        playerLookupMap[player.uuid] = player.primaryName;
    }
    const queriedMatches = await Match.find({
        select: ["competition", "uuid"],
        where: { uuid: In(matchesToQuery) },
    });
    const matchLookupMap: Record<string, string> = {};
    for (const match of queriedMatches) {
        matchLookupMap[match.uuid] = match.competition;
    }

    return {
        map: map.name,
        time: recordTime.time,
        players: allRecords.map(
            (record) => playerLookupMap[record.player] ?? "unknown player",
        ),
        competitions: allRecords.map(
            (record) => matchLookupMap[record.match] ?? "unknown competition",
        ),
    };
});
