import { Player } from "~/server/model/Player";
import type {
    CheckInfo,
    CheckResult,
    DatabaseCheck,
} from "../DatabaseCheckController";
import { GenericRecord, MapRecord } from "~/server/model/Record";
import { Match } from "~/server/model/Match";
import { getMap } from "~/utils/mapUtils";
import { DateTime } from "luxon";

export class RecordMatches implements DatabaseCheck {
    info: CheckInfo = {
        id: "record_matches",
        name: "Record matches",
        description:
            "Checks the matches assigned to records for incorrect maps / players",
    };

    private uuidsToPlayers: Record<string, string> = {};

    async execute(
        ignoredCompetitions: string[],
        knownIssues: string[],
    ): Promise<CheckResult> {
        this.uuidsToPlayers = {};
        const players = await Player.find({
            select: ["uuid", "primaryName"],
        });
        for (const player of players) {
            this.uuidsToPlayers[player.uuid] = player.primaryName;
        }

        const errors: string[] = [];
        const issues: string[] = [];

        const mapRecords = await MapRecord.find({
            select: ["match", "map", "player", "timestamp", "mapIndex"],
        });
        for (const record of mapRecords) {
            if (knownIssues.includes(`${record.map}:${record.timestamp}`))
                continue;
            const match = await Match.findOne({
                select: ["uuid", "playerOne", "playerTwo", "playedMaps"],
                where: { uuid: record.match },
            });

            if (match == null) {
                errors.push(
                    `${this.formatMapRecord(
                        record,
                    )} has a match assigned that doesn't exist! ${
                        record.match
                    }`,
                );
                continue;
            }

            if (
                match.playerOne !== record.player &&
                match.playerTwo !== record.player
            ) {
                errors.push(
                    `${this.formatMapRecord(
                        record,
                    )} has a match assigned played by ${
                        this.uuidsToPlayers[match.playerOne]
                    } vs ${this.uuidsToPlayers[match.playerTwo]}`,
                );
            }

            if (!match.playedMaps.some((map) => map.map === record.map)) {
                errors.push(
                    `${this.formatMapRecord(
                        record,
                    )} has a match assigned without ${
                        getMap(record.map)!.name
                    } played!`,
                );
            }

            if (match.playedMaps[record.mapIndex].map !== record.map) {
                issues.push(
                    `${this.formatMapRecord(
                        record,
                    )} has a map index assigned pointing to ${
                        getMap(match.playedMaps[record.mapIndex].map)!.name
                    }`,
                );
            }
        }

        const genericRecords = await GenericRecord.find({
            select: ["match", "record", "players", "timestamp", "maps"],
        });
        for (const record of genericRecords) {
            if (knownIssues.includes(`${record.record}:${record.timestamp}`))
                continue;
            const match = await Match.findOne({
                select: ["uuid", "playerOne", "playerTwo", "playedMaps"],
                where: { uuid: record.match },
            });

            if (match == null) {
                errors.push(
                    `${this.formatGenericRecord(
                        record,
                    )} has a match assigned that doesn't exist! ${
                        record.match
                    }`,
                );
                continue;
            }

            if (
                !record.players.includes(match.playerOne) ||
                !record.players.includes(match.playerTwo)
            ) {
                errors.push(
                    `${this.formatGenericRecord(
                        record,
                    )} has a match assigned played by ${
                        this.uuidsToPlayers[match.playerOne]
                    } vs ${this.uuidsToPlayers[match.playerTwo]}`,
                );
            }

            const playedMapCounts: Record<number, number> = {};
            const recordMapCounts: Record<number, number> = {};
            for (const map of match.playedMaps) {
                if (playedMapCounts[map.map] == undefined) {
                    playedMapCounts[map.map] = 0;
                }
                playedMapCounts[map.map] += 1;
            }
            for (const map of record.maps) {
                if (recordMapCounts[map.map] == undefined) {
                    recordMapCounts[map.map] = 0;
                }
                recordMapCounts[map.map] += 1;
            }

            for (const mapString of Object.keys(recordMapCounts)) {
                const map = parseInt(mapString);
                if ((playedMapCounts[map] || 0) < recordMapCounts[map]) {
                    issues.push(
                        `${this.formatGenericRecord(record)} requires ${
                            recordMapCounts[map]
                        } ${getMap(map)!.name}'s, but assigned match has ${
                            playedMapCounts[map] || 0
                        }`,
                    );
                }
            }
        }

        return { name: "Record matches", issues, errors };
    }

    private formatMapRecord(record: MapRecord) {
        return `Record ${getMap(record.map)!.name} (${DateTime.fromMillis(
            record.timestamp,
        ).toISO({ includeOffset: false })}) by ${
            this.uuidsToPlayers[record.player]
        }`;
    }

    private formatGenericRecord(record: GenericRecord) {
        const players = record.players
            .map((player) => this.uuidsToPlayers[player])
            .join(", ");
        return `Record ${record.record} (${DateTime.fromMillis(
            record.timestamp,
        ).toISO({ includeOffset: false })}) by ${players}`;
    }
}
