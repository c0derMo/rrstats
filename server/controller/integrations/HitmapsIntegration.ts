import axios from "axios";
import { Match } from "../../model/Match";
import { Player } from "../../model/Player";
import { In } from "typeorm";
import { DateTime } from "luxon";
import { HitmanMap, getMapBySlug } from "../../../utils/mapUtils";
import {
    Spin,
    RRMap,
    WinningPlayer,
    ChoosingPlayer,
    RRBannedMap,
} from "~/utils/interfaces/IMatch";
import { Competition } from "~/server/model/Competition";
import { IGroup } from "~/utils/interfaces/ICompetition";

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
    gameModeMatchId: string;
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
    }[];
    platform: string;
    round: number | null;
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

export default class HitmapsIntegration {
    private static cache: Record<string, number> = {};
    private static promises: Record<string, Promise<void>> = {};

    static async updateHitmapsTournament(
        hitmapsSlug: string,
        competitionSlug: string,
    ): Promise<void> {
        if (
            this.cache[hitmapsSlug] !== undefined &&
            this.promises[hitmapsSlug] === undefined
        ) {
            if (Date.now() - this.cache[hitmapsSlug] < 90000) {
                // Cache is too old
                return;
            }
        }

        if (this.promises[hitmapsSlug] === undefined) {
            this.promises[hitmapsSlug] = new Promise((resolve) => {
                this._updateHitmapsTournament(hitmapsSlug, competitionSlug)
                    .catch((e: Error) => {
                        console.log(
                            `Error trying to fetch data from hitmaps: ${e.message}`,
                        );
                    })
                    .finally(() => {
                        delete this.promises[hitmapsSlug];
                        resolve();
                    });
            });
        }

        return this.promises[hitmapsSlug];
    }

    static async _updateHitmapsTournament(
        hitmapsSlug: string,
        competitionSlug: string,
    ): Promise<void> {
        const request = await axios.get<{ matches: HitmapsTournamentMatch[] }>(
            `https://tournamentsapi.hitmaps.com/api/events/${hitmapsSlug}/statistics?statsKey=MatchHistory`,
        );
        if (request.status !== 200) {
            // Error out somehow
            return;
        }

        await this.parseHitmapsTournament(
            request.data.matches,
            competitionSlug,
        );
        this.cache[hitmapsSlug] = Date.now();
    }

    private static async fetchHitmapsMatches(
        hitmapsMatchIds: string[],
    ): Promise<HitmapsMatch[]> {
        if (hitmapsMatchIds.length > 200) {
            const listOne = hitmapsMatchIds.slice(0, 200);
            const listTwo = hitmapsMatchIds.slice(200);
            return (await this.fetchHitmapsMatches(listOne)).concat(
                await this.fetchHitmapsMatches(listTwo),
            );
        }
        const listOfMatches = hitmapsMatchIds.join(",");
        const req = await axios.get<{ matches: HitmapsMatch[] }>(
            `https://rouletteapi.hitmaps.com/api/match-history?matchIds=${listOfMatches}`,
        );
        return req.data.matches;
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
        console.log("Creating new player " + primaryName);
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
        // Avoid adding duplicate matches
        const existingMatches = await Match.find({
            where: {
                hitmapsMatchId: In(matches.map((m) => m.gameModeMatchId)),
            },
            select: ["hitmapsMatchId"],
        });

        if (existingMatches.length === matches.length) {
            // We already have all matches, no new ones were added
            return;
        }

        const matchesToQuery = matches
            .filter(
                (rawMatch) =>
                    rawMatch.gameModeMatchId !==
                    "00000000-0000-0000-0000-000000000000",
            )
            .filter((rawMatch) => {
                return !existingMatches.some(
                    (m) => m.hitmapsMatchId === rawMatch.gameModeMatchId,
                );
            });

        if (matchesToQuery.length <= 0) {
            return;
        }

        const hitmapsMatches = await this.fetchHitmapsMatches(
            matchesToQuery.map((m) => m.gameModeMatchId),
        );

        const competition = await Competition.findOneBy({
            tag: tournamentSlug,
        });

        matchesToQuery.sort((a, b) => {
            return DateTime.fromISO(a.matchScheduledAt)
                .diff(DateTime.fromISO(b.matchScheduledAt))
                .as("milliseconds");
        });

        for (const newMatch of matchesToQuery) {
            const fullMatch = hitmapsMatches.find(
                (m) => m.matchupId === newMatch.gameModeMatchId,
            );
            if (!fullMatch)
                throw new Error(
                    "Got Hitmaps tournament match without detailed information",
                );

            const match = new Match();
            match.hitmapsMatchId = newMatch.gameModeMatchId;
            match.timestamp = DateTime.fromISO(
                newMatch.matchScheduledAt,
            ).toMillis();

            // Figuring out players
            const playerOne = {
                name: fullMatch.participants[0].name.trim(),
                discordId: "",
            };
            const playerTwo = {
                name: fullMatch.participants[1].name.trim(),
                discordId: "",
            };
            playerOne.discordId = newMatch.competitors.find(
                (c) => c.challongeName.trim() === playerOne.name,
            )!.discordId;
            playerTwo.discordId = newMatch.competitors.find(
                (c) => c.challongeName.trim() === playerTwo.name,
            )!.discordId;
            match.playerOne = await this.createOrFindPlayer(
                playerOne.discordId,
                playerOne.name,
            );
            match.playerTwo = await this.createOrFindPlayer(
                playerTwo.discordId,
                playerTwo.name,
            );

            let p1Score = 0;
            let p2Score = 0;
            const picks: RRMap[] = [];
            const bans: RRBannedMap[] = [];

            for (const map of fullMatch.mapSelections) {
                if (!map.complete) continue;

                let winner = WinningPlayer.DRAW;
                if (map.winnerName === fullMatch.participants[0].name) {
                    winner = WinningPlayer.PLAYER_ONE;
                    p1Score += 2;
                } else if (map.winnerName === fullMatch.participants[1].name) {
                    winner = WinningPlayer.PLAYER_TWO;
                    p2Score += 2;
                } else {
                    p1Score += 1;
                    p2Score += 1;
                }

                let pickedBy = ChoosingPlayer.RANDOM;
                if (map.chosenByName === fullMatch.participants[0].name)
                    pickedBy = ChoosingPlayer.PLAYER_ONE;
                if (map.chosenByName === fullMatch.participants[1].name)
                    pickedBy = ChoosingPlayer.PLAYER_TWO;


                let spinTime = -1;
                if (map.mapStartedAt != null) {
                    const startingTime = DateTime.fromISO(map.mapStartedAt);
                    if (map.winnerFinishedAt != null) {
                        const endingTime = DateTime.fromISO(map.winnerFinishedAt);
                        spinTime = Math.abs(startingTime.diff(endingTime).as('seconds'));
                    } else if (map.resultVerifiedAt != null) {
                        const endingTime = DateTime.fromISO(map.resultVerifiedAt);
                        spinTime = Math.abs(startingTime.diff(endingTime).as('seconds'));
                    }
                }

                picks.push({
                    map: getMapBySlug(map.hitmapsSlug)?.map ?? HitmanMap.PARIS,
                    winner,
                    picked: pickedBy,
                    spin: map.spin,
                    timeTaken: spinTime
                });
            }

            for (const map of newMatch.maps) {
                if (map.selectionType !== "Ban") continue;

                let picked = ChoosingPlayer.RANDOM;
                if (map.competitorId === newMatch.competitors[0].id)
                    picked = ChoosingPlayer.PLAYER_ONE;
                if (map.competitorId === newMatch.competitors[1].id)
                    picked = ChoosingPlayer.PLAYER_TWO;

                bans.push({
                    map: getMapBySlug(map.mapSlug)?.map ?? HitmanMap.PARIS,
                    picked,
                });
            }

            match.playedMaps = picks;
            match.bannedMaps = bans;
            match.playerOneScore = p1Score;
            match.playerTwoScore = p2Score;

            match.competition = tournamentSlug;
            match.round = "";
            if (newMatch.round !== null && newMatch.round !== undefined) {
                if (newMatch.round < 0) {
                    match.round = `LB Round ${-newMatch.round}`;
                } else {
                    match.round = `Round ${newMatch.round}`;
                }
            }

            if (competition?.groupsConfig != null) {
                let playersGroup: IGroup | null = null;
                for (const group of competition.groupsConfig.groups) {
                    if (
                        group.players.includes(match.playerOne) &&
                        group.players.includes(match.playerTwo)
                    ) {
                        playersGroup = group;
                    }
                }
                if (playersGroup != null) {
                    const matchCount = await Match.countBy({
                        competition: competition.tag,
                        playerOne: match.playerOne,
                        playerTwo: match.playerTwo,
                    });
                    if (
                        matchCount <=
                        competition.groupsConfig.matchesBetweenPlayers - 1
                    ) {
                        match.round = playersGroup.groupName;
                    }
                }
            }

            if (newMatch.platform !== "All") {
                match.platform = newMatch.platform;
            }

            await match.save();
        }
    }
}
