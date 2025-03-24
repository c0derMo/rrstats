import { Match } from "../../model/Match";
import { Player } from "../../model/Player";
import { In } from "typeorm";
import { DateTime } from "luxon";
import { HitmanMap, getMapBySlug } from "../../../utils/mapUtils";
import {
    type Spin,
    WinningPlayer,
    ChoosingPlayer,
    type RRBannedMap,
} from "~/utils/interfaces/IMatch";
import { Competition } from "~/server/model/Competition";
import { Log } from "~/utils/FunctionTimer";
import { PlayedMap } from "~/server/model/PlayedMap";
import consola from "consola";
import ld from "lodash";

export interface HitmapsTournamentMatch {
    id: number;
    challongeMatchId: number;
    matchScheduledAt: string;
    matchCompletedAt: string;
    competitors: {
        id: number;
        bracketId: number;
        discordId: string;
        challongePlayerId: number;
        challongeName: string;
        countryCode: string;
    }[];
    gameModeMatchId: string | null;
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
        mapStartedAt?: string;
        resultVerifiedAt?: string;
        winnerFinishedAt?: string;
        winnerDiscordId?: string;
        mapJson?: string;
        roundType: string;
        state: string;
    }[];
    platform: string;
    round: number | null;
    rrstatsLookupId?: string;
}

interface GameModeMatchIdHitmapsTournamentMatch extends HitmapsTournamentMatch {
    gameModeMatchId: string;
}

interface NewHitmapsTournamentMatch extends HitmapsTournamentMatch {
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
        mapStartedAt: string;
        resultVerifiedAt?: string;
        winnerFinishedAt?: string;
        winnerDiscordId?: string;
        mapJson: string;
        roundType: string;
        state: string;
    }[];
}

interface HitmapsMapJson {
    type?: "KILL";
    target: {
        name: string;
        tileUrl: string;
    };
    killMethod: {
        name: string;
        tileUrl: string;
        chosen?: boolean;
        selectedVariant: string | null;
    };
    disguise: {
        name: string;
        tileUrl: string;
        chosen?: boolean;
    };
    complications: {
        name: string;
        description: string;
        tileUrl: string;
    }[];
}

interface AdditionalMatchInfo {
    mapWinners: (WinningPlayer | null)[];
    spinTimes: number[];
    spins: (Spin | null)[];
}

export interface HitmapsMatch {
    matchupId: string;
    participants: {
        publicId: string;
        name: string;
        avatarUrl: string;
        lastPing: string;
        completeTime: null;
        forfeit: boolean;
    }[];
    mapSelections: {
        id: string;
        hitmapsSlug: string;
        chosenByName: string;
        complete: boolean;
        winnerName: string;
        spin: Spin;
        mapStartedAt: string;
        winnerFinishedAt: string;
        resultVerifiedAt: string;
    }[];
}

const logger = consola.withTag("rrstats:hitmaps");

export default class HitmapsIntegration {
    private static cache: Map<string, number> = new Map();
    private static promises: Map<string, Promise<void>> = new Map();

    static async updateHitmapsTournament(
        hitmapsSlug: string,
        competitionSlug: string,
    ): Promise<void> {
        if (this.cache.has(hitmapsSlug) && !this.promises.has(hitmapsSlug)) {
            if (Date.now() - this.cache.get(hitmapsSlug)! < 90000) {
                // Cache is too old
                return;
            }
        }

        if (!this.promises.has(hitmapsSlug)) {
            this.promises.set(
                hitmapsSlug,
                new Promise((resolve) => {
                    this._updateHitmapsTournament(hitmapsSlug, competitionSlug)
                        .catch((e: Error) => {
                            logger.error(
                                `Error trying to fetch data from hitmaps: ${e.message}`,
                            );
                        })
                        .finally(() => {
                            this.promises.delete(hitmapsSlug);
                            resolve();
                        });
                }),
            );
        }

        return this.promises.get(hitmapsSlug);
    }

    @Log("HitmapsIntegration._updateHitmapsTournament", true)
    static async _updateHitmapsTournament(
        hitmapsSlug: string,
        competitionSlug: string,
    ): Promise<void> {
        try {
            const request = await $fetch<{ matches: HitmapsTournamentMatch[] }>(
                `https://tournamentsapi.hitmaps.com/api/events/${hitmapsSlug}/statistics?statsKey=MatchHistory`,
            );
            await this.parseHitmapsTournament(request.matches, competitionSlug);
            this.cache.set(hitmapsSlug, Date.now());
        } catch (e) {
            logger.log(
                "The following error occured while parsing hitmaps tournaments:",
            );
            logger.log(e);
            return;
        }
    }

    private static async fetchHitmapsMatches(
        hitmapsMatchIds: string[],
    ): Promise<HitmapsMatch[]> {
        if (hitmapsMatchIds.length <= 0) {
            return [];
        }
        if (hitmapsMatchIds.length > 200) {
            const listOne = hitmapsMatchIds.slice(0, 200);
            const listTwo = hitmapsMatchIds.slice(200);
            return (await this.fetchHitmapsMatches(listOne)).concat(
                await this.fetchHitmapsMatches(listTwo),
            );
        }
        const listOfMatches = hitmapsMatchIds.join(",");

        try {
            const request = await $fetch<{ matches: HitmapsMatch[] }>(
                `https://rouletteapi.hitmaps.com/api/match-history?matchIds=${listOfMatches}`,
            );
            return request.matches;
        } catch {
            return [];
        }
    }

    private static async createNewPlayer(
        primaryName: string,
        discordId: string,
        nationality?: string,
    ): Promise<string> {
        const player = new Player();
        player.primaryName = primaryName;
        player.discordId = discordId;
        player.alternativeNames = [];
        player.nationality = nationality?.toLowerCase();
        await player.save();
        logger.info("Creating new player " + primaryName);
        return player.uuid;
    }

    private static async createOrFindPlayer(
        discordId: string,
        name: string,
        nationality?: string,
    ): Promise<string> {
        const playerInDb = await Player.findOne({
            where: { discordId },
            select: ["primaryName", "alternativeNames", "uuid", "discordId"],
        });
        if (playerInDb === null) {
            // Player doesn't exist - creating new
            return await this.createNewPlayer(name, discordId, nationality);
        } else {
            if (playerInDb.primaryName != name) {
                const previousName = playerInDb.primaryName;
                playerInDb.primaryName = name;
                if (!playerInDb.alternativeNames.includes(previousName)) {
                    playerInDb.alternativeNames.push(previousName);
                }
                await playerInDb.save();
            }
            return playerInDb.uuid;
        }
    }

    private static async parseHitmapsTournament(
        matches: HitmapsTournamentMatch[],
        tournamentSlug: string,
    ) {
        matches.forEach((m) => {
            let lookupId = m.gameModeMatchId;
            if (lookupId == null) {
                lookupId = String(m.id);
            }
            m.rrstatsLookupId = lookupId;
        });

        // Avoid adding duplicate matches
        const existingMatches = await Match.find({
            where: {
                hitmapsMatchId: In(
                    matches.map((m) => {
                        return m.rrstatsLookupId;
                    }),
                ),
            },
            select: ["hitmapsMatchId"],
        });

        if (existingMatches.length === matches.length) {
            // We already have all matches, no new ones were added
            return;
        }

        const filteredMatches = HitmapsIntegration.filterAndSort(
            matches,
            existingMatches,
        );
        const competition = await Competition.findOneBy({
            tag: tournamentSlug,
        });

        const matchesToSave: Match[] = [];

        // New Matches
        for (const newMatch of filteredMatches.newVersion) {
            const additionalInfo = HitmapsIntegration.transformNewMatch(
                newMatch,
                competition,
            );
            matchesToSave.push(
                await HitmapsIntegration.handleMatch(
                    newMatch,
                    additionalInfo,
                    tournamentSlug,
                    competition,
                ),
            );
        }

        // Old Matches
        const hitmapsMatches = await this.fetchHitmapsMatches(
            filteredMatches.matchId.map((m) => m.gameModeMatchId),
        );

        for (const newMatch of filteredMatches.matchId) {
            const fullMatch = hitmapsMatches.find(
                (m) => m.matchupId === newMatch.gameModeMatchId,
            );
            if (!fullMatch) {
                logger.error(
                    `Got hitmaps tournament match without detailed information: ${newMatch.gameModeMatchId}`,
                );
                continue;
            }
            const additionalInfo = HitmapsIntegration.transformOldMatch(
                newMatch,
                fullMatch,
                competition,
            );
            matchesToSave.push(
                await HitmapsIntegration.handleMatch(
                    newMatch,
                    additionalInfo,
                    tournamentSlug,
                    competition,
                ),
            );
        }

        matchesToSave.sort((a, b) => a.timestamp - b.timestamp);

        for (const match of matchesToSave) {
            await match.save();
        }
    }

    private static transformOldMatch(
        match: GameModeMatchIdHitmapsTournamentMatch,
        fullMatch: HitmapsMatch,
        competition: Competition | null,
    ): AdditionalMatchInfo {
        const result = {
            spinTimes: [],
            mapWinners: [],
            spins: [],
        } as AdditionalMatchInfo;

        let pickIndex = 0;

        for (const map of match.maps) {
            if (map.selectionType === "Ban") {
                result.spinTimes.push(-1);
                result.mapWinners.push(null);
                result.spins.push(null);
                continue;
            }

            let pickedMap = fullMatch.mapSelections[pickIndex];
            while (
                !pickedMap?.complete &&
                pickIndex < fullMatch.mapSelections.length
            ) {
                pickIndex++;
                pickedMap = fullMatch.mapSelections[pickIndex];
            }

            if (pickIndex >= fullMatch.mapSelections.length) {
                break;
            }

            if (pickedMap.winnerName === match.competitors[0].challongeName) {
                result.mapWinners.push(WinningPlayer.PLAYER_ONE);
            } else if (
                pickedMap.winnerName === match.competitors[1].challongeName
            ) {
                result.mapWinners.push(WinningPlayer.PLAYER_TWO);
            } else {
                result.mapWinners.push(WinningPlayer.DRAW);
            }

            let spinTime = competition?.matchTimeoutTime ?? -1;
            if (pickedMap.mapStartedAt != null) {
                const startingTime = DateTime.fromISO(pickedMap.mapStartedAt);
                if (pickedMap.winnerFinishedAt != null) {
                    const endingTime = DateTime.fromISO(
                        pickedMap.winnerFinishedAt,
                    );
                    spinTime = Math.floor(
                        Math.abs(startingTime.diff(endingTime).as("seconds")),
                    );
                } else if (
                    pickedMap.resultVerifiedAt != null &&
                    ld.last(result.mapWinners) !== WinningPlayer.DRAW
                ) {
                    const endingTime = DateTime.fromISO(
                        pickedMap.resultVerifiedAt,
                    );
                    spinTime = Math.floor(
                        Math.abs(startingTime.diff(endingTime).as("seconds")),
                    );
                }
            }
            result.spinTimes.push(spinTime);
            result.spins.push(pickedMap.spin);
            pickIndex++;
        }

        return result;
    }

    private static transformNewMatch(
        match: NewHitmapsTournamentMatch,
        competition: Competition | null,
    ): AdditionalMatchInfo {
        const result = {
            spinTimes: [],
            mapWinners: [],
            spins: [],
        } as AdditionalMatchInfo;

        for (const map of match.maps) {
            if (map.selectionType === "Ban" || map.state !== "Complete") {
                result.spinTimes.push(-1);
                result.mapWinners.push(null);
                result.spins.push(null);
                continue;
            }

            if (map.winnerDiscordId === match.competitors[0].discordId) {
                result.mapWinners.push(WinningPlayer.PLAYER_ONE);
            } else if (map.winnerDiscordId === match.competitors[1].discordId) {
                result.mapWinners.push(WinningPlayer.PLAYER_TWO);
            } else {
                result.mapWinners.push(WinningPlayer.DRAW);
            }

            let spinTime = competition?.matchTimeoutTime ?? -1;
            if (map.mapStartedAt != null) {
                const startingTime = DateTime.fromISO(map.mapStartedAt);
                if (map.winnerFinishedAt != null) {
                    const endingTime = DateTime.fromISO(map.winnerFinishedAt);
                    spinTime = Math.floor(
                        Math.abs(startingTime.diff(endingTime).as("seconds")),
                    );
                } else if (
                    map.resultVerifiedAt != null &&
                    ld.last(result.mapWinners) !== WinningPlayer.DRAW
                ) {
                    const endingTime = DateTime.fromISO(map.resultVerifiedAt);
                    spinTime = Math.floor(
                        Math.abs(startingTime.diff(endingTime).as("seconds")),
                    );
                }
            }
            result.spinTimes.push(spinTime);

            const spin = {
                mission: {
                    slug: map.mapSlug,
                    publicIdPrefix: -1,
                    targets: getMapBySlug(map.mapSlug)!.targets,
                },
                targetConditions: [],
                additionalObjectives: [],
            } as Spin;
            for (const target of JSON.parse(map.mapJson) as HitmapsMapJson[]) {
                if (target.type !== "KILL") {
                    logger.warn(`Non-kill target received: ${target.type}`);
                }
                delete target.type;
                delete target.killMethod.chosen;
                delete target.disguise.chosen;
                spin.targetConditions.push(target);
            }
            result.spins.push(spin);
        }

        return result;
    }

    private static async handleMatch(
        match: HitmapsTournamentMatch,
        additionalInfo: AdditionalMatchInfo,
        tournamentSlug: string,
        competition: Competition | null,
    ): Promise<Match> {
        const newMatch = new Match();
        newMatch.hitmapsMatchId = match.rrstatsLookupId!;
        newMatch.timestamp = DateTime.fromISO(
            match.matchScheduledAt,
        ).toMillis();
        newMatch.playerOne = await this.createOrFindPlayer(
            match.competitors[0].discordId,
            match.competitors[0].challongeName.trim(),
            match.competitors[0].countryCode,
        );
        newMatch.playerTwo = await this.createOrFindPlayer(
            match.competitors[1].discordId,
            match.competitors[1].challongeName.trim(),
            match.competitors[1].countryCode,
        );

        let playerOneScore = 0;
        let playerTwoScore = 0;
        const picks: PlayedMap[] = [];
        const bans: RRBannedMap[] = [];

        for (const mapIndex in match.maps) {
            const map = match.maps[mapIndex];

            if (
                parseInt(mapIndex) >=
                Math.min(
                    additionalInfo.mapWinners.length,
                    additionalInfo.spinTimes.length,
                    additionalInfo.spins.length,
                )
            ) {
                break;
            }

            let picker = ChoosingPlayer.RANDOM;
            if (map.competitorName === match.competitors[0].challongeName) {
                picker = ChoosingPlayer.PLAYER_ONE;
            } else if (
                map.competitorName === match.competitors[1].challongeName
            ) {
                picker = ChoosingPlayer.PLAYER_TWO;
            }

            if (map.selectionType === "Ban") {
                bans.push({
                    map:
                        (getMapBySlug(map.mapSlug)?.map as HitmanMap) ??
                        HitmanMap.PARIS,
                    picked: picker,
                });
            } else if (
                map.selectionType === "Pick" ||
                map.selectionType === "Random"
            ) {
                if (map.state !== "Complete" && map.state !== "") {
                    continue;
                }

                if (
                    additionalInfo.mapWinners[mapIndex] ===
                    WinningPlayer.PLAYER_ONE
                ) {
                    playerOneScore += 2;
                } else if (
                    additionalInfo.mapWinners[mapIndex] ===
                    WinningPlayer.PLAYER_TWO
                ) {
                    playerTwoScore += 2;
                } else {
                    playerOneScore += 1;
                    playerTwoScore += 1;
                }

                const dbMap = new PlayedMap();
                dbMap.map =
                    (getMapBySlug(map.mapSlug)?.map as HitmanMap) ??
                    HitmanMap.PARIS;
                dbMap.winner = additionalInfo.mapWinners[mapIndex]!;
                dbMap.picked = picker;
                dbMap.spin = additionalInfo.spins[mapIndex]!;
                dbMap.timeTaken = additionalInfo.spinTimes[mapIndex];
                dbMap.index = picks.length;
                await dbMap.save();

                picks.push(dbMap);
            }
        }

        newMatch.playedMaps = picks;
        newMatch.bannedMaps = bans;
        newMatch.playerOneScore = playerOneScore;
        newMatch.playerTwoScore = playerTwoScore;
        newMatch.competition = tournamentSlug;
        newMatch.round = "";
        if (match.round != null) {
            if (match.round < 0) {
                newMatch.round = `LB Round ${-match.round}`;
            } else {
                newMatch.round = `Round ${match.round}`;
            }
        }

        if (competition?.groupsConfig != null) {
            const group = competition.groupsConfig.groups.find((group) => {
                return (
                    group.players.includes(newMatch.playerOne) &&
                    group.players.includes(newMatch.playerTwo)
                );
            });
            if (group != null) {
                const matchCount = await Match.countBy({
                    competition: competition.tag,
                    playerOne: newMatch.playerOne,
                    playerTwo: newMatch.playerTwo,
                });
                if (
                    matchCount <=
                    competition.groupsConfig.matchesBetweenPlayers - 1
                ) {
                    newMatch.round = group.groupName;
                }
            }
        }

        if (match.platform !== "All") {
            newMatch.platform = match.platform;
        }

        return newMatch;
    }

    private static filterAndSort(
        matches: HitmapsTournamentMatch[],
        existingMatches: Match[],
    ): {
        matchId: GameModeMatchIdHitmapsTournamentMatch[];
        newVersion: NewHitmapsTournamentMatch[];
    } {
        const result = {
            matchId: [] as GameModeMatchIdHitmapsTournamentMatch[],
            newVersion: [] as NewHitmapsTournamentMatch[],
        };

        const existingMatchIds = existingMatches.map((m) => m.hitmapsMatchId);

        const remainingMatches = matches.filter(
            (v) => !existingMatchIds.includes(v.rrstatsLookupId!),
        );

        for (const match of remainingMatches) {
            const filteredMaps = match.maps.filter((map) => {
                return map.selectionType !== "Ban" && map.state === "Complete";
            });

            if (
                filteredMaps.length > 0 &&
                filteredMaps.every((map) => {
                    return map.mapStartedAt != null && map.mapJson != null;
                })
            ) {
                result.newVersion.push(match as NewHitmapsTournamentMatch);
                continue;
            }

            if (
                match.gameModeMatchId != null &&
                match.gameModeMatchId !== "00000000-0000-0000-0000-000000000000"
            ) {
                result.matchId.push(
                    match as GameModeMatchIdHitmapsTournamentMatch,
                );
            }
        }

        result.matchId.sort((a, b) => {
            return DateTime.fromISO(a.matchScheduledAt)
                .diff(DateTime.fromISO(b.matchScheduledAt))
                .as("milliseconds");
        });
        result.newVersion.sort((a, b) => {
            return DateTime.fromISO(a.matchScheduledAt)
                .diff(DateTime.fromISO(b.matchScheduledAt))
                .as("milliseconds");
        });

        return result;
    }
}
