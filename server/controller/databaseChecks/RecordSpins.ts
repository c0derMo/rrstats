import { Player } from "~/server/model/Player";
import { CheckInfo, CheckResult, DatabaseCheck } from "../DatabaseCheckController";
import { MapRecord } from "~/server/model/Record";
import { Match } from "~/server/model/Match";
import { getMap } from "~/utils/mapUtils";
import { DateTime } from "luxon";
import { IMapRecord } from "~/utils/interfaces/IRecord";
import { IMatch } from "~/utils/interfaces/IMatch";

export class RecordSpins implements DatabaseCheck {
    info: CheckInfo = {
        id: "record_spins",
        name: "Records without spins",
        description: "Checks for map records that don't have a spin assigned",
    };

    private uuidsToPlayers: Record<string, string> = {};

    async execute(): Promise<CheckResult> {
        this.uuidsToPlayers = {};
        const players = await Player.find({
            select: ['uuid', 'primaryName']
        });
        for (const player of players) {
            this.uuidsToPlayers[player.uuid] = player.primaryName;
        }

        const issues: string[] = [];
        const errors: string[] = [];

        const mapRecords = await MapRecord.find({
            select: ['match', 'map', 'player', 'timestamp', 'mapIndex'],
        });
        for (const record of mapRecords) {
            const match = await Match.findOne({
                select: ['playerOne', 'playerTwo', 'competition', 'round', 'playedMaps'],
                where: { uuid: record.match }
            });

            if (match == null) {
                issues.push(`${this.formatMapRecord(record)} has nonexistant match assigned: ${record.match}`);
                continue;
            }

            if (match.playedMaps[record.mapIndex]?.spin == null) {
                errors.push(`${this.formatMapRecord(record)} has no spin in the assigned match ${this.formatMatch(match)}`)
            }
        }

        return { name: "Records without spins", issues, errors };
    };

    private formatMapRecord(record: IMapRecord) {
        return `Record ${getMap(record.map)!.name} (${DateTime.fromMillis(record.timestamp).toISO({ includeOffset: false })}) by ${this.uuidsToPlayers[record.player]}`;
    }

    private formatMatch(match: IMatch) {
        return `${this.uuidsToPlayers[match.playerOne]} vs ${this.uuidsToPlayers[match.playerTwo]} (${match.competition}, ${match.round})`
    }
}