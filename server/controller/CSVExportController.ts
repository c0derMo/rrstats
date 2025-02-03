import { DateTime } from "luxon";
import { Match } from "../model/Match";
import { getMap } from "~/utils/mapUtils";
import { ChoosingPlayer, WinningPlayer } from "~/utils/interfaces/IMatch";
import { Player } from "../model/Player";
import { type Stringifier, stringify } from "csv-stringify";
import MapperService from "./MapperService";
import { In } from "typeorm";

export default class CSVExportController {
    private static playerLookup: Record<string, string> = {};

    static async exportPlayersMatches(player: string): Promise<Stringifier> {
        await this.regeneratePlayerLookup();

        const matches = await Match.find({
            where: [{ playerOne: player }, { playerTwo: player }],
            order: { timestamp: "DESC" },
        });

        return this.matchesToCsv(matches);
    }

    static async exportCompetitionMatches(
        competitions: string[],
    ): Promise<Stringifier> {
        await this.regeneratePlayerLookup();

        const matches = await Match.find({
            where: { competition: In(competitions) },
            order: { timestamp: "DESC" },
        });

        return this.matchesToCsv(matches);
    }

    private static async matchesToCsv(matches: Match[]): Promise<Stringifier> {
        const csvMatches = matches.map((m) => this.transformMatchToRow(m));

        const csvHeaders: string[] = ["competition"];
        if (csvMatches.some((m) => m.platform !== "")) {
            csvHeaders.push("platform");
        }
        csvHeaders.push(
            "datetime",
            "round",
            "playerOne",
            "playerOneScore",
            "playerTwo",
            "playerTwoScore",
        );

        let maxBans = 0;
        let maxMaps = 0;
        for (const match of matches) {
            maxBans = Math.max(maxBans, match.bannedMaps.length);
            maxMaps = Math.max(maxMaps, match.playedMaps.length);
        }

        for (let i = 0; i < maxBans; i++) {
            csvHeaders.push(`ban${i}Map`, `ban${i}By`);
        }
        for (let i = 0; i < maxMaps; i++) {
            csvHeaders.push(
                `map${i}Map`,
                `map${i}Winner`,
                `map${i}PickedBy`,
                `map${i}Time`,
            );
        }

        return stringify(csvMatches, { header: true, columns: csvHeaders });
    }

    private static async regeneratePlayerLookup() {
        const players = await Player.find({ select: ["primaryName", "uuid"] });
        this.playerLookup = MapperService.createStringMapFromList(
            players,
            "uuid",
            "primaryName",
        );
    }

    private static transformMatchToRow(match: Match): Record<string, string> {
        const result: Record<string, string> = {
            competition: match.competition,
            platform: match.platform ?? "",
            datetime:
                DateTime.fromMillis(match.timestamp).toISO({
                    suppressMilliseconds: true,
                    includePrefix: false,
                }) ?? "",
            round: match.round,
            playerOne: this.playerLookup[match.playerOne],
            playerOneScore: match.playerOneScore.toString(),
            playerTwo: this.playerLookup[match.playerTwo],
            playerTwoScore: match.playerTwoScore.toString(),
        };

        for (const banIdx in match.bannedMaps) {
            result[`ban${banIdx}Map`] =
                getMap(match.bannedMaps[banIdx].map)?.abbreviation ?? "";
            switch (match.bannedMaps[banIdx].picked) {
                case ChoosingPlayer.PLAYER_ONE:
                    result[`ban${banIdx}By`] =
                        this.playerLookup[match.playerOne];
                    break;
                case ChoosingPlayer.PLAYER_TWO:
                    result[`ban${banIdx}By`] =
                        this.playerLookup[match.playerTwo];
                    break;
                case ChoosingPlayer.RANDOM:
                    result[`ban${banIdx}By`] = "RNG";
                    break;
            }
        }

        const maps = match.playedMaps.toSorted((a, b) => a.index - b.index);

        for (const playIdx in maps) {
            result[`map${playIdx}Map`] =
                getMap(maps[playIdx].map)?.abbreviation ?? "";
            switch (maps[playIdx].winner) {
                case WinningPlayer.PLAYER_ONE:
                    result[`map${playIdx}Winner`] =
                        this.playerLookup[match.playerOne];
                    break;
                case WinningPlayer.PLAYER_TWO:
                    result[`map${playIdx}Winner`] =
                        this.playerLookup[match.playerTwo];
                    break;
                case WinningPlayer.DRAW:
                    result[`map${playIdx}Winner`] = "Draw";
                    break;
            }
            switch (maps[playIdx].picked) {
                case ChoosingPlayer.PLAYER_ONE:
                    result[`map${playIdx}PickedBy`] =
                        this.playerLookup[match.playerOne];
                    break;
                case ChoosingPlayer.PLAYER_TWO:
                    result[`map${playIdx}PickedBy`] =
                        this.playerLookup[match.playerTwo];
                    break;
                case ChoosingPlayer.RANDOM:
                    result[`map${playIdx}PickedBy`] = "RNG";
                    break;
            }
            result[`map${playIdx}Time`] = maps[playIdx].timeTaken.toString();
        }

        return result;
    }
}
